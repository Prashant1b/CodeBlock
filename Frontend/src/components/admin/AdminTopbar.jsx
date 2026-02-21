import React from "react";
import { LogOut, ShieldCheck } from "lucide-react";

export default function AdminTopbar({ userName = "Admin", onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">Admin Panel</div>
            <div className="text-xs text-slate-500">Problem Master Control</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{userName}</div>
            <div className="flex items-center justify-end gap-2 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            type="button"
          >
            Logout <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}