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
  isVisible: true,
  tags: [],
  visibletestcases: [],
  hiddentestcases: [],
  startcode: [
    { language: "cpp", code: "" },
    { language: "java", code: "" },
    { language: "python", code: "" },
    { language: "javascript", code: "" },
  ],
  refsolution: [
    { language: "cpp", solution: "" },
    { language: "java", solution: "" },
    { language: "python", solution: "" },
    { language: "javascript", solution: "" },
  ],
};

const panel = "rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,.32)]";

const stripWrappingQuotes = (s) => {
  const t = String(s ?? "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
};

const normalizeMultiline = (s) =>
  stripWrappingQuotes(String(s ?? "")).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const normalizeLang = (lang) => {
  const s = String(lang ?? "").trim().toLowerCase();
  if (!s) return s;
  if (["c++", "cplusplus", "cpp", "cxx"].includes(s)) return "cpp";
  if (["js", "node", "nodejs", "javascript"].includes(s)) return "javascript";
  if (["py", "python3", "python"].includes(s)) return "python";
  if (s === "java") return "java";
  return s;
};

const tagsStringToArray = (tagsStr) => {
  if (Array.isArray(tagsStr)) return tagsStr;
  return String(tagsStr ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

const tagsArrayToString = (tagsArr) => {
  if (!Array.isArray(tagsArr)) return String(tagsArr ?? "").trim();
  return tagsArr.map((x) => String(x).trim()).filter(Boolean).join(", ");
};

const fromDbToForm = (p) => {
  const startcodeUi = Array.isArray(p?.startcode)
    ? p.startcode.map((s) => ({
        language: normalizeLang(s?.language || ""),
        code: String(s?.initialcode ?? ""),
      }))
    : [];

  const refsolutionUi = Array.isArray(p?.refsolution)
    ? p.refsolution.map((r) => ({
        language: normalizeLang(r?.language || ""),
        solution: String(r?.solution ?? ""),
      }))
    : [];

  return {
    ...empty,
    ...p,
    tags: typeof p?.tags === "string" ? tagsStringToArray(p.tags) : p?.tags || [],
    startcode: startcodeUi.length ? startcodeUi : empty.startcode,
    refsolution: refsolutionUi.length ? refsolutionUi : empty.refsolution,
    visibletestcases: p?.visibletestcases || [],
    hiddentestcases: p?.hiddentestcases || [],
  };
};

const toDbPayload = (form) => {
  const visibletestcases = (form.visibletestcases || []).map((tc) => ({
    input: normalizeMultiline(tc?.input),
    output: normalizeMultiline(tc?.output),
    explanation: normalizeMultiline(tc?.explanation || "N/A"),
  }));

  const hiddentestcases = (form.hiddentestcases || []).map((tc) => ({
    input: normalizeMultiline(tc?.input),
    output: normalizeMultiline(tc?.output),
  }));

  const startcode = (form.startcode || []).map((s) => ({
    language: normalizeLang(s?.language),
    initialcode: String(s?.code ?? ""),
  }));

  const refsolution = (form.refsolution || []).map((r) => ({
    language: normalizeLang(r?.language),
    solution: String(r?.solution ?? ""),
  }));

  return {
    title: String(form.title ?? ""),
    description: String(form.description ?? ""),
    difficulty: String(form.difficulty ?? "Easy"),
    isVisible: form.isVisible !== false,
    tags: tagsArrayToString(form.tags),
    visibletestcases,
    hiddentestcases,
    startcode,
    refsolution,
  };
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
        setForm(fromDbToForm(res.data));
      } catch (e) {
        setErr(String(e?.response?.data || e.message || "Failed to load problem"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    if (!String(form.title || "").trim()) return "Title is required";
    if (!String(form.description || "").trim()) return "Description is required";
    if (!form.refsolution?.length) return "Add at least 1 reference solution";
    if (!form.visibletestcases?.length) return "Add at least 1 visible testcase";

    for (const tc of form.visibletestcases || []) {
      if (!String(tc?.input ?? "").trim()) return "Visible testcase input is required";
      if (!String(tc?.output ?? "").trim()) return "Visible testcase output is required";
    }

    const okLang = new Set(["cpp", "java", "python", "javascript"]);
    for (const r of form.refsolution || []) {
      const l = normalizeLang(r?.language);
      if (l && !okLang.has(l)) return `Unsupported reference language: ${String(r?.language)}`;
    }
    for (const s of form.startcode || []) {
      const l = normalizeLang(s?.language);
      if (l && !okLang.has(l)) return `Unsupported startcode language: ${String(s?.language)}`;
    }

    return "";
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) return setErr(msg);

    setSaving(true);
    setErr("");
    try {
      const payload = toDbPayload(form);
      if (isEdit) {
        await adminProblemsApi.update(id, payload);
      } else {
        await adminProblemsApi.create(payload);
      }
      navigate("/admin/problems");
    } catch (e) {
      setErr(String(e?.response?.data || e.message || "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={`${panel} p-6 text-slate-300`}>Loading...</div>;
  }

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1a2e]/85 via-[#0f1728]/80 to-[#0b1120]/85 p-6 shadow-[0_26px_90px_rgba(0,0,0,.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{heading}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {isEdit ? "Update details and testcase logic." : "Create a high-quality problem for your platform."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
              type="button"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
          {err}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className={`${panel} p-5`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-300">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Two Sum"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1b2f] px-4 py-3 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setField("difficulty", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1b2f] px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#0f1b2f] px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isVisible !== false}
                    onChange={(e) => setField("isVisible", e.target.checked)}
                  />
                  Show in user problem section
                </label>
              </div>

              <div className="md:col-span-2">
                <TagInput value={form.tags} onChange={(v) => setField("tags", v)} />
                <p className="mt-1 text-xs text-slate-500">Stored as comma-separated tags in backend schema.</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Write full problem statement..."
                  className="mt-2 min-h-[220px] w-full rounded-2xl border border-white/10 bg-[#0f1b2f] px-4 py-3 text-sm text-slate-100 outline-none"
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

        <div className="space-y-5">
          <section className={`${panel} p-5`}>
            <div className="text-sm font-bold text-slate-200">Start Code (Optional)</div>
            <div className="mt-4 space-y-3">
              {(form.startcode || []).map((s, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-[#0b1628] p-3">
                  <div className="text-xs font-bold text-slate-400">{String(s.language).toUpperCase()}</div>
                  <textarea
                    value={s.code}
                    onChange={(e) => {
                      const next = (form.startcode || []).map((x, i) =>
                        i === idx ? { ...x, code: e.target.value } : x
                      );
                      setField("startcode", next);
                    }}
                    className="mt-2 min-h-[140px] w-full rounded-2xl border border-white/10 bg-[#0f1b2f] px-3 py-2 font-mono text-sm text-slate-100 outline-none"
                    placeholder="// starter template"
                  />
                </div>
              ))}
            </div>
          </section>

          <RefSolutionEditor value={form.refsolution} onChange={(v) => setField("refsolution", v)} />
        </div>
      </div>
    </div>
  );
}
