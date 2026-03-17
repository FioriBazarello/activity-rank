import { getScoreColor, getScoreTextColor } from "@/utils/score-color";

interface ActivityScoreProps {
  activity: string;
  score: number;
}

function formatActivityName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ActivityScore({ activity, score }: ActivityScoreProps) {
  const widthPercent = (score / 10) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-28 shrink-0 truncate" title={formatActivityName(activity)}>
        {formatActivityName(activity)}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getScoreColor(score)}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums w-6 text-right ${getScoreTextColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}
