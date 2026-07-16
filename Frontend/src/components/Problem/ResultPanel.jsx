
import React from "react";
export default function ResultPanel({
  runResult,
  runError,
  runLoading,
  submitResult,
  submitError,
  submitLoading,
  active,
}) {
  const isRun = active === "run";

  const loading = isRun ? runLoading : submitLoading;
  const err = isRun ? runError : submitError;
  const data = isRun ? runResult : submitResult;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-200">Test Result</span>
        <span className="text-xs text-slate-500">
          {isRun ? "Visible testcases" : "Hidden testcases"}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
        {loading ? (
          <div className="text-sm text-slate-400">Running...</div>
        ) : err ? (
          <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200 whitespace-pre-wrap">
            {err}
          </div>
        ) : isRun ? (
          data ? (
            <RunResultUI data={data} />
          ) : (
            <div className="text-sm text-slate-400">
              Click <b>Run</b> to test against visible testcases.
            </div>
          )
        ) : data ? (
          <SubmitResultUI data={data} />
        ) : (
          <div className="text-sm text-slate-400">
            Click <b>Submit</b> to run against hidden testcases.
          </div>
        )}
      </div>
    </div>
  );
}

function RunResultUI({ data }) {
  const safeRun = Array.isArray(data)
    ? data
    : Array.isArray(data?.testcases)
    ? data.testcases
    : [];

  if (safeRun.length === 0) {
    return <div className="text-sm text-slate-400">No test result received.</div>;
  }

  const getStatusId = (t) => t.statusId ?? t.status?.id ?? t.status_id;

  const total = safeRun.length;
  const passed = safeRun.filter((t) => getStatusId(t) === 3).length;

  return (
    <div>
      <div className="text-sm text-slate-200">
        Passed: <span className="font-semibold">{passed}</span> / {total}
      </div>

      <div className="mt-3 space-y-3">
        {safeRun.map((t, i) => {
          const statusId = getStatusId(t);
          const statusText =
            t.status?.description ??
            t.status_description ??
            (typeof t.status === "string" ? t.status : null) ??
            `status_id: ${statusId}`;

          const input = t.input ?? t.stdin ?? "";
          const expected = t.expected ?? t.expected_output ?? "";
          const output = String(t.output ?? t.stdout ?? "").trim();
          const err = t.error ?? t.stderr ?? t.compile_output ?? "";

          return (
            <div
              key={t.token || t.id || i}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Case {i + 1}</div>
                <div className={`text-xs ${statusId === 3 ? "text-green-300" : "text-red-300"}`}>
                  {statusText}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                <div>
                  <div className="mb-1 text-slate-500">Input</div>
                  <pre className="whitespace-pre-wrap text-slate-200">{input}</pre>
                </div>

                <div>
                  <div className="mb-1 text-slate-500">Your Output</div>
                  <pre className="whitespace-pre-wrap text-slate-200">{output}</pre>
                </div>

                <div>
                  <div className="mb-1 text-slate-500">Expected</div>
                  <pre className="whitespace-pre-wrap text-slate-200">{expected}</pre>
                </div>
              </div>

              {err ? (
                <div className="mt-3 whitespace-pre-wrap text-xs text-red-300">{String(err)}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitResultUI({ data }) {
  const isTextResult = typeof data === "string";

  if (isTextResult) {
    return <div className="text-sm text-slate-200 whitespace-pre-wrap">{data}</div>;
  }

  const status = String(data?.status || "").toLowerCase();
  const passed = Number(data?.passed ?? 0);
  const total = Number(data?.total ?? 0);
  const runtimeMs = data?.runtimeMs ?? data?.runtime ?? 0;
  const memoryKb = data?.memoryKb ?? data?.memory ?? 0;
  const errorMessage = data?.errorMessage || data?.error || "";
  const submissionId = data?.submissionId || data?._id || "";

  const isAccepted = status === "accepted" || status === "correct" || status === "success";
  const isWrong = status === "wrong" || status === "wrong answer" || status === "failed";
  const statusLabel = isAccepted ? "Accepted" : isWrong ? "Wrong Answer" : status || "Submitted";
  const passedPercent = total > 0 ? Math.round((passed / total) * 100) : 0;
  const memoryMb = Number(memoryKb) > 0 ? (Number(memoryKb) / 1024).toFixed(2) : "0.00";

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-4 ${
          isAccepted
            ? "border-emerald-400/25 bg-emerald-500/10"
            : "border-rose-400/25 bg-rose-500/10"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div
              className={`text-lg font-bold ${
                isAccepted ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {statusLabel}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {passed} of {total} hidden testcases passed
            </div>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isAccepted
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-rose-400/15 text-rose-200"
            }`}
          >
            {passedPercent}%
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              isAccepted ? "bg-emerald-400" : "bg-rose-400"
            }`}
            style={{ width: `${Math.min(passedPercent, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Runtime" value={`${runtimeMs} ms`} />
        <StatCard label="Memory" value={`${memoryMb} MB`} />
        <StatCard label="Testcases" value={`${passed}/${total}`} />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-200">
            Error Message
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-amber-100">
            {String(errorMessage)}
          </pre>
        </div>
      ) : null}

      {submissionId ? (
        <div className="truncate text-xs text-slate-500">
          Submission ID: <span className="font-mono text-slate-400">{submissionId}</span>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}
