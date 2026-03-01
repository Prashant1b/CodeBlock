import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock3, Flag, Trophy } from 'lucide-react';
import { contestApi } from '../api/contest.api';

const card = 'rounded-2xl border border-white/10 bg-[#0d1628]/85 shadow-[0_20px_70px_rgba(0,0,0,.32)]';

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  const [exitingContest, setExitingContest] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [contestRes, boardRes] = await Promise.all([
        contestApi.getById(id),
        contestApi.leaderboard(id),
      ]);
      setContest(contestRes.data);
      setLeaderboard(boardRes.data?.leaderboard || []);

      try {
        const partRes = await contestApi.me(id);
        setParticipation(partRes.data || null);
      } catch {
        setParticipation(null);
      }
    } catch (e) {
      setError(String(e?.response?.data || 'Unable to load contest'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const requestFullscreen = async () => {
    if (document.fullscreenElement || !document.documentElement?.requestFullscreen) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // browser may block fullscreen without a direct user gesture
    }
  };

  const onExitContest = async () => {
    if (exitingContest) return;
    setExitingContest(true);
    try {
      await contestApi.exit(id);
    } catch {
      // best effort
    } finally {
      setParticipation((prev) => ({ ...(prev || {}), hasExited: true, isDisqualified: true }));
      navigate('/contest', { replace: true });
    }
  };

  useEffect(() => {
    if (!participation || participation?.hasExited || participation?.isDisqualified) return undefined;

    const onFullscreenChange = async () => {
      if (document.fullscreenElement) {
        setFullscreenBlocked(false);
        return;
      }
      setFullscreenBlocked(true);
      await requestFullscreen();
    };

    const onPopState = () => {
      window.history.pushState({ contestGuard: true }, '', window.location.href);
    };

    requestFullscreen();
    window.history.pushState({ contestGuard: true }, '', window.location.href);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('popstate', onPopState);

    const retry = setInterval(() => {
      if (!document.fullscreenElement) {
        setFullscreenBlocked(true);
        requestFullscreen();
      } else {
        setFullscreenBlocked(false);
      }
    }, 1000);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('popstate', onPopState);
      clearInterval(retry);
    };
  }, [participation, id, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-slate-300">Loading contest...</div>;
  }

  if (!contest) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-red-200">{error || 'Contest not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-[#060c17] text-slate-100">
      {fullscreenBlocked ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_28px_80px_rgba(0,0,0,.55)]">
            <h3 className="text-lg font-semibold text-white">Fullscreen Required</h3>
            <p className="mt-2 text-sm text-slate-300">
              Contest can continue only in fullscreen. Click below to resume fullscreen mode.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onExitContest}
                disabled={exitingContest}
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 disabled:opacity-60"
              >
                {exitingContest ? 'Exiting...' : 'Exit Contest'}
              </button>
              <button
                type="button"
                onClick={requestFullscreen}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-100"
              >
                Resume Fullscreen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a]/85 via-[#111827]/80 to-[#0b1220]/85 p-6 shadow-[0_28px_100px_rgba(0,0,0,.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <Trophy size={14} /> Contest Overview
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{contest.title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">{contest.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-300">
              <p className="inline-flex items-center gap-1"><Clock3 size={13} /> Start: {new Date(contest.startTime).toLocaleString()}</p>
              <p className="mt-1 inline-flex items-center gap-1"><Flag size={13} /> End: {new Date(contest.endTime).toLocaleString()}</p>
              <p className="mt-2 font-semibold text-white">Status: {contest.status}</p>
            </div>
          </div>

          {participation ? (
            participation?.hasExited ? (
              <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                You exited this contest. Re-entry is not allowed.
              </div>
            ) : participation?.isDisqualified ? (
              <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                You are disqualified from this contest.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0a1120] px-3 py-2 text-sm text-slate-200">
                Entry confirmed. Click any problem below to open solve page.
              </div>
            )
          ) : (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Join contest from Contest page using `Join Now`.
            </div>
          )} 

          {error ? <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className={`${card} p-4`}>
            <h2 className="text-base font-semibold text-white">Problems</h2>
            <p className="mt-1 text-xs text-slate-400">
              {participation?.hasExited
                ? 'You exited this contest. Problem access is locked.'
                : participation?.isDisqualified
                ? 'You are disqualified. Problem access is locked.'
                : !participation
                ? 'Join from Contest page to unlock problems.'
                : 'Click a problem to open contest solve page.'}
            </p>
            <div className="mt-4 space-y-3">
              {(contest.problems || []).map((p, idx) => (
                participation?.hasExited || participation?.isDisqualified || !participation ? (
                  <div
                    key={p._id}
                    className="block cursor-not-allowed rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-200">Q{idx + 1}. {p.title}</p>
                      <span className="rounded-full border border-red-300/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-200">
                        Locked
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={p._id}
                    to={`/contest/${id}/problem/${p._id}`}
                    className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-100">Q{idx + 1}. {p.title}</p>
                      <span className="rounded-full border border-sky-300/30 bg-sky-500/10 px-2 py-0.5 text-xs text-sky-200">
                        {p.difficulty}
                      </span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </section>

          <aside className={`${card} p-4`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Leaderboard</h3>
            <p className="mt-1 text-xs text-slate-400">Live contest ranking</p>
            <div className="mt-3 max-h-[60vh] overflow-auto pr-1">
              {!leaderboard.length ? (
                <p className="text-sm text-slate-400">No ranking data yet.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-2">#</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => (
                      <tr key={row.userId} className="border-t border-white/10">
                        <td className="py-2 text-slate-200">{row.rank}</td>
                        <td className="py-2 pr-2 text-slate-200">{row.name}</td>
                        <td className="py-2 text-emerald-300">{row.solved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
