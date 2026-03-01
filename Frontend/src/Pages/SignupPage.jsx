import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Signup() {
  const { sendSignupOtp, signupWithOtp } = useAuth();
  const nav = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [emailid, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const onSendOtp = async () => {
    setErr("");
    setMsg("");
    setSendingOtp(true);
    try {
      await sendSignupOtp(emailid);
      setOtpSent(true);
      setMsg("OTP sent to your email. It is valid for 5 minutes.");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!otpSent) return setErr("Please send and enter email OTP.");
    setLoading(true);
    try {
      await signupWithOtp(firstname, emailid, password, otp);
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
        {msg ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {msg}
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
            <div className="mt-1 flex gap-2">
              <input
                value={emailid}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
                placeholder="you@example.com"
              />
              <button
                type="button"
                onClick={onSendOtp}
                disabled={sendingOtp || !emailid}
                className="h-11 shrink-0 rounded-2xl border border-white/10 bg-white/10 px-4 text-xs font-semibold text-slate-100 disabled:opacity-60"
              >
                {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
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

          <div>
            <label className="text-xs text-slate-300">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <button
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Create account with OTP"}
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
