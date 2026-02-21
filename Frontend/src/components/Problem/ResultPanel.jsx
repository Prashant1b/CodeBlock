export default function ResultPanel({ runResult, submitResult, active }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-200">Test Result</span>
        <span className="text-xs text-slate-500">
          {active === "run" ? "Visible testcases" : "Hidden testcases"}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
        {active === "run" ? (
          runResult ? (
            <RunResultUI data={runResult} />
          ) : (
            <div className="text-sm text-slate-400">
              Click <b>Run</b> to test against visible testcases.
            </div>
          )
        ) : submitResult ? (
          <SubmitResultUI data={submitResult} />
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
  const safeRun = Array.isArray(data) ? data : Array.isArray(data?.testcases) ? data.testcases : [];

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
          const statusText = t.status ?? t.status?.description ?? `status_id: ${statusId}`;

          // ✅ support old+new fields
          const input = t.input ?? t.stdin ?? "";
          const expected = t.expected ?? t.expected_output ?? "";
          const output = (t.output ?? t.stdout ?? "").trim();
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

              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Input</div>
                  <pre className="text-slate-200 whitespace-pre-wrap">{input}</pre>
                </div>

                <div>
                  <div className="text-slate-500 mb-1">Your Output</div>
                  <pre className="text-slate-200 whitespace-pre-wrap">{output}</pre>
                </div>

                <div>
                  <div className="text-slate-500 mb-1">Expected</div>
                  <pre className="text-slate-200 whitespace-pre-wrap">{expected}</pre>
                </div>
              </div>

              {err && <div className="mt-3 text-xs text-red-300 whitespace-pre-wrap">{err}</div>}
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