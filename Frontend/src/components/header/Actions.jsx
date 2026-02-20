// src/components/header/Actions.jsx
import React from "react";
import { Link } from "react-router-dom"; // ✅ correct
import { Bell, Search } from "lucide-react";
import useAuth from "../../auth/useAuth";
import UserMenu from "./UserMenu";

export default function Actions({ onMobileSearch }) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Mobile search */}
      <button
        onClick={onMobileSearch}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
      <Link
        to="/premium"
        className="hidden sm:inline-flex h-10 items-center rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 text-sm font-semibold text-amber-300 hover:bg-amber-500/15"
      >
        Premium
      </Link>

      {user ? (
        <UserMenu />
      ) : (
       <Link
  to="/signin"
  className="
    inline-flex shrink-0 items-center justify-center
    h-9 px-1 text-xs rounded-lg
    sm:h-10 sm:px-4 sm:text-sm sm:rounded-xl
    bg-white font-semibold text-slate-950 hover:bg-slate-100
  "
>
  Sign in
</Link>

      )}
    </div>
  );
}
