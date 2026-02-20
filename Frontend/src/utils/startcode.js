export function normalizeLang(lang = "") {
  const l = String(lang).trim().toLowerCase();
  if (l === "c++" || l === "cpp") return "cpp";
  if (l === "js" || l === "javascript") return "javascript";
  if (l === "py" || l === "python" || l === "python3") return "python";
  if (l === "java") return "java";
  return l;
}

export function getInitialCode(problem, language) {
  const sc = problem?.startcode;
  const want = normalizeLang(language);

  if (Array.isArray(sc)) {
    const found = sc.find((x) => normalizeLang(x.language) === want);
    if (found?.initialcode) return found.initialcode;
  }

  return `// Write your ${want} code here\n`;
}