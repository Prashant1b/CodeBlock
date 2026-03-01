import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function AdminTopbar({ userName = "Admin" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-cyan-100/10 bg-[#08101f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900 shadow-[0_12px_30px_rgba(16,185,129,0.35)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-wide text-slate-100">CodeBlock Admin</div>
            <div className="text-[11px] text-slate-400">Operations Console</div>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-100">{userName}</div>
            <div className="text-[11px] text-emerald-300">Session active</div>
          </div>
        </div>
      </div>
    </header>
  );
}
