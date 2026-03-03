import React, { useEffect, useState } from "react";
import { submissionApi } from "../api/submit.api";

export default function SubmissionsTab({ pid }) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [openCodeId, setOpenCodeId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await submissionApi.listByProblem(pid);

      
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
    <div className="space-y-3 p-4">
      {submissions.map((s) => {
        const isOpen = openCodeId === s._id;
        const status = s.verdict || s.status || "-";
        const runtime = s.runtime ?? s.runtimeMs ?? 0;
        const memory = s.memory ?? s.memoryKb ?? 0;
        const passed = s.testcasepassed ?? s.passed ?? 0;
        const total = s.testcasetotal ?? s.total ?? 0;

        return (
          <div key={s._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-3 md:grid-cols-6">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{status}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Language</p>
                <p className="mt-1 text-sm text-slate-100">{s.language || "-"}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Passed</p>
                <p className="mt-1 text-sm text-slate-100">
                  {passed} / {total}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Runtime</p>
                <p className="mt-1 text-sm text-slate-100">{Number(runtime).toFixed(0)} ms</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Memory</p>
                <p className="mt-1 text-sm text-slate-100">{memory} KB</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Submitted</p>
                <p className="mt-1 text-sm text-slate-100">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            </div>

            {s.errormessage ? (
              <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {s.errormessage}
              </div>
            ) : null}

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setOpenCodeId(isOpen ? "" : s._id)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
              >
                {isOpen ? "Hide Code" : "View Code"}
              </button>
            </div>

            {isOpen ? (
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-white/10 bg-[#0a1220] p-3 text-xs text-slate-200">
                <code>{s.code || "// code not available"}</code>
              </pre>
            ) : null}
          </div>
        );
      })}

      <div className="text-xs text-slate-500">
        Latest submissions are shown first.
      </div>
    </div>
  );
}
