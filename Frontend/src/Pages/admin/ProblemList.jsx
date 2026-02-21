import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminProblemsApi } from "../../api/adminProblems.api";
import Pagination from "../../components/admin/Pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProblemsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ problems: [], page: 1, totalPages: 1 });

  const fetchList = async (page = 1) => {
    setLoading(true);
    setErr("");
    try {
      const res = await adminProblemsApi.list({ page, limit: 10 });
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data || e.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this problem?")) return;
    try {
      await adminProblemsApi.remove(id);
      fetchList(data.page);
    } catch (e) {
      alert(e?.response?.data || e.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Problem Management</h2>
          <p className="mt-1 text-sm text-slate-600">Create, update, delete problems.</p>
        </div>

        <button
          onClick={() => navigate("/admin/problems/new")}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
          type="button"
        >
          <Plus className="h-4 w-4" /> New Problem
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/20 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        {loading && <div className="p-6 text-sm font-semibold text-slate-600">Loading...</div>}
        {err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {String(err)}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3">Title</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {(data.problems || []).map((p) => (
                    <tr key={p._id} className="text-sm">
                      <td className="py-4 font-semibold text-slate-900">{p.title}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600">
                        {(p.tags || p.tag || []).slice?.(0, 4)?.join?.(", ") || "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/problems/${p._id}/edit`)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            type="button"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(p._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(data.problems || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-slate-500">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPrev={() => fetchList(Math.max(1, data.page - 1))}
              onNext={() => fetchList(Math.min(data.totalPages, data.page + 1))}
            />
          </>
        )}
      </div>
    </div>
  );
}