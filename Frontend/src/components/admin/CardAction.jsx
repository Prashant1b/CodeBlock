import React from "react";
import { ArrowRight } from "lucide-react";

export default function CardAction({
  icon: Icon,
  title,
  desc,
  colorClass,
  toText,
  onClick,
}) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,.3)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/20">
      <div className={`h-1.5 w-full rounded-full ${colorClass}`} />
      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#0b1527]">
          <Icon className="h-5 w-5 text-slate-200" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-wide text-slate-100">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{desc}</p>

          <button
            onClick={onClick}
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
          >
            {toText}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

