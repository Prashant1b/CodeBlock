// src/components/header/Brand.jsx
import React from "react";
import { Link } from "react-router";
import { Code2 } from "lucide-react";

export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_10px_30px_rgba(245,158,11,0.25)]">
        <Code2 className="text-slate-950" size={18} />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">CodeBlock</div>
        <div className="text-[11px] text-slate-300/70 -mt-0.5">
          Practice & Compete
        </div>
      </div>
    </Link>
  );
}
