// src/components/header/MobileSearchOverlay.jsx
import React, { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function MobileSearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
            <Search size={18} />
          </span>

          <input
            ref={inputRef}
            placeholder="Search problems, topics, IDs…"
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-slate-400/70 outline-none"
          />

          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-300/70">
          Tip: Search by problem title, tag, or ID.
        </div>
      </div>
    </div>
  );
}
