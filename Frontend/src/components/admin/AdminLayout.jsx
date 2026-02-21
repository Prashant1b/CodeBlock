import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import { LayoutDashboard, FileText } from "lucide-react";

const linkBase =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition";
const linkInactive = "text-slate-600 hover:bg-slate-100";
const linkActive = "bg-slate-900 text-white shadow";

export default function AdminLayout({ userName, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <AdminTopbar userName={userName} onLogout={onLogout} />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-slate-200/60 bg-white/20  p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="px-2 pb-2 text-xs font-bold tracking-wider text-slate-500">
            NAVIGATION
          </div>

          <nav className="flex flex-col gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/problems"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <FileText className="h-4 w-4" />
              Problem Management
            </NavLink>
          </nav>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-bold text-slate-700">System Status</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <Outlet />
          <footer className="mt-10 flex items-center justify-between text-xs text-slate-500">
            <div className="font-semibold">Code Block Admin</div>
            <div>v1.0.0 • Built with precision</div>
          </footer>
        </main>
      </div>
    </div>
  );
}