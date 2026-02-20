// src/components/header/SearchBar.jsx
import React from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="hidden md:flex flex-1 justify-center px-2">
      <div className="relative w-full max-w-xl">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300/70"
        />
        <input
          placeholder="Search problems, topics, IDs…"
          className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-slate-400/70 outline-none transition focus:border-amber-400/60 focus:bg-white/7"
        />
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[11px] text-slate-300/50">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
            Ctrl
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
            K
          </span>
        </div>
      </div>
    </div>
  );
}
