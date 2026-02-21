import React from "react";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
        type="button"
      >
        Prev
      </button>

      <div className="text-sm font-semibold text-slate-600">
        Page <span className="text-slate-900">{page}</span> / {totalPages || 1}
      </div>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
        type="button"
      >
        Next
      </button>
    </div>
  );
}