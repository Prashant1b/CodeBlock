import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SplitLayout from "../components/Problem/SplitLayout";
import ProblemLeft from "../components/Problem/ProblemLeft";
import CodeRight from "../components/Problem/CodeRight"
import ResultPanel from "../components/Problem/ResultPanel";
import { fetchProblemById } from "../api/problem.api";
import { runCodeApi, submitCodeApi } from "../api/submit.api";
import { getInitialCode } from "../utils/startcode";

export default function ProblemSolve() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeResult, setActiveResult] = useState("run"); // run | submit

  useEffect(() => {
    loadProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // when language changes, set starter code (only if user hasn't typed much)
useEffect(() => {
  if (!problem) return;
  setCode(getInitialCode(problem, language));
}, [language, problem]);

  const loadProblem = async () => {
    try {
      setLoadingProblem(true);
      const res = await fetchProblemById(id);
      setProblem(res.data);
      // set starter code
      setCode(getInitialCode(res.data, language));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingProblem(false);
    }
  };

  const onRun = async () => {
    try {
      setRunning(true);
      setActiveResult("run");
      setSubmitResult(null);

      const res = await runCodeApi(id, { code, language });
      setRunResult(res.data); // array
    } catch (e) {
      setRunResult([{ status: { description: "Error" }, stderr: e?.response?.data || e.message }]);
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setActiveResult("submit");
      setRunResult(null);

      const res = await submitCodeApi(id, { code, language });
      setSubmitResult(res.data);
    } catch (e) {
      setSubmitResult(e?.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-300 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SplitLayout
      left={<ProblemLeft problem={problem} />}
      right={
        <CodeRight
          language={language}
          setLanguage={setLanguage}
          code={code}
          setCode={setCode}
          onRun={onRun}
          onSubmit={onSubmit}
          running={running}
          submitting={submitting}
        />
      }
      bottom={<ResultPanel runResult={runResult} submitResult={submitResult} active={activeResult} />}
    />
  );
}