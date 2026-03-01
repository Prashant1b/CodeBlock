import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../auth/useAuth";
import {Link} from "react-router-dom"
import { userApi } from "../api/user.api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
 const [solved, setSolved] = useState([]);
const [totalProblems, setTotalProblems] = useState(0);
const [statsErr, setStatsErr] = useState("");
const [solvedLoading, setSolvedLoading] = useState(true);

useEffect(() => {
  (async () => {
    setStatsErr("");
    setErr("");

    try {
      // profile refresh can fail if not logged in; that's fine
      await refreshProfile();
    } catch {}

    const results = await Promise.allSettled([
      userApi.solvedProblems(),  // protected
      userApi.totalProblems(),   // public
    ]);

    // 0 = solvedProblems
    if (results[0].status === "fulfilled") {
      const data = results[0].value?.data;
      setSolved(Array.isArray(data) ? data : []);
    } else {
      const msg =
        results[0].reason?.response?.data?.message ||
        results[0].reason?.message ||
        "Solved problems not loaded (login required).";
      setStatsErr(msg);
      setSolved([]); // safe fallback
    }

    // 1 = totalProblems
    if (results[1].status === "fulfilled") {
      setTotalProblems(results[1].value?.data?.totalProblems || 0);
    } else {
      const msg =
        results[1].reason?.response?.data?.message ||
        results[1].reason?.message ||
        "Total problems not loaded.";
      setStatsErr((prev) => (prev ? prev : msg));
      setTotalProblems(0);
    }

    setSolvedLoading(false);
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const stats = useMemo(() => {
    let easy = 0,
      medium = 0,
      hard = 0;

    for (const p of solved) {
      const d = (p?.difficulty || "").toLowerCase();
      if (d === "easy") easy++;
      else if (d === "medium") medium++;
      else if (d === "hard") hard++;
    }

    return {
      solved: solved.length,
      easy,
      medium,
      hard,
    };
  }, [solved]);

  const initials = useMemo(() => {
    const ch = (user?.firstname || user?.emailid || "U")[0] || "U";
    return ch.toUpperCase();
  }, [user]);

  const recentSolved = useMemo(() => solved.slice(0, 6), [solved]);

  const onDelete = async () => {
    setLoading(true);
    setErr("");
    const toastId = toast.loading("Deleting account...");
    try {
      await userApi.deleteAccount();
      await refreshProfile();
      toast.success("Account deleted", { id: toastId });
    } catch (e) {
      toast.error("Failed to delete account", { id: toastId });
      setErr("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl py-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left: user card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-11 rounded-2xl bg-amber-500/15 text-amber-300 grid place-items-center font-bold text-lg">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="font-semibold text-lg truncate">
                {user?.firstname || "User"}
              </div>
              <div className="text-sm text-slate-300/80 truncate">
                {user?.emailid || "—"}
              </div>
              <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-200/80">
                Role: {user?.role || "user"}
              </div>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          {/* Quick summary */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat label="Solved" value={solvedLoading ? "…" : stats.solved} />
            <MiniStat label="Easy" value={solvedLoading ? "…" : stats.easy} />
            <MiniStat label="Medium" value={solvedLoading ? "…" : stats.medium} />
            <MiniStat label="Hard" value={solvedLoading ? "…" : stats.hard} />
          </div>
<div className="mt-3">
  <Link
    to="/reset-password"
    className="block w-full h-11 text-center leading-[44px]
               rounded-2xl border border-amber-400/30
               bg-amber-500/10 text-amber-200 font-semibold
               hover:bg-amber-500/15 transition"
  >
    Reset Password
  </Link>
</div>
{user?.role === "admin" && (
  <div className="mt-3">
    <Link
      to="/admin"
      className="block w-full h-11 text-center leading-[44px]
                 rounded-2xl border border-indigo-400/30
                 bg-indigo-500/10 text-indigo-200 font-semibold
                 hover:bg-indigo-500/15 transition"
    >
      Go to Admin Panel
    </Link>
  </div>
)}
          <div className="mt-6 space-y-2">
            <button
              disabled={loading}
              onClick={onDelete}
              className="w-full h-11 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-200 font-semibold hover:bg-red-500/15 disabled:opacity-60"
            >
              Delete account
            </button>
          </div>
        </div>

        {/* Right: progress + recent solved */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Progress</h2>
            <div className="text-xs text-slate-300/70">
              {solvedLoading ? "Loading..." : "User Activity"}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Solved" value={stats.solved} />
            <StatCard label="Easy" value={stats.easy} />
            <StatCard label="Medium" value={stats.medium} />
            <StatCard label="Hard" value={stats.hard} />
          </div>

          {/* Recent solved list */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Recently solved</div>
              <div className="text-xs text-slate-300/70">
                {solvedLoading ? "" : `${stats.solved} total`}
              </div>
            </div>

            {solvedLoading ? (
              <div className="mt-3 text-sm text-slate-300/70">Loading solved problems…</div>
            ) : recentSolved.length === 0 ? (
              <div className="mt-3 text-sm text-slate-300/70">
                No solved problems yet.
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentSolved.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.title}</div>
                      <div className="mt-0.5 text-xs text-slate-300/70 truncate">
                        {(Array.isArray(p.tags) ? p.tags.join(", ") : "") || "—"}
                      </div>
                    </div>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-300/70">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <div className="text-[11px] text-slate-300/70">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function DifficultyBadge({ difficulty }) {
  const d = (difficulty || "unknown").toLowerCase();

  const cls =
    d === "easy"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : d === "medium"
      ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
      : d === "hard"
      ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
      : "border-white/10 bg-white/5 text-slate-200/80";

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${cls}`}>
      {difficulty || "—"}
    </span>
  );
}
