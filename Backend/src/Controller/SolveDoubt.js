const { GoogleGenAI } = require("@google/genai");

const SYSTEM_INSTRUCTION =
  "You are an expert DSA problem-solving assistant. Answer only DSA/coding-problem related questions. If user asks unrelated questions, politely ask them to ask DSA questions only.";

const toSafeString = (value, fallback = "") =>
  typeof value === "string" ? value : fallback;

const buildPrompt = ({ message, problemContext, currentCode, currentLanguage }) => {
  const safeProblem = problemContext
    ? {
        id: problemContext.id,
        title: toSafeString(problemContext.title),
        difficulty: toSafeString(problemContext.difficulty),
        tags: problemContext.tags,
        description: toSafeString(problemContext.description),
        visibleTestcases: Array.isArray(problemContext.visibleTestcases)
          ? problemContext.visibleTestcases.slice(0, 8)
          : [],
        startCode: Array.isArray(problemContext.startCode)
          ? problemContext.startCode.slice(0, 8)
          : [],
      }
    : null;

  const codeBlock = toSafeString(currentCode).trim();

  return [
    "User question:",
    message,
    "",
    "Problem context (JSON):",
    safeProblem ? JSON.stringify(safeProblem, null, 2) : "No problem context provided.",
    "",
    "Current editor language:",
    toSafeString(currentLanguage, "unknown"),
    "",
    "Current editor code:",
    codeBlock || "No user code provided.",
    "",
    "Provide a concise and practical DSA answer using this context.",
  ].join("\n");
};

const SolveDoubt = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    if (!process.env.AI_KEY) {
      return res.status(500).json({ message: "AI_KEY is missing on server" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.AI_KEY });

    const contents = buildPrompt({
      message,
      problemContext: req.body?.problemContext,
      currentCode: req.body?.currentCode,
      currentLanguage: req.body?.currentLanguage,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const reply = String(response?.text || "").trim();
    return res.status(200).json({ reply: reply || "I could not generate a response right now." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "AI request failed" });
  }
};

module.exports = SolveDoubt;
