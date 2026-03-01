import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminProblemsApi } from "../../api/adminProblems.api";
import Pagination from "../../components/admin/Pagination";
import { Plus, Pencil, Trash2, FileSearch, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const shell = "rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,.32)]";

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
      setData({
        problems: res.data?.problems || [],
        page: res.data?.page || page,
        totalPages: res.data?.totalPages || 1,
      });
    } catch (e) {
      setErr(String(e?.response?.data || e.message || "Failed to load problems"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const onDelete = async (id) => {
    const toastId = toast.loading("Deleting problem...");
    try {
      await adminProblemsApi.remove(id);
      toast.success("Problem deleted", { id: toastId });
      fetchList(data.page);
    } catch (e) {
      toast.error(String(e?.response?.data || e.message || "Delete failed"), { id: toastId });
    }
  };

  const onToggleVisibility = async (problem) => {
    const next = problem.isVisible === false ? true : false;
    const toastId = toast.loading(next ? "Showing problem..." : "Hiding problem...");
    try {
      await adminProblemsApi.setVisibility(problem._id, next);
      toast.success(next ? "Problem is now visible to users" : "Problem hidden from users", {
        id: toastId,
      });
      fetchList(data.page);
    } catch (e) {
      toast.error(String(e?.response?.data || e.message || "Visibility update failed"), {
        id: toastId,
      });
    }
  };

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1a2e]/85 via-[#0f1728]/80 to-[#0b1120]/85 p-6 shadow-[0_26px_90px_rgba(0,0,0,.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-200">
              <FileSearch className="h-3.5 w-3.5" /> PROBLEM BANK
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Problem Management</h2>
            <p className="mt-1 text-sm text-slate-300">Create, review, update, and remove coding problems with clean control.</p>
          </div>

          <button
            onClick={() => navigate("/admin/problems/new")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
            type="button"
          >
            <Plus className="h-4 w-4" /> New Problem
          </button>
        </div>
      </section>

      <section className={`${shell} mt-6 overflow-hidden`}>
        {loading && <div className="p-6 text-sm font-semibold text-slate-300">Loading problems...</div>}

        {err && (
          <div className="m-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {(data.problems || []).map((p) => (
                    <tr key={p._id} className="text-sm">
                      <td className="px-4 py-4 font-semibold text-slate-100">{p.title}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-200">
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {Array.isArray(p.tags)
                          ? p.tags.slice(0, 4).join(", ") || "-"
                          : typeof p.tags === "string"
                            ? p.tags
                            : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            p.isVisible === false
                              ? "border-red-300/25 bg-red-500/10 text-red-200"
                              : "border-emerald-300/25 bg-emerald-500/10 text-emerald-200"
                          }`}
                        >
                          {p.isVisible === false ? "Hidden" : "Visible"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onToggleVisibility(p)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
                            type="button"
                          >
                            {p.isVisible === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {p.isVisible === false ? "Show" : "Hide"}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/problems/${p._id}/edit`)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
                            type="button"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(p._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20"
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
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 pb-4">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPrev={() => fetchList(Math.max(1, data.page - 1))}
                onNext={() => fetchList(Math.min(data.totalPages, data.page + 1))}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
