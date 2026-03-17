import type { DayForecast } from "@/types/graphql";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeatherSummary } from "@/components/weather-summary";
import { ActivityScore } from "@/components/activity-score";

interface DayCardProps {
  day: DayForecast;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function DayCard({ day }: DayCardProps) {
  return (
    <Card className="min-w-[280px] w-[280px] shrink-0">
      <CardHeader>
        <CardTitle>{formatDate(day.date)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <WeatherSummary weather={day.weather} />
        <div className="flex flex-col gap-1.5">
          {day.rankings.map((r) => (
            <ActivityScore key={r.activity} activity={r.activity} score={r.score} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
