import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import useAuth from "../../auth/useAuth";
import UserMenu from "./UserMenu";

export default function Actions({ onMobileSearch, showSearch = true }) {
  const { user, booting, authStatus } = useAuth(); 
  // agar authStatus nahi hai tumhare hook me, to use hata dena (neeche alt diya hai)

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

      {/* Loading */}
      {booting ? (
        <div className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" />
      ) : !user && (authStatus ? authStatus === "unauthenticated" : true) ? (
        // Not logged in
        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      ) : (
        // Logged in
        <UserMenu />
      )}
    </div>
  );
}