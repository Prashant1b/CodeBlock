import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, PlusCircle, Trophy, Users } from "lucide-react";
import CardAction from "../../components/admin/CardAction";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1b31]/85 via-[#101a2b]/80 to-[#0b1322]/85 p-6 shadow-[0_30px_90px_rgba(0,0,0,.4)]">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold tracking-wider text-cyan-200">
          ADMIN COMMAND CENTER
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          High-Precision
          <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            {" "}
            Operations
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Manage the full platform lifecycle: users, problems, contests, and quality controls from one unified console.
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <CardAction
          icon={FileText}
          title="Problem Management"
          desc="Review, edit, and clean your full problem bank."
          colorClass="bg-gradient-to-r from-cyan-400 to-blue-500"
          toText="Open"
          onClick={() => navigate("/admin/problems")}
        />
        <CardAction
          icon={PlusCircle}
          title="Create Problem"
          desc="Add fresh coding challenges with robust test coverage."
          colorClass="bg-gradient-to-r from-fuchsia-400 to-pink-500"
          toText="Create"
          onClick={() => navigate("/admin/problems/new")}
        />
        <CardAction
          icon={Trophy}
          title="Contest Management"
          desc="Control scheduling, visibility, and participant moderation."
          colorClass="bg-gradient-to-r from-amber-400 to-orange-500"
          toText="Open"
          onClick={() => navigate("/admin/contests")}
        />
        <CardAction
          icon={Users}
          title="User Management"
          desc="Manage user roles and contest participant status."
          colorClass="bg-gradient-to-r from-emerald-400 to-teal-500"
          toText="Open"
          onClick={() => navigate("/admin/users")}
        />
      </div>
    </div>
  );
}

