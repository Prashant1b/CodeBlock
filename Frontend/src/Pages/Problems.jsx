import ProblemTablePro from "../components/ProblemTable";

export default function Problems() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Problems
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Practice, track progress, and level up your DSA skills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              Tip: Use search + filters to find problems faster
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur">
          <ProblemTablePro />
        </div>
      </div>
    </div>
  );
}