import type { DayForecast } from "@/types/graphql";
import { DayCard } from "@/components/day-card";

interface RankingGridProps {
  forecast: DayForecast[];
}

export function RankingGrid({ forecast }: RankingGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {forecast.map((day) => (
        <DayCard key={day.date} day={day} />
      ))}
    </div>
  );
}
