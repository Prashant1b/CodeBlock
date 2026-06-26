export default function DifficultyBadge({ level }) {
  const colorMap = {
    Easy: "border-green-500/25 bg-green-500/10 text-green-400",
    Medium: "border-yellow-500/25 bg-yellow-500/10 text-yellow-300",
    Hard: "border-red-500/25 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={[
        "inline-flex min-w-[4.75rem] items-center justify-center rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold leading-none whitespace-nowrap",
        colorMap[level] || "border-white/10 bg-white/5 text-slate-400",
      ].join(" ")}
    >
      {level || "-"}
    </span>
  );
}
