import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import CodeRight from '../components/Problem/CodeRight';
import ResultPanel from '../components/Problem/ResultPanel';
import { contestApi } from '../api/contest.api';
import { runCodeApi } from '../api/submit.api';
import { getInitialCode } from '../utils/startcode';

const card = 'rounded-2xl border border-white/10 bg-[#0d1628]/85 shadow-[0_20px_70px_rgba(0,0,0,.32)]';

export default function ContestProblemSolvePage() {
  const { id, pid } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [problem, setProblem] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [activeResult, setActiveResult] = useState('run');
  const [violationNotice, setViolationNotice] = useState('');
  const [refreshingViolation, setRefreshingViolation] = useState(false);
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const contestRes = await contestApi.getById(id);
      const c = contestRes.data;
      setContest(c);

      const p = (c?.problems || []).find((x) => String(x._id) === String(pid));
      if (!p) throw new Error('Problem not found in contest');
      setProblem(p);
      setLanguage('cpp');
      setCode(getInitialCode(p, 'cpp'));

      try {
        const partRes = await contestApi.me(id);
        const participant = partRes.data || null;
        setParticipation(participant);
        if (participant?.hasExited) {
          setError('You exited this contest and cannot access it again.');
          navigate(`/contest/${id}`);
          return;
        }
      } catch {
        setParticipation(null);
        navigate(`/contest/${id}`);
        return;
      }
    } catch (e) {
      setError(String(e?.response?.data || e.message || 'Unable to load contest problem'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, pid]);

  const canSubmitContest = useMemo(() => {
    const isLive = contest?.status === 'Live';
    return isLive && participation && !participation?.isDisqualified;
  }, [contest, participation]);

  const violationsUsed = Number(participation?.violations || 0);
  const violationsRemaining = Math.max(0, 3 - violationsUsed);

  const refreshViolationStatus = async (silent = true) => {
    if (!id) return;
    if (!silent) setRefreshingViolation(true);
    try {
      const partRes = await contestApi.me(id);
      setParticipation(partRes.data || null);
    } catch {
      // keep previous UI state
    } finally {
      if (!silent) setRefreshingViolation(false);
    }
  };

  useEffect(() => {
    if (!canSubmitContest) return undefined;

    const onVisibility = async () => {
      if (!document.hidden) return;
      try {
        const res = await contestApi.reportViolation(id);
        setParticipation((prev) => ({ ...(prev || {}), ...res.data }));
        if (res.data?.message) setViolationNotice(String(res.data.message));
      } catch (e) {
        setError(String(e?.response?.data || 'Failed to report violation'));
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [id, canSubmitContest]);

  useEffect(() => {
    if (!contest || !participation) return undefined;
    const timer = setInterval(() => {
      refreshViolationStatus(true);
    }, 12000);
    return () => clearInterval(timer);
  }, [contest, participation, id]);

  useEffect(() => {
    if (!participation || participation?.hasExited || participation?.isDisqualified) return undefined;

    const requestFullscreen = async () => {
      if (document.fullscreenElement || !document.documentElement?.requestFullscreen) return;
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // browser may block fullscreen without direct gesture
      }
    };

    const onFullscreenChange = async () => {
      if (document.fullscreenElement) {
        setFullscreenBlocked(false);
        return;
      }
      setFullscreenBlocked(true);
      await requestFullscreen();
    };

    requestFullscreen();
    document.addEventListener('fullscreenchange', onFullscreenChange);

    const retry = setInterval(() => {
      if (!document.fullscreenElement) {
        setFullscreenBlocked(true);
        requestFullscreen();
      } else {
        setFullscreenBlocked(false);
      }
    }, 1000);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      clearInterval(retry);
    };
  }, [participation]);

  const onLanguageChange = (nextLang) => {
    setLanguage(nextLang);
    if (problem) setCode(getInitialCode(problem, nextLang));
  };

  const onRun = async () => {
    if (!problem?._id) return;
    try {
      setRunning(true);
      setActiveResult('run');
      setRunError('');
      setSubmitResult(null);
      setSubmitError('');
      const res = await runCodeApi(problem._id, { code, language });
      setRunResult(res.data);
    } catch (e) {
      setRunError(String(e?.response?.data || 'Run failed'));
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    if (!problem?._id || !canSubmitContest) return;
    try {
      setSubmitting(true);
      setActiveResult('submit');
      setSubmitError('');
      setRunResult(null);
      setRunError('');
      const res = await contestApi.submitProblem(id, problem._id, { language, code });
      setSubmitResult(res.data);
    } catch (e) {
      setSubmitError(String(e?.response?.data || 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-slate-300">Loading problem...</div>;
  }

  if (!contest || !problem) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-red-200">{error || 'Problem not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-[#060c17] text-slate-100">
      {fullscreenBlocked ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_28px_80px_rgba(0,0,0,.55)]">
            <h3 className="text-lg font-semibold text-white">Fullscreen Required</h3>
            <p className="mt-2 text-sm text-slate-300">
              Contest solve page can continue only in fullscreen mode.
            </p>
            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
                    try {
                      await document.documentElement.requestFullscreen();
                    } catch {
                      // ignore browser block
                    }
                  }
                }}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-100"
              >
                Resume Fullscreen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1450px] px-4 py-8 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/contest/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
          >
            <ArrowLeft size={16} /> Back to Problem List
          </button>
          <div className="flex items-center gap-2">
            <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
              Violations: {violationsUsed}/3
            </p>
            <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
              Remaining: {violationsRemaining}
            </p>
            <button
              type="button"
              onClick={() => refreshViolationStatus(false)}
              disabled={refreshingViolation}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300 disabled:opacity-60"
            >
              {refreshingViolation ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        {violationNotice ? (
          <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle size={15} />
              {violationNotice}
            </span>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={`${card} h-[72vh] overflow-hidden`}>
            <div className="h-full flex flex-col">
              <div className="border-b border-white/10 bg-black/20 px-4 py-3">
                <h2 className="text-lg font-semibold text-white">{problem.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{problem.difficulty}</p>
              </div>
              <div className="flex-1 overflow-auto p-5">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Description</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{problem.description}</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200">Visible Testcases</h3>
                    <span className="text-xs text-slate-500">{problem?.visibletestcases?.length || 0}</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {(problem?.visibletestcases || []).map((tc, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs text-slate-500">Case {i + 1}</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2"><p className="text-[11px] text-slate-500">Input</p><pre className="whitespace-pre-wrap text-xs text-slate-200">{tc?.input || ''}</pre></div>
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2"><p className="text-[11px] text-slate-500">Output</p><pre className="whitespace-pre-wrap text-xs text-slate-200">{tc?.output || ''}</pre></div>
                        </div>
                        {tc?.explanation ? <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2"><p className="text-[11px] text-slate-500">Explanation</p><pre className="whitespace-pre-wrap text-xs text-slate-200">{tc.explanation}</pre></div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${card} h-[72vh] overflow-hidden`}>
            <CodeRight
              language={language}
              setLanguage={onLanguageChange}
              code={code}
              setCode={setCode}
              onRun={onRun}
              onSubmit={onSubmit}
              running={running}
              submitting={submitting || !canSubmitContest}
            />
          </div>
        </div>

        <div className={`mt-3 ${card}`}>
          <ResultPanel
            runResult={runResult}
            runError={runError}
            runLoading={running}
            submitResult={submitResult}
            submitError={submitError}
            submitLoading={submitting}
            active={activeResult}
          />
        </div>

        {!canSubmitContest ? (
          <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Contest submit is locked. Violations used: {violationsUsed}/3, remaining: {violationsRemaining}.
          </div>
        ) : null}
      </div>
    </div>
  );
}
