// src/components/header/MobileMenu.jsx
import React from "react";
import { Link } from "react-router";
import { NAV_LINKS } from "./navConfig";

export default function MobileMenu({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="md:hidden pb-4">
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-2">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={onClose}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            {l.label}
          </Link>
        ))}

        <Link
          to="/explore"
          onClick={onClose}
          className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Explore
        </Link>

        <div className="my-2 border-t border-white/10" />

        <Link
          to="/premium"
          onClick={onClose}
          className="block rounded-xl px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
        >
          Premium
        </Link>
      </div>
    </div>
  );
}
