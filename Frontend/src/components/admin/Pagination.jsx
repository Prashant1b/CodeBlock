import React from "react";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
        type="button"
      >
        Prev
      </button>

      <div className="text-sm font-semibold text-slate-300">
        Page <span className="text-white">{page}</span> / {totalPages || 1}
      </div>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
        type="button"
      >
        Next
      </button>
    </div>
  );
}
