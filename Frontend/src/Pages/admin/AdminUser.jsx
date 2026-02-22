import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://codeblock-0wvh.onrender.com",
  withCredentials: true,
});

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leetcode/users"); // ✅ matches backend route
      setUsers(res.data?.users || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        (u.firstname || "").toLowerCase().includes(s) ||
        (u.emailid || "").toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s)
    );
  }, [users, q]);

  const toggleRole = async (u) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    setBusyId(u._id);
    try {
      const res = await api.patch(`/leetcode/users/${u._id}/role`, {
        role: nextRole,
      });

      const updated = res.data?.user;
      setUsers((prev) =>
        prev.map((x) => (x._id === updated._id ? { ...x, role: updated.role } : x))
      );
    } catch (e) {
      alert(e?.response?.data || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">
              View all users and change role (user/admin).
            </p>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / role..."
            className="w-full sm:w-96 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-5">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {loading ? (
            <div className="px-5 py-6 text-sm text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-slate-500">No users found.</div>
          ) : (
            filtered.map((u) => (
              <div
                key={u._id}
                className="grid grid-cols-12 gap-2 px-5 py-3 text-sm border-b border-slate-100 hover:bg-slate-50"
              >
                <div className="col-span-4 font-semibold text-slate-900">
                  {u.firstname || "—"}
                </div>
                <div className="col-span-5 text-slate-700">{u.emailid}</div>

                <div className="col-span-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                      u.role === "admin"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200",
                    ].join(" ")}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={busyId === u._id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {busyId === u._id ? "..." : "Toggle"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}