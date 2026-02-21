import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function TestcaseEditor({ title, value = [], onChange }) {
  const add = () => onChange([...(value || []), { input: "", output: "" }]);

  const update = (idx, key, v) => {
    const next = value.map((t, i) => (i === idx ? { ...t, [key]: v } : t));
    onChange(next);
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/20 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-800">{title}</div>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          type="button"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(value || []).map((tc, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500">#{idx + 1}</div>
              <button
                onClick={() => remove(idx)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                type="button"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">Input</div>
                <textarea
                  value={tc.input}
                  onChange={(e) => update(idx, "input", e.target.value)}
                  className="mt-2 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. 5\n1 2 3 4 5"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Output</div>
                <textarea
                  value={tc.output}
                  onChange={(e) => update(idx, "output", e.target.value)}
                  className="mt-2 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. 15"
                />
              </div>
            </div>
          </div>
        ))}

        {(!value || value.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No testcases yet. Click <span className="font-semibold">Add</span>.
          </div>
        )}
      </div>
    </div>
  );
}