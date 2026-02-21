import React from "react";
import { ArrowRight } from "lucide-react";

export default function CardAction({ icon: Icon, title, desc, colorClass, toText, onClick }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5">
      <div className={`h-1 w-full rounded-full ${colorClass}`} />
      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>

        <div className="min-w-0">
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>

          <button
            onClick={onClick}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            type="button"
          >
            {toText} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}