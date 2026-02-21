import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function RefSolutionEditor({ value = [], onChange }) {
  const add = () => onChange([...(value || []), { language: "cpp", solution: "" }]);

  const update = (idx, key, v) => {
    const next = value.map((t, i) => (i === idx ? { ...t, [key]: v } : t));
    onChange(next);
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/20 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-800">Reference Solutions</div>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          type="button"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(value || []).map((s, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-500">#{idx + 1}</div>
              <button
                onClick={() => remove(idx)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                type="button"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
              <div>
                <div className="text-xs font-semibold text-slate-600">Language</div>
                <select
                  value={s.language}
                  onChange={(e) => update(idx, "language", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Solution Code</div>
                <textarea
                  value={s.solution}
                  onChange={(e) => update(idx, "solution", e.target.value)}
                  className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="// reference solution"
                />
              </div>
            </div>
          </div>
        ))}

        {(!value || value.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Add at least 1 reference solution (required).
          </div>
        )}
      </div>
    </div>
  );
}