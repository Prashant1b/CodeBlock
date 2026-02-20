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
function RunResultUI({ runData }) {
  const safeRun = Array.isArray(runData) ? runData : [];

  if (safeRun.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        No test result received.
      </div>
    );
  }

  const total = safeRun.length;
  const passed = safeRun.filter(
    (t) => (t.status?.id ?? t.status_id) === 3
  ).length;

  return (
    <div>
      <div className="text-sm text-slate-200">
        Passed: <span className="font-semibold">{passed}</span> / {total}
      </div>

      <div className="mt-3 space-y-3">
        {safeRun.map((t, i) => {
          const statusId = t.status?.id ?? t.status_id;
          const statusText =
            t.status?.description || `status_id: ${statusId}`;

          return (
            <div
              key={t.token || i}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Case {i + 1}
                </div>
                <div
                  className={`text-xs ${
                    statusId === 3
                      ? "text-green-300"
                      : "text-red-300"
                  }`}
                >
                  {statusText}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Input</div>
                  <pre className="text-slate-200">
                    {t.stdin || ""}
                  </pre>
                </div>

                <div>
                  <div className="text-slate-500 mb-1">Your Output</div>
                  <pre className="text-slate-200">
                    {t.stdout || ""}
                  </pre>
                </div>

                <div>
                  <div className="text-slate-500 mb-1">Expected</div>
                  <pre className="text-slate-200">
                    {t.expected_output || ""}
                  </pre>
                </div>
              </div>

              {(t.stderr || t.compile_output) && (
                <div className="mt-3 text-xs text-red-300">
                  {t.stderr || t.compile_output}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitResultUI({ data }) {
  // abhi tumhara submit endpoint string return kar raha hai.
  // UI me string hi show kar dete hai.
  return (
    <div className="text-sm text-slate-200 whitespace-pre-wrap">
      {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
    </div>
  );
}