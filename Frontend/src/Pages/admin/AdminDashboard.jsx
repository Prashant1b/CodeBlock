import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, PlusCircle, Users, Trophy } from "lucide-react";
import CardAction from "../../components/admin/CardAction";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="rounded-3xl border border-slate-200/60 bg-white/20 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-indigo-200 bg-white/20 px-4 py-2 text-xs font-bold tracking-wider text-indigo-700">
          WELCOME BACK
        </div>

        <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-slate-900">
          Manage Everything <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            In One Place
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          Complete control over problems, testcases, tags, and reference solutions.
          Create, update, and maintain your Code Bloack problem bank.
        </p>
      </section>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <CardAction
          icon={FileText}
          title="Problem Management"
          desc="List, edit, and delete existing problems with pagination."
          colorClass="bg-gradient-to-r from-indigo-500 to-blue-500"
          toText="Open"
          onClick={() => navigate("/admin/problems")}
        />
       <CardAction
  icon={Users}
  title="All Users"
  desc="View all users and change roles (admin/user)."
  colorClass="bg-gradient-to-r from-emerald-500 to-teal-500"
  toText="Open"
  onClick={() => navigate("/admin/users")}
/>
        <CardAction
          icon={PlusCircle}
          title="Create New Problem"
          desc="Add a new coding question with visible & hidden testcases."
          colorClass="bg-gradient-to-r from-purple-500 to-pink-500"
          toText="Create"
          onClick={() => navigate("/admin/problems/new")}
        />
        <CardAction
          icon={Trophy}
          title="Contest Management"
          desc="Create contests and assign problems for live rankings."
          colorClass="bg-gradient-to-r from-amber-500 to-orange-500"
          toText="Open"
          onClick={() => navigate("/admin/contests")}
        />
      </div>
    </div>
  );
}
