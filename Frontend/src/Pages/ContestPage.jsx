import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Clock3,
  Lock,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contestApi } from '../api/contest.api';
import { getProblems } from '../api/problem.api';
import useAuth from '../auth/useAuth';

const getStatusMeta = (status) => {
  if (status === 'Live') {
    return {
      chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
      card: 'border-emerald-400/20 shadow-[0_20px_60px_rgba(16,185,129,0.12)]',
      icon: PlayCircle,
      cta: 'Join Live',
    };
  }
  if (status === 'Upcoming') {
    return {
      chip: 'bg-sky-500/15 text-sky-200 border-sky-400/30',
      card: 'border-sky-400/20 shadow-[0_20px_60px_rgba(56,189,248,0.10)]',
      icon: CalendarClock,
      cta: 'Preview',
    };
  }
  if (status === 'Ended') {
    return {
      chip: 'bg-slate-500/15 text-slate-200 border-slate-400/30',
      card: 'border-slate-400/20 shadow-[0_20px_60px_rgba(71,85,105,0.10)]',
      icon: Trophy,
      cta: 'View Results',
    };
  }
  return {
    chip: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    card: 'border-amber-400/20 shadow-[0_20px_60px_rgba(245,158,11,0.10)]',
    icon: Lock,
    cta: 'View',
  };
};

const statCard =
  'rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md';

