import React, { useEffect, useState } from "react";
import { submissionApi } from "../api/submit.api";

export default function SubmissionsTab({ pid }) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await submissionApi.listByProblem(pid);

      // backend should return: { submissions: [] }
      const list = res.data?.submissions ?? res.data ?? [];
      setSubmissions(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pid) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  if (loading) return <div className="p-4 text-sm text-slate-400">Loading…</div>;

  if (error)
    return (
      <div className="p-4">
        <div className="text-sm text-red-300">{String(error)}</div>
        <button
          onClick={load}
          className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    );

  if (submissions.length === 0)
    return <div className="p-4 text-sm text-slate-400">No submissions yet.</div>;

  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {submissions.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 text-slate-200">
                  {s.verdict || s.status || "-"}
                </td>
                <td className="px-4 py-3 text-slate-200">{s.language || "-"}</td>
                <td className="px-4 py-3 text-slate-200">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}