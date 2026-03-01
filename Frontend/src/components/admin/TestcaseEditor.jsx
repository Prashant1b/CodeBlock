import React from "react";

const emptyTC = { input: "", output: "", explanation: "" };

export default function TestcaseEditor({ title, value = [], onChange }) {
  const isVisible = String(title || "").toLowerCase().includes("visible");
  const list = Array.isArray(value) ? value : [];

  const add = () => {
    // Visible testcases: include explanation field
    // Hidden testcases: explanation will be ignored in payload anyway
    onChange([...(list || []), { ...emptyTC }]);
  };

  const remove = (idx) => {
    const next = (list || []).filter((_, i) => i !== idx);
    onChange(next);
  };

  const update = (idx, key, val) => {
    const next = (list || []).map((tc, i) => (i === idx ? { ...tc, [key]: val } : tc));
    onChange(next);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/20 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-800">{title}</div>

          {isVisible ? (
            <p className="mt-1 text-xs text-slate-500">
              Explanation is shown to students (Run / Visible testcases).
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Hidden testcases are used for final evaluation only.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={add}
          className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="text-sm text-slate-500">No testcases yet. Click Add.</div>
        ) : (
          list.map((tc, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500">Testcase #{idx + 1}</div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Input</label>
                  <textarea
                    value={tc?.input ?? ""}
                    onChange={(e) => update(idx, "input", e.target.value)}
                    className="mt-2 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder={`Example:\nneedle\nhaystack`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Output</label>
                  <textarea
                    value={tc?.output ?? ""}
                    onChange={(e) => update(idx, "output", e.target.value)}
                    className="mt-2 min-h-[70px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g. 2"
                  />
                </div>

                {isVisible && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Explanation</label>
                    <textarea
                      value={tc?.explanation ?? ""}
                      onChange={(e) => update(idx, "explanation", e.target.value)}
                      className="mt-2 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Explain why this output is correct..."
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}