
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
  return (
    <div className="text-sm text-slate-200 whitespace-pre-wrap">
      {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
    </div>
  );
}