import SubmissionsTab from "../../Pages/SubmissionTab";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ChatAI from "../ChatAI";

export default function ProblemLeft({ problem, currentCode = "", currentLanguage = "cpp" }) {
  const { id } = useParams();
  const [tab, setTab] = useState("Description");

  const tabs = ["Description", "Editorial", "Solutions", "Submissions", "ChatAI"];

  const difficultyPill = useMemo(() => {
    const d = String(problem?.difficulty || "").toLowerCase();
    if (d === "easy") return "bg-green-500/15 text-green-400 border-green-500/25";
    if (d === "medium") return "bg-yellow-500/15 text-yellow-300 border-yellow-500/25";
    if (d === "hard") return "bg-red-500/15 text-red-400 border-red-500/25";
    return "bg-white/10 text-slate-200 border-white/10";
  }, [problem?.difficulty]);
  return (
    <div className="h-[72vh] flex flex-col">
      {/* Top Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "text-sm px-3 py-1.5 rounded-lg transition border",
                tab === t
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            Problem
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {tab === "Description" && (
          <div>
            {/* Title + Difficulty */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
                  {problem?.title || "Problem"}
                </h1>

                {/* Tag (your schema has single tag string) */}
                <div className="mt-2 text-xs text-slate-400">
                  Tag:{" "}
                  <span className="text-slate-200">
                    {problem?.tags || "—"}
                  </span>
                </div>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                  difficultyPill,
                ].join(" ")}
              >
                {problem?.difficulty || "—"}
              </span>
            </div>

            {/* Description */}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Description
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                {problem?.description || "No description"}
              </p>
            </div>

            {/* Visible Testcases */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">
                  Visible Testcases
                </h3>
                <span className="text-xs text-slate-500">
                  Total: {problem?.visibletestcases?.length || 0}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {(problem?.visibletestcases || []).map((tc, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        Case {idx + 1}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Visible
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] text-slate-500 mb-1">
                          Input
                        </div>
                        <pre className="text-xs text-slate-200 whitespace-pre-wrap">
                          {tc?.input || ""}
                        </pre>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] text-slate-500 mb-1">
                          Expected Output
                        </div>
                        <pre className="text-xs text-slate-200 whitespace-pre-wrap">
                          {tc?.output || ""}
                        </pre>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-[11px] text-slate-500 mb-1">
                        Explanation
                      </div>
                      <pre className="text-xs text-slate-200 whitespace-pre-wrap">
                        {tc?.explanation || "—"}
                      </pre>
                    </div>
                  </div>
                ))}

                {(problem?.visibletestcases || []).length === 0 && (
                  <div className="text-sm text-slate-400">
                    No visible testcases available.
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">
                Note: <span className="text-slate-300">Login </span> to view
                the description. <span className="text-slate-300">Login</span>{" "}
                to run or submission.
              </div>
            </div>
          </div>
        )}

        {tab === "ChatAI" && (
          <div>
            <ChatAI problem={problem} currentCode={currentCode} currentLanguage={currentLanguage} />
          </div>
        )}

        {tab !== "Description" && tab !== "ChatAI" && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-slate-200 font-semibold">{tab}</div>

            {tab === "Editorial" &&
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mt-2 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                  {problem?.Editorial || "No Editorial"}
                </p>
              </div>}

            {tab === "Solutions" &&
              <div className="divide-y divide-slate-700 rounded-lg border border-slate-700 overflow-hidden">
                {problem?.refsolution?.length > 0 ? (
                  problem.refsolution.map((item, index) => (
                    <details key={index} className="group bg-slate-900/40">
                      <summary className="cursor-pointer list-none px-4 py-3 hover:bg-slate-800/40 transition flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {item.language}
                        </span>
                        <span className="text-slate-400 transition-transform group-open:rotate-180">
                          ▾
                        </span>
                      </summary>

                      <div className="px-4 pb-4">
                        <p className="mt-2 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                          {item.solution || "No Solution"}
                        </p>
                      </div>
                    </details>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">No Solutions Available</p>
                )}
              </div>}

            {/* Helpful hint */}
            {tab === "Submissions" && <SubmissionsTab pid={id} />}
          </div>
        )}
      </div>
    </div>
  );
}
