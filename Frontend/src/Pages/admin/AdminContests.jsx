import React, { useEffect, useState } from "react";
import { contestApi } from "../../api/contest.api";
import { getProblems } from "../../api/problem.api";
import { Eye, EyeOff, ShieldAlert, Trash2, Trophy } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  isActive: false,
  isVisible: true,
  problems: [],
};

const panel = "rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,.32)]";

const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [problemPool, setProblemPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [expandedContestId, setExpandedContestId] = useState("");
  const [participantsByContest, setParticipantsByContest] = useState({});
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantBusyKey, setParticipantBusyKey] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [contestRes, problemsRes] = await Promise.all([
        contestApi.adminList(),
        getProblems(1, 200),
      ]);
      setContests(contestRes.data || []);
      setProblemPool(problemsRes.data?.problems || []);
    } catch (e) {
      setError(String(e?.response?.data || "Failed to load contests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleProblem = (problemId) => {
    setForm((prev) => {
      const exists = prev.problems.includes(problemId);
      return {
        ...prev,
        problems: exists
          ? prev.problems.filter((id) => id !== problemId)
          : [...prev.problems, problemId],
      };
    });
  };

  const startEdit = (contest) => {
    setEditId(contest._id);
    const ids = (contest.problems || []).map((p) =>
      typeof p === "string" ? p : p._id
    );
    setForm({
      title: contest.title || "",
      description: contest.description || "",
      startTime: toLocalInput(contest.startTime),
      endTime: toLocalInput(contest.endTime),
      isActive: Boolean(contest.isActive),
      isVisible: contest.isVisible !== false,
      problems: ids,
    });
  };

  const resetForm = () => {
    setEditId("");
    setForm(emptyForm);
  };

  const saveContest = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.startTime || !form.endTime) return setError("Start/end time required");
    if (!form.problems.length) return setError("Select at least one problem");

    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        isActive: form.isActive,
        isVisible: form.isVisible,
        problems: form.problems,
      };
      if (editId) {
        await contestApi.update(editId, payload);
        toast.success("Contest updated");
      } else {
        await contestApi.create(payload);
        toast.success("Contest created");
      }
      resetForm();
      await loadData();
    } catch (e) {
      setError(String(e?.response?.data || "Failed to save contest"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (contest) => {
    try {
      const res = await contestApi.setActive(contest._id, !contest.isActive);
      setContests((prev) => prev.map((c) => (c._id === contest._id ? res.data : c)));
      toast.success(contest.isActive ? "Contest set inactive" : "Contest set active");
    } catch (e) {
      setError(String(e?.response?.data || "Failed to update active state"));
    }
  };

  const toggleVisibility = async (contest) => {
    try {
      const res = await contestApi.setVisibility(contest._id, !(contest.isVisible !== false));
      setContests((prev) => prev.map((c) => (c._id === contest._id ? res.data : c)));
      toast.success(contest.isVisible === false ? "Contest is visible now" : "Contest hidden from users");
    } catch (e) {
      setError(String(e?.response?.data || "Failed to update visibility"));
    }
  };

  const deleteContest = async (contest) => {
    const toastId = toast.loading("Deleting contest...");
    try {
      await contestApi.remove(contest._id);
      setContests((prev) => prev.filter((x) => x._id !== contest._id));
      if (expandedContestId === contest._id) setExpandedContestId("");
      toast.success("Contest deleted successfully", { id: toastId });
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to delete contest"), { id: toastId });
    }
  };

  const loadParticipants = async (contestId) => {
    setParticipantsLoading(true);
    setError("");
    try {
      const res = await contestApi.participants(contestId);
      setParticipantsByContest((prev) => ({ ...prev, [contestId]: res.data?.participants || [] }));
    } catch (e) {
      setError(String(e?.response?.data || "Failed to load participants"));
    } finally {
      setParticipantsLoading(false);
    }
  };

  const toggleParticipantsPanel = async (contestId) => {
    if (expandedContestId === contestId) {
      setExpandedContestId("");
      return;
    }
    setExpandedContestId(contestId);
    await loadParticipants(contestId);
  };

  const updateParticipant = (contestId, updated) => {
    setParticipantsByContest((prev) => ({
      ...prev,
      [contestId]: (prev[contestId] || []).map((p) => (p._id === updated?._id ? updated : p)),
    }));
  };

  const resetViolations = async (contestId, userId) => {
    const key = `${contestId}_${userId}_v`;
    setParticipantBusyKey(key);
    try {
      const res = await contestApi.updateParticipantViolations(contestId, userId, 0);
      updateParticipant(contestId, res.data?.participant);
      toast.success("Violations reset");
    } catch (e) {
      setError(String(e?.response?.data || "Failed to reset violations"));
    } finally {
      setParticipantBusyKey("");
    }
  };

  const toggleDisqualify = async (contestId, row) => {
    const userId = row?.userId?._id;
    if (!userId) return;
    const key = `${contestId}_${userId}_dq`;
    setParticipantBusyKey(key);
    try {
      const res = await contestApi.updateParticipantStatus(contestId, userId, {
        isDisqualified: !row.isDisqualified,
      });
      updateParticipant(contestId, res.data?.participant);
      toast.success("Participant status updated");
    } catch (e) {
      setError(String(e?.response?.data || "Failed to update participant"));
    } finally {
      setParticipantBusyKey("");
    }
  };

  const toggleExit = async (contestId, row) => {
    const userId = row?.userId?._id;
    if (!userId) return;
    const key = `${contestId}_${userId}_ex`;
    setParticipantBusyKey(key);
    try {
      const res = await contestApi.updateParticipantStatus(contestId, userId, {
        hasExited: !row.hasExited,
      });
      updateParticipant(contestId, res.data?.participant);
      toast.success("Participant status updated");
    } catch (e) {
      setError(String(e?.response?.data || "Failed to update participant"));
    } finally {
      setParticipantBusyKey("");
    }
  };

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1b31]/85 via-[#101a2b]/80 to-[#0b1322]/85 p-6 shadow-[0_28px_100px_rgba(0,0,0,.45)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-200">
          <Trophy className="h-3.5 w-3.5" /> CONTEST CONTROL
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Contest Management</h2>
        <p className="mt-1 text-sm text-slate-300">Create contests, schedule timeline, manage visibility, and moderate participants.</p>
      </section>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={saveContest} className={`${panel} mt-6 p-5`}>
        <div className="mb-3 text-sm font-bold tracking-wide text-slate-300">
          {editId ? "Edit Contest" : "Create Contest"}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Contest title"
            className="rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-100 outline-none"
          />
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Active
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.checked }))}
            />
            Visible To Users
          </label>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
            className="rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-100 outline-none"
          />
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
            className="rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-100 outline-none"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          placeholder="Description"
          className="mt-3 w-full rounded-xl border border-white/10 bg-[#0f1b2f] px-3 py-2 text-sm text-slate-100 outline-none"
        />

        <div className="mt-3 rounded-2xl border border-white/10 bg-[#0b1628] p-3">
          <div className="mb-2 text-xs font-bold tracking-wide text-slate-400">Contest Problems</div>
          <div className="max-h-52 space-y-2 overflow-auto pr-1">
            {problemPool.map((p) => (
              <label
                key={p._id}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-semibold text-slate-100">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.difficulty}</div>
                </div>
                <input
                  type="checkbox"
                  checked={form.problems.includes(p._id)}
                  onChange={() => toggleProblem(p._id)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
          >
            {saving ? "Saving..." : editId ? "Update Contest" : "Create Contest"}
          </button>
          {editId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <section className={`${panel} mt-6 p-5`}>
        <div className="mb-3 text-sm font-bold tracking-wide text-slate-300">All Contests</div>

        {loading ? (
          <div className="text-sm text-slate-400">Loading contests...</div>
        ) : !contests.length ? (
          <div className="text-sm text-slate-400">No contests found.</div>
        ) : (
          <div className="space-y-3">
            {contests.map((c) => (
              <div key={c._id} className="rounded-2xl border border-white/10 bg-[#0b1628]/90 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-100">{c.title}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      Problems: {c.problems?.length || 0} | Status: {c.status} | Visibility: {c.isVisible === false ? "Hidden" : "Visible"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      {c.isActive ? "Set Inactive" : "Set Active"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(c)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                    >
                      {c.isVisible === false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {c.isVisible === false ? "Show" : "Hide"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleParticipantsPanel(c._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {expandedContestId === c._id ? "Close Moderation" : "Manage Participants"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteContest(c)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {expandedContestId === c._id ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-[#0a1322] p-3">
                    <div className="mb-2 text-xs font-bold tracking-wide text-slate-400">Participants</div>

                    {participantsLoading ? (
                      <div className="text-xs text-slate-400">Loading participants...</div>
                    ) : !(participantsByContest[c._id] || []).length ? (
                      <div className="text-xs text-slate-400">No participants found.</div>
                    ) : (
                      <div className="space-y-2">
                        {(participantsByContest[c._id] || []).map((p) => {
                          const user = p.userId || {};
                          const uid = user._id;
                          const busyV = participantBusyKey === `${c._id}_${uid}_v`;
                          const busyDq = participantBusyKey === `${c._id}_${uid}_dq`;
                          const busyEx = participantBusyKey === `${c._id}_${uid}_ex`;

                          return (
                            <div
                              key={p._id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-semibold text-slate-100">
                                  {user.firstname || user.emailid || "User"}
                                </div>
                                <div className="text-xs text-slate-400">{user.emailid}</div>
                                <div className="text-xs text-slate-300">
                                  Violations: {p.violations || 0} | {p.isDisqualified ? "Disqualified" : "Active"} | {p.hasExited ? "Exited" : "In contest"}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={busyV || (p.violations || 0) === 0}
                                  onClick={() => resetViolations(c._id, uid)}
                                  className="rounded-lg border border-emerald-300/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 disabled:opacity-50"
                                >
                                  {busyV ? "..." : "Reset V"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busyDq}
                                  onClick={() => toggleDisqualify(c._id, p)}
                                  className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-200 disabled:opacity-50"
                                >
                                  {busyDq ? "..." : p.isDisqualified ? "Undq" : "Dq"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busyEx}
                                  onClick={() => toggleExit(c._id, p)}
                                  className="rounded-lg border border-indigo-300/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-200 disabled:opacity-50"
                                >
                                  {busyEx ? "..." : p.hasExited ? "Unexit" : "Exit"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
