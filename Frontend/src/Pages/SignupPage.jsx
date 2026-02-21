import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [emailid, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signup(firstname, emailid, password);
      nav("/profile", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-slate-300/80">
          Start solving and track your progress.
        </p>

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-slate-300">Name</label>
            <input
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="Your name"
            />
          </div>

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
              placeholder="Min 6 characters"
            />
            <p className="mt-1 text-xs text-slate-400">
Password must be at least 8 characters long and include
uppercase, lowercase, number, and special character.
</p>
          </div>

          <button
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-300/80">
          Already have an account?{" "}
          <Link to="/signin" className="text-amber-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
