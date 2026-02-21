import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminProblemsApi } from "../../api/adminProblems.api";
import TagInput from "../../components/admin/TagInput";
import TestcaseEditor from "../../components/admin/TestcaseEditor";
import RefSolutionEditor from "../../components/admin/RefSolutionEditor";

const empty = {
  title: "",
  description: "",
  difficulty: "Easy",
  tags: [],
  visibletestcases: [],
  hiddentestcases: [],
  startcode: [
    { language: "cpp", code: "" },
    { language: "java", code: "" },
    { language: "python", code: "" },
  ],
  refsolution: [{ language: "cpp", solution: "" }],
};

export default function ProblemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(empty);

  const heading = useMemo(() => (isEdit ? "Edit Problem" : "Create New Problem"), [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await adminProblemsApi.getById(id);
        const p = res.data;
        setForm({
          ...empty,
          ...p,
          tags: p.tags || [],
        });
      } catch (e) {
        setErr(e?.response?.data || e.message || "Failed to load problem");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.refsolution?.length) return "Add at least 1 reference solution";
    if (!form.visibletestcases?.length) return "Add at least 1 visible testcase";
    return "";
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) return setErr(msg);

    setSaving(true);
    setErr("");
    try {
      const payload = {
        ...form,
        // ensure arrays
        tags: form.tags || [],
        visibletestcases: form.visibletestcases || [],
        hiddentestcases: form.hiddentestcases || [],
        refsolution: form.refsolution || [],
      };

      if (isEdit) {
        await adminProblemsApi.update(id, payload);
      } else {
        await adminProblemsApi.create(payload);
      }

      navigate("/admin/problems");
    } catch (e) {
      setErr(e?.response?.data || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/20 p-6 shadow-sm">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{heading}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {isEdit ? "Update problem details & testcases." : "Add a new problem to your platform."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-60"
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {String(err)}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white/20 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Two Sum"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setField("difficulty", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <TagInput value={form.tags} onChange={(v) => setField("tags", v)} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Write full problem statement..."
                  className="mt-2 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </section>

          <TestcaseEditor
            title="Visible Testcases"
            value={form.visibletestcases}
            onChange={(v) => setField("visibletestcases", v)}
          />

          <TestcaseEditor
            title="Hidden Testcases"
            value={form.hiddentestcases}
            onChange={(v) => setField("hiddentestcases", v)}
          />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white/20 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="text-sm font-bold text-slate-800">Start Code (Optional)</div>
            <p className="mt-1 text-xs text-slate-500">
              If your schema expects a different format, you can keep this as is or adjust.
            </p>

            <div className="mt-4 space-y-3">
              {(form.startcode || []).map((s, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-bold text-slate-500">
                    {String(s.language).toUpperCase()}
                  </div>
                  <textarea
                    value={s.code}
                    onChange={(e) => {
                      const next = (form.startcode || []).map((x, i) =>
                        i === idx ? { ...x, code: e.target.value } : x
                      );
                      setField("startcode", next);
                    }}
                    className="mt-2 min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="// starter template"
                  />
                </div>
              ))}
            </div>
          </section>

          <RefSolutionEditor
            value={form.refsolution}
            onChange={(v) => setField("refsolution", v)}
          />
        </div>
      </div>
    </div>
  );
}