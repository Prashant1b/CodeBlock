export default function DifficultyBadge({ level }) {
  const colorMap = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };

  return (
    <span className={`font-semibold ${colorMap[level] || "text-gray-400"}`}>
      {level}
    </span>
  );
}