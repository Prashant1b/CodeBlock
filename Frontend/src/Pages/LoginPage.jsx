import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [emailid, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const from = loc.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(emailid, password);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-300/80">
          Welcome back. Practice and climb the leaderboard.
        </p>

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              value={emailid}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-300/80">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-amber-300 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
