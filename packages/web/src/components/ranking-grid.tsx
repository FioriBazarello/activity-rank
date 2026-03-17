import type { DayForecast } from "@/types/graphql";
import { DayCard } from "@/components/day-card";

interface RankingGridProps {
  forecast: DayForecast[];
}

export function RankingGrid({ forecast }: RankingGridProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 px-1 py-1">
        {forecast.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
