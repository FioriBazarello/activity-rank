import type { DailyForecast } from "../types/weather.js";

export interface WeatherProvider {
  getForecast(lat: number, lon: number): Promise<DailyForecast[]>;
}
