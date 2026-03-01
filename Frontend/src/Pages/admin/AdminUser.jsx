import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { http } from "../../api/https";
import { contestApi } from "../../api/contest.api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");

  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [busyParticipantKey, setBusyParticipantKey] = useState("");

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await http.get("/leetcode/users");
      setUsers(res.data?.users || []);
    } catch (e) {
      toast.error(String(e?.response?.data?.message || e?.response?.data || "Failed to load users"));
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadContests = async () => {
    try {
      const res = await contestApi.adminList();
      const rows = Array.isArray(res.data) ? res.data : [];
      setContests(rows);
      if (!selectedContestId && rows.length) setSelectedContestId(rows[0]._id);
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to load contests"));
    }
  };

  const loadParticipants = async (contestId) => {
    if (!contestId) return;
    setLoadingParticipants(true);
    try {
      const res = await contestApi.participants(contestId);
      setParticipants(res.data?.participants || []);
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to load participants"));
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) loadParticipants(selectedContestId);
  }, [selectedContestId]);

  const filteredUsers = useMemo(() => {
    const s = userQuery.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        String(u.firstname || "").toLowerCase().includes(s) ||
        String(u.emailid || "").toLowerCase().includes(s) ||
        String(u.role || "").toLowerCase().includes(s)
    );
  }, [users, userQuery]);

  const toggleRole = async (u) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    setBusyUserId(u._id);
    const id = toast.loading("Updating role...");
    try {
      const res = await http.patch(`/leetcode/users/${u._id}/role`, { role: nextRole });
      const updated = res.data?.user;
      if (updated) {
        setUsers((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      }
      toast.success("Role updated", { id });
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to update role"), { id });
    } finally {
      setBusyUserId("");
    }
  };

  const updateParticipantInState = (updated) => {
    setParticipants((prev) => prev.map((p) => (p._id === updated?._id ? updated : p)));
  };

  const resetViolations = async (participant) => {
    const uid = participant?.userId?._id;
    if (!uid || !selectedContestId) return;
    const key = `${selectedContestId}_${uid}_v`;
    setBusyParticipantKey(key);
    const id = toast.loading("Resetting violations...");
    try {
      const res = await contestApi.updateParticipantViolations(selectedContestId, uid, 0);
      updateParticipantInState(res.data?.participant);
      toast.success("Violations reset", { id });
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to reset violations"), { id });
    } finally {
      setBusyParticipantKey("");
    }
  };

  const toggleDisqualify = async (participant) => {
    const uid = participant?.userId?._id;
    if (!uid || !selectedContestId) return;
    const key = `${selectedContestId}_${uid}_dq`;
    setBusyParticipantKey(key);
    const id = toast.loading("Updating disqualification...");
    try {
      const res = await contestApi.updateParticipantStatus(selectedContestId, uid, {
        isDisqualified: !participant.isDisqualified,
      });
      updateParticipantInState(res.data?.participant);
      toast.success("Participant updated", { id });
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to update participant"), { id });
    } finally {
      setBusyParticipantKey("");
    }
  };

  const toggleExit = async (participant) => {
    const uid = participant?.userId?._id;
    if (!uid || !selectedContestId) return;
    const key = `${selectedContestId}_${uid}_ex`;
    setBusyParticipantKey(key);
    const id = toast.loading("Updating exit state...");
    try {
      const res = await contestApi.updateParticipantStatus(selectedContestId, uid, {
        hasExited: !participant.hasExited,
      });
      updateParticipantInState(res.data?.participant);
      toast.success("Participant updated", { id });
    } catch (e) {
      toast.error(String(e?.response?.data || "Failed to update participant"), { id });
    } finally {
      setBusyParticipantKey("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">User Management</h2>
              <p className="text-sm text-slate-500">View users and update user/admin roles.</p>
            </div>
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search name / email / role..."
              className="w-full sm:w-96 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
              <div className="col-span-4">Name</div>
              <div className="col-span-5">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {loadingUsers ? (
              <div className="px-4 py-4 text-sm text-slate-500">Loading users...</div>
            ) : !filteredUsers.length ? (
              <div className="px-4 py-4 text-sm text-slate-500">No users found.</div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="grid grid-cols-12 gap-2 border-b border-slate-100 px-4 py-3 text-sm"
                >
                  <div className="col-span-4 font-semibold text-slate-900">{u.firstname || "-"}</div>
                  <div className="col-span-5 text-slate-700">{u.emailid}</div>
                  <div className="col-span-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {u.role}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleRole(u)}
                      disabled={busyUserId === u._id}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 disabled:opacity-50"
                    >
                      {busyUserId === u._id ? "..." : "Toggle"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Contest Participants</h2>
              <p className="text-sm text-slate-500">View and manage participant state by contest.</p>
            </div>
            <select
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              className="w-full sm:w-96 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {!contests.length ? <option value="">No contests</option> : null}
              {contests.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Violations</div>
              <div className="col-span-2">Disqualified</div>
              <div className="col-span-1">Exited</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {loadingParticipants ? (
              <div className="px-4 py-4 text-sm text-slate-500">Loading participants...</div>
            ) : !participants.length ? (
              <div className="px-4 py-4 text-sm text-slate-500">No participants found.</div>
            ) : (
              participants.map((p) => {
                const uid = p?.userId?._id || p?._id;
                return (
                  <div
                    key={p._id}
                    className="grid grid-cols-12 gap-2 border-b border-slate-100 px-4 py-3 text-sm"
                  >
                    <div className="col-span-4">
                      <p className="font-semibold text-slate-900">{p?.userId?.firstname || "User"}</p>
                      <p className="text-xs text-slate-500">{p?.userId?.emailid || "-"}</p>
                    </div>
                    <div className="col-span-2 text-slate-700">{p.violations || 0}</div>
                    <div className="col-span-2">
                      {p.isDisqualified ? (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">Yes</span>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">No</span>
                      )}
                    </div>
                    <div className="col-span-1 text-slate-700">{p.hasExited ? "Yes" : "No"}</div>
                    <div className="col-span-3 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => resetViolations(p)}
                        disabled={busyParticipantKey === `${selectedContestId}_${uid}_v`}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Reset V
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDisqualify(p)}
                        disabled={busyParticipantKey === `${selectedContestId}_${uid}_dq`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 disabled:opacity-50"
                      >
                        {p.isDisqualified ? "Undq" : "Dq"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExit(p)}
                        disabled={busyParticipantKey === `${selectedContestId}_${uid}_ex`}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 disabled:opacity-50"
                      >
                        {p.hasExited ? "Unexit" : "Exit"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

