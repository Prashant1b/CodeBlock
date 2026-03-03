import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Bot, SendHorizontal, Sparkles, User2 } from "lucide-react";
import { http } from "../api/https";

const chatMemory = new Map();

const seedMessages = [
  {
    role: "assistant",
    text: "Hi, I am your coding assistant. Ask me about approach, edge cases, or time complexity.",
  },
];

const ChatAI = ({ problem, currentCode = "", currentLanguage = "cpp" }) => {
  const { register, handleSubmit, reset } = useForm();
  const problemKey = problem?._id || "global";
  const [messages, setMessages] = useState(() => chatMemory.get(problemKey) || seedMessages);
  const [sending, setSending] = useState(false);

  const problemContext = useMemo(() => {
    if (!problem) return null;

    return {
      id: problem?._id,
      title: problem?.title,
      difficulty: problem?.difficulty,
      tags: problem?.tags,
      description: problem?.description,
      visibleTestcases: (problem?.visibletestcases || []).map((tc) => ({
        input: tc?.input || "",
        output: tc?.output || "",
        explanation: tc?.explanation || "",
      })),
      startCode: (problem?.startcode || []).map((item) => ({
        language: item?.language || "",
        initialcode: item?.initialcode || "",
      })),
    };
  }, [problem]);

  const onsubmit = async (data) => {
    const next = String(data?.message || "").trim();
    if (!next || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: next }]);
    reset();
    setSending(true);

    try {
      const res = await http.post("/ai/chat", {
        message: next,
        problemContext,
        currentCode,
        currentLanguage,
      });
      const reply = String(res?.data?.reply || "").trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply || "I could not generate a response right now.",
        },
      ]);
    } catch (error) {
      const serverMessage =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.message;

      const friendlyError =
        error?.response?.status === 401
          ? "Please login first to use AI chat."
          : serverMessage || "AI is unavailable right now. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", text: friendlyError }]);
    } finally {
      setSending(false);
    }
  };

  const messageEndRef = useRef(null);
  useEffect(() => {
    setMessages(chatMemory.get(problemKey) || seedMessages);
  }, [problemKey]);

  useEffect(() => {
    chatMemory.set(problemKey, messages);
  }, [problemKey, messages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0d1524] to-[#0a1220] text-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/20 text-cyan-200">
            <Bot size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold">CodeBlock AI</p>
            <p className="text-[11px] text-slate-400">Live Assistant</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
          <Sparkles size={12} />
          Active
        </div>
      </header>

      <div className="max-h-[380px] space-y-3 overflow-auto px-4 py-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={`${msg.role}-${idx}`} className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
              <div
                className={`chat-bubble max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-none ${
                  isUser
                    ? "border border-cyan-300/20 bg-cyan-500/15 text-cyan-50"
                    : "border border-white/10 bg-white/[0.05] text-slate-200"
                }`}
              >
                <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold opacity-80">
                  {isUser ? <User2 size={12} /> : <Bot size={12} />}
                  {isUser ? "You" : "AI"}
                </p>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {sending ? (
          <div className="chat chat-start">
            <div className="chat-bubble max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
              AI is typing...
            </div>
          </div>
        ) : null}

        <div ref={messageEndRef} />
      </div>

      <form
        className="border-t border-white/10 bg-[#0b1424] px-4 py-3"
        onSubmit={handleSubmit(onsubmit)}
      >
        <div className="flex items-center gap-2">
          <input
            {...register("message", { required: true, minLength: 2 })}
            placeholder="Ask AI about this problem..."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-white text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Send"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatAI;
