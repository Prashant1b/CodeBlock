import React, { useMemo, useState } from "react"; 
import { Link, useNavigate, useParams } from "react-router-dom";
 import { Eye, EyeOff, Loader2 } from "lucide-react"; 
 import useAuth from "../auth/useAuth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [show, setShow] = useState(false);


  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (newPassword.length < 6)
      return setErr("Password must be at least 6 characters.");

    if (newPassword !== confirm)
      return setErr("Passwords do not match.");

    try {
      setLoading(true);

      await updatePassword({
        oldPassword,
        newPassword,
      });

      navigate("/signin");
    } catch (error) {
      setErr(error?.message || "Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <h1 className="text-xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-white/60">
            Set a new password for your account.
          </p>

          {err ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-white/70">New password</label>
              <div className="mt-1 flex h-11 items-center rounded-2xl border border-white/10 bg-slate-950/40 px-3 focus-within:border-amber-400/60">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-full w-full bg-transparent text-sm outline-none"
                  placeholder="Min 6 characters"
                 value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/5"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Confirm password</label>
              <input
                type={show ? "text" : "password"}
                autoComplete="new-password"
                className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={ loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-amber-400 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Resetting...
                </span>
              ) : (
                "Reset password"
              )}
            </button>

            <div className="text-center text-sm text-white/60">
              Back to{" "}
              <Link to="/signin" className="text-amber-300 hover:text-amber-200">
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          If your token is expired, request a new reset link.
        </p>
      </div>
    </div>
  );
}
