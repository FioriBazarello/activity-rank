import type { WeatherSummary as WeatherSummaryType } from "@/types/graphql";
import { getWeatherInfo } from "@/utils/weather-icons";

interface WeatherSummaryProps {
  weather: WeatherSummaryType;
}

export function WeatherSummary({ weather }: WeatherSummaryProps) {
  const { emoji, label } = getWeatherInfo(weather.weatherCode);

  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl" role="img" aria-label={label}>
        {emoji}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold tabular-nums">
          {Math.round(weather.temperatureMax)}°C / {Math.round(weather.temperatureMin)}°C
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