export default function ContestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [availableProblems, setAvailableProblems] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState('');
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: false,
    problems: [],
  });

  const fetchContests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await contestApi.list();
      setContests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data || 'Unable to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemPool = async () => {
    if (!isAdmin) return;
    try {
      const res = await getProblems(1, 150);
      setAvailableProblems(res.data?.problems || []);
    } catch {
      setAvailableProblems([]);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    fetchProblemPool();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    let list = [...contests];
    if (statusFilter !== 'All') {
      list = list.filter((item) => item.status === statusFilter);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const t = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      return t.includes(q);
    });
  }, [contests, query, statusFilter]);

  const stats = useMemo(() => {
    const live = contests.filter((c) => c.status === 'Live').length;
    const upcoming = contests.filter((c) => c.status === 'Upcoming').length;
    const ended = contests.filter((c) => c.status === 'Ended').length;
    return { total: contests.length, live, upcoming, ended };
  }, [contests]);

  const toggleProblemSelection = (problemId) => {
    setCreateForm((prev) => {
      const exists = prev.problems.includes(problemId);
      return {
        ...prev,
        problems: exists
          ? prev.problems.filter((id) => id !== problemId)
          : [...prev.problems, problemId],
      };
    });
  };

  const onCreateContest = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;
    if (!createForm.startTime || !createForm.endTime || !createForm.problems.length) {
      setError('Select start/end time and at least one problem');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await contestApi.create({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        startTime: new Date(createForm.startTime).toISOString(),
        endTime: new Date(createForm.endTime).toISOString(),
        isActive: createForm.isActive,
        problems: createForm.problems,
      });

      setShowCreate(false);
      setCreateForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        isActive: false,
        problems: [],
      });

      await fetchContests();
    } catch (e) {
      setError(e?.response?.data || 'Unable to create contest');
    } finally {
      setCreating(false);
    }
  };

  const onToggleActive = async (contest) => {
    try {
      const res = await contestApi.setActive(contest._id, !contest.isActive);
      const updated = res.data;
      setContests((prev) => prev.map((c) => (c._id === contest._id ? updated : c)));
    } catch (e) {
      setError(e?.response?.data || 'Unable to update active status');
    }
  };

  const requestContestFullscreen = async () => {
    if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // browser can block fullscreen without direct user gesture
      }
    }
  };

  const onJoinNow = async (contest) => {
    setJoiningId(contest._id);
    setError('');
    const toastId = toast.loading('Joining contest...');
    try {
      await requestContestFullscreen();
      await contestApi.enter(contest._id);
      toast.success('Joined contest', { id: toastId });
      navigate(`/contest/${contest._id}`);
    } catch (e) {
      toast.error(String(e?.response?.data || 'Unable to join contest'), { id: toastId });
      setError(String(e?.response?.data || 'Unable to join contest'));
    } finally {
      setJoiningId('');
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#060c17] text-slate-100"
      style={{ fontFamily: "'Sora', 'Manrope', 'Segoe UI', sans-serif" }}
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a]/80 via-[#111827]/70 to-[#0b1220]/80 p-6 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <Sparkles size={14} />
                Competitive Arena
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Contest Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                Join polished coding contests with live standings, strict tab-switch violation
                tracking, and fair time-based ranking.
              </p>
            </div>

            {isAdmin ? (
              <button
                onClick={() => setShowCreate((s) => !s)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                <Plus size={16} />
                {showCreate ? 'Close Builder' : 'New Contest'}
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className={statCard}>
              <p className="text-xs text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
            </div>
            <div className={statCard}>
              <p className="text-xs text-slate-400">Live</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">{stats.live}</p>
            </div>
            <div className={statCard}>
              <p className="text-xs text-slate-400">Upcoming</p>
              <p className="mt-1 text-2xl font-semibold text-sky-300">{stats.upcoming}</p>
            </div>
            <div className={statCard}>
              <p className="text-xs text-slate-400">Ended</p>
              <p className="mt-1 text-2xl font-semibold text-slate-200">{stats.ended}</p>
            </div>
          </div>
        </section>

        {showCreate ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d1526]/85 p-5 shadow-[0_24px_80px_rgba(0,0,0,.4)] backdrop-blur-xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Contest</h2>
              <span className="text-xs text-slate-400">
                Selected Problems: {createForm.problems.length}
              </span>
            </div>

            <form onSubmit={onCreateContest} className="grid gap-4 md:grid-cols-2">
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contest title"
                className="h-11 rounded-xl border border-white/10 bg-[#0a1120] px-3 text-sm outline-none focus:border-cyan-300/60"
              />

              <label className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#0a1120] px-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
                Publish as Active
              </label>

              <input
                type="datetime-local"
                value={createForm.startTime}
                onChange={(e) => setCreateForm((p) => ({ ...p, startTime: e.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-[#0a1120] px-3 text-sm outline-none"
              />

              <input
                type="datetime-local"
                value={createForm.endTime}
                onChange={(e) => setCreateForm((p) => ({ ...p, endTime: e.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-[#0a1120] px-3 text-sm outline-none"
              />

              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Contest description"
                className="md:col-span-2 rounded-xl border border-white/10 bg-[#0a1120] px-3 py-2 text-sm outline-none"
              />

              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#08101d] p-3">
                <p className="mb-2 text-xs font-semibold text-slate-400">Choose Problems</p>
                <div className="max-h-56 space-y-2 overflow-auto pr-1">
                  {availableProblems.map((p) => (
                    <label
                      key={p._id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{p.title}</p>
                        <p className="text-xs text-slate-400">{p.difficulty}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={createForm.problems.includes(p._id)}
                        onChange={() => toggleProblemSelection(p._id)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  disabled={creating}
                  className="h-11 rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-5 text-sm font-semibold text-slate-900 disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Contest'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0c1424]/85 p-4 backdrop-blur-xl md:p-5">
          <div className="flex flex-wrap gap-2">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0a1120] px-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contests"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-[#0a1120] px-3 text-sm"
            >
              <option>All</option>
              <option>Live</option>
              <option>Upcoming</option>
              <option>Ended</option>
              <option>Inactive</option>
            </select>
          </div>

          {error ? (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
              Loading contests...
            </div>
          ) : !filtered.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-sm text-slate-300">No contests found for this filter.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((contest) => {
                const meta = getStatusMeta(contest.status);
                const StatusIcon = meta.icon;

                return (
                  <article
                    key={contest._id}
                    className={`rounded-2xl border bg-white/[0.03] p-5 transition hover:-translate-y-[2px] ${meta.card}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}
                      >
                        <StatusIcon size={14} />
                        {contest.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {contest.problems?.length || 0} problems
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-white">{contest.title}</h3>
                    <p className="mt-2 line-clamp-2 min-h-[40px] text-sm text-slate-300">
                      {contest.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                      <p className="inline-flex items-center gap-1">
                        <Clock3 size={13} />
                        Start: {new Date(contest.startTime).toLocaleString()}
                      </p>
                      <p className="inline-flex items-center gap-1">
                        <CalendarClock size={13} />
                        End: {new Date(contest.endTime).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      {contest.status === 'Live' ? (
                        <button
                          type="button"
                          onClick={() => onJoinNow(contest)}
                          disabled={joiningId === contest._id}
                          className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {joiningId === contest._id ? 'Joining...' : 'Join Now'}
                        </button>
                      ) : (
                        <Link
                          to={`/contest/${contest._id}`}
                          className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          {meta.cta}
                        </Link>
                      )}

                      {isAdmin ? (
                        <button
                          onClick={() => onToggleActive(contest)}
                          className="inline-flex h-10 items-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200"
                        >
                          {contest.isActive ? 'Set Inactive' : 'Set Active'}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
