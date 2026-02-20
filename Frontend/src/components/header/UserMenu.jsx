import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import useAuth from "../../auth/useAuth";

function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    return user?.firstname || user?.emailid || "User";
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white hover:bg-white/10"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-300 font-semibold">
          {initials(user?.firstname || user?.emailid)}
        </span>
        <span className="hidden sm:block max-w-[140px] truncate text-slate-200/90">
          {label}
        </span>
        <ChevronDown size={16} className="opacity-80" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <User size={16} /> Profile
            </Link>

            <button
              onClick={async () => {
                await logout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
