import { useMemo } from "react";
import Editor from "@monaco-editor/react";

const LANGS = [
  { label: "cpp", value: "cpp", monaco: "cpp" },
  { label: "Java", value: "java", monaco: "java" },
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "Python", value: "python", monaco: "python" },
];

export default function CodeRight({
  language,
  setLanguage,
  code,
  setCode,
  onRun,
  onSubmit,
  running,
  submitting,
}) {
  const monacoLang = useMemo(() => {
    return LANGS.find((l) => l.value === language)?.monaco || "javascript";
  }, [language]);

  return (
    <div className="h-[72vh] flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Code</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="ml-2 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-slate-200 outline-none"
          >
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={running || submitting}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
          >
            {running ? "Running..." : "Run"}
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting || running}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(v) => setCode(v || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}