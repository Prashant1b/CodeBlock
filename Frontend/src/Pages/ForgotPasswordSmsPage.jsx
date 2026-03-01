import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';

export default function ForgotPasswordSmsPage() {
  const navigate = useNavigate();

  const [emailid, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSendOtp = async () => {
    if (!emailid.trim()) {
      toast.error('Email is required');
      return;
    }
    const id = toast.loading('Sending OTP...');
    try {
      await authApi.sendOtp({ emailid: emailid.trim(), purpose: 'reset' });
      setOtpSent(true);
      toast.success('OTP sent to your email', { id });
    } catch (e) {
      toast.error(String(e?.response?.data?.message || e?.response?.data || 'Failed to send OTP'), { id });
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      toast.error('Send OTP first');
      return;
    }
    if (!otp.trim()) {
      toast.error('OTP is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const id = toast.loading('Resetting password...');
    try {
      await authApi.resetPasswordWithOtp({
        emailid: emailid.trim(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success('Password reset successful', { id });
      navigate('/signin');
    } catch (e) {
      toast.error(String(e?.response?.data?.message || e?.response?.data || 'Reset failed'), { id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <h1 className="text-xl font-semibold">Forgot Password (Email OTP)</h1>
        <p className="mt-1 text-sm text-slate-300/80">
          Enter email, verify OTP, and set new password.
        </p>

        <form onSubmit={onResetPassword} className="mt-5 space-y-3">
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
                className="h-11 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                {otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="6-digit OTP"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="New password"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-amber-400/60"
              placeholder="Confirm password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-300/80">
          Back to{' '}
          <Link to="/signin" className="text-amber-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
