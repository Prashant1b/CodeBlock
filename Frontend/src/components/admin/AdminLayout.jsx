import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileText, LayoutDashboard, Trophy, Users } from "lucide-react";
import AdminTopbar from "./AdminTopbar";

const linkBase =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition";
const linkInactive = "text-slate-300 hover:bg-white/10";
const linkActive = "bg-white text-slate-900 shadow-[0_10px_26px_rgba(255,255,255,0.22)]";

export default function AdminLayout({ userName }) {
  return (
    <div
      className="min-h-screen bg-[#040a16] text-slate-100"
      style={{ fontFamily: "'Sora', 'Manrope', 'Segoe UI', sans-serif" }}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <AdminTopbar userName={userName} />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-5 px-4 py-6 md:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_70px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <div className="px-2 pb-2 text-xs font-bold tracking-wider text-slate-400">
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

            <NavLink
              to="/admin/contests"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <Trophy className="h-4 w-4" />
              Contest Management
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <Users className="h-4 w-4" />
              User Management
            </NavLink>
          </nav>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c1629]/80 p-3">
            <div className="text-xs font-bold text-slate-300">System Status</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
          <footer className="mt-10 flex items-center justify-between text-xs text-slate-500">
            <div className="font-semibold text-slate-300">CodeBlock Admin</div>
            <div>v1.0.0 | Built with precision</div>
          </footer>
        </main>
      </div>
    </div>
  );
}

