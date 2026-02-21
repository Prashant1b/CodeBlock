import React from "react";

function normalizeTags(v) {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string")
    return v
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  return [];
}

export default function TagInput({ value, onChange }) {
  const tagsArr = normalizeTags(value);
  const str = tagsArr.join(", ");

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">Tags</label>

      <input
        value={str}
        onChange={(e) => {
          const next = normalizeTags(e.target.value);
          onChange(next);
        }}
        placeholder="array, dp, math, greedy"
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {tagsArr.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}