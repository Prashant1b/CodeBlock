import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import useAuth from "../../auth/useAuth";
import UserMenu from "./UserMenu";

export default function Actions({ onMobileSearch, showSearch = true }) {
  const { user, booting } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {showSearch && (
        <button
          onClick={onMobileSearch}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
          aria-label="Search"
          type="button"
        >
          <Search size={18} />
        </button>
      )}

      {user ? (
        // Logged in
        <UserMenu />
      ) : (
        // Guest view (show immediately even while backend wakes up)
        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Sign up
          </Link>
          {booting ? (
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" title="Checking session" />
          ) : null}
        </div>
      )}
    </div>
  );
}
