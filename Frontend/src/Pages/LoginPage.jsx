import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { authApi } from "../api/auth.api";

export default function LoginPage() {
  const { login, acceptLogin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [emailid, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState(loc.state?.message || "");

  const from = loc.state?.from || "/problems";

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

  const onSendOtp = async () => {
    setErr("");
    if (!emailid.trim()) {
      setErr("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp({ emailid: emailid.trim(), purpose: "login" });
      setOtpSent(true);
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not send login code.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const response = await authApi.loginWithOtp({ emailid: emailid.trim(), otp: otp.trim() });
      // Keep AuthContext in sync with the session created by OTP login.
      acceptLogin(response.data?.user);
      nav(from, { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.message || "OTP login failed.");
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

        {notice ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div> : null}

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-950/60 p-1 text-sm">
          <button type="button" onClick={() => { setMode("password"); setErr(""); }} className={`rounded-lg py-2 ${mode === "password" ? "bg-white text-slate-950 font-semibold" : "text-slate-300"}`}>Password</button>
          <button type="button" onClick={() => { setMode("otp"); setErr(""); }} className={`rounded-lg py-2 ${mode === "otp" ? "bg-white text-slate-950 font-semibold" : "text-slate-300"}`}>Email OTP</button>
        </div>

        {mode === "password" ? <form onSubmit={onSubmit} className="mt-5 space-y-3">
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

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-amber-300 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form> : <form onSubmit={onOtpSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input value={emailid} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60" placeholder="you@example.com" />
          </div>
          {otpSent && <div>
            <label className="text-xs text-slate-300">6-digit code</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" autoComplete="one-time-code" required className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60" placeholder="Enter code from email" />
          </div>}
          {!otpSent ? <button type="button" onClick={onSendOtp} disabled={loading} className="h-11 w-full rounded-2xl bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-60">{loading ? "Sending code..." : "Send login code"}</button> : <>
            <button disabled={loading} className="h-11 w-full rounded-2xl bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-60">{loading ? "Signing in..." : "Sign in with code"}</button>
            <button type="button" onClick={onSendOtp} disabled={loading} className="w-full text-xs text-amber-300 hover:underline">Resend code</button>
          </>}
        </form>}

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
