export default function SplitLayout({ left, right, bottom }) {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <div className="mx-auto max-w-[1400px] px-3 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {left}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {right}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          {bottom}
        </div>
      </div>
    </div>
  );
}