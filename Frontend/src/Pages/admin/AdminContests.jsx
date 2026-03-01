import React, { useEffect, useState } from "react";
import { contestApi } from "../../api/contest.api";
import { getProblems } from "../../api/problem.api";

const emptyForm = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  isActive: false,
  isVisible: true,
  problems: [],
};

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
  const [violationBusyKey, setViolationBusyKey] = useState("");

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
      setError(e?.response?.data || "Failed to load contests");
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
      } else {
        await contestApi.create(payload);
      }
      resetForm();
      await loadData();
    } catch (e) {
      setError(e?.response?.data || "Failed to save contest");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (contest) => {
    try {
      const res = await contestApi.setActive(contest._id, !contest.isActive);
      setContests((prev) =>
        prev.map((c) => (c._id === contest._id ? res.data : c))
      );
    } catch (e) {
      setError(e?.response?.data || "Failed to update active state");
    }
  };

  const loadParticipants = async (contestId) => {
    setParticipantsLoading(true);
    setError("");
    try {
      const res = await contestApi.participants(contestId);
      setParticipantsByContest((prev) => ({
        ...prev,
        [contestId]: res.data?.participants || [],
      }));
    } catch (e) {
      setError(e?.response?.data || "Failed to load participants");
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

  const resetViolations = async (contestId, userId) => {
    const busyKey = `${contestId}_${userId}`;
    setViolationBusyKey(busyKey);
    setError("");
    try {
      const res = await contestApi.updateParticipantViolations(
        contestId,
        userId,
        0
      );
      const updated = res.data?.participant;
      if (!updated) return;
      setParticipantsByContest((prev) => ({
        ...prev,
        [contestId]: (prev[contestId] || []).map((p) =>
          p._id === updated._id ? updated : p
        ),
      }));
    } catch (e) {
      setError(e?.response?.data || "Failed to reset violations");
    } finally {
      setViolationBusyKey("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Contest Management</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create contests, add contest problems, and edit active status.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={saveContest}
        className="mt-6 rounded-3xl border border-slate-200 bg-white/30 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      >
        <div className="mb-3 text-sm font-bold text-slate-800">
          {editId ? "Edit Contest" : "Create Contest"}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Contest title"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Active
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          placeholder="Description"
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-bold text-slate-500">Contest Problems</div>
          <div className="max-h-52 space-y-2 overflow-auto">
            {problemPool.map((p) => (
              <label
                key={p._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-semibold text-slate-800">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.difficulty}</div>
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
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : editId ? "Update Contest" : "Create Contest"}
          </button>
          {editId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/30 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-3 text-sm font-bold text-slate-800">All Contests</div>
        {loading ? (
          <div className="text-sm text-slate-600">Loading...</div>
        ) : !contests.length ? (
          <div className="text-sm text-slate-600">No contests found.</div>
        ) : (
          <div className="space-y-2">
            {contests.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">{c.title}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      Problems: {c.problems?.length || 0} | Status: {c.status} | Visibility: {c.isVisible === false ? "Hidden" : "Visible"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {c.isActive ? "Set Inactive" : "Set Active"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await contestApi.setVisibility(c._id, !(c.isVisible !== false));
                          setContests((prev) =>
                            prev.map((x) => (x._id === c._id ? res.data : x))
                          );
                        } catch (e) {
                          setError(e?.response?.data || "Failed to update visibility");
                        }
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {c.isVisible === false ? "Show To Users" : "Hide From Users"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleParticipantsPanel(c._id)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                    >
                      {expandedContestId === c._id ? "Hide Violations" : "Manage Violations"}
                    </button>
                  </div>
                </div>

                {expandedContestId === c._id ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-bold text-slate-600">
                      Participants & Violations
                    </div>

                    {participantsLoading ? (
                      <div className="text-xs text-slate-500">Loading participants...</div>
                    ) : !(participantsByContest[c._id] || []).length ? (
                      <div className="text-xs text-slate-500">No participants found.</div>
                    ) : (
                      <div className="space-y-2">
                        {(participantsByContest[c._id] || []).map((p) => {
                          const user = p.userId || {};
                          const busy = violationBusyKey === `${c._id}_${user._id}`;
                          return (
                            <div
                              key={p._id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {user.firstname || user.emailid || "User"}
                                </div>
                                <div className="text-xs text-slate-500">{user.emailid}</div>
                                <div className="text-xs text-slate-600">
                                  Violations: {p.violations || 0} |{" "}
                                  {p.isDisqualified ? "Disqualified" : "Active"}
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={busy || (p.violations || 0) === 0}
                                onClick={() => resetViolations(c._id, user._id)}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                              >
                                {busy ? "Resetting..." : "Reset Violation"}
                              </button>
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
      </div>
    </div>
  );
}
