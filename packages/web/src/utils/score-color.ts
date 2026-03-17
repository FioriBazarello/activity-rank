export function getScoreColor(score: number): string {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-emerald-400";
  if (score >= 4) return "bg-yellow-400";
  if (score >= 2) return "bg-orange-400";
  return "bg-red-400";
}

export function getScoreTextColor(score: number): string {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-emerald-400";
  if (score >= 4) return "text-yellow-400";
  if (score >= 2) return "text-orange-400";
  return "text-red-400";
}
