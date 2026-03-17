import type { OpenMeteoForecastResponse } from "./open-meteo.types.js";
import type { WeatherProvider } from "../../domain/ports/weather.port.js";
import type { DailyForecast } from "../../domain/types/weather.js";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

const DAILY_VARIABLES = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "snowfall_sum",
  "wind_speed_10m_max",
  "precipitation_probability_max",
  "weather_code",
  "sunshine_duration",
  "uv_index_max",
].join(",");

export class OpenMeteoWeatherAdapter implements WeatherProvider {
  async getForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    const url = `${FORECAST_API_URL}?latitude=${lat}&longitude=${lon}&daily=${DAILY_VARIABLES}&timezone=auto&forecast_days=7`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();
    return this.transformResponse(data);
  }

  private transformResponse(data: OpenMeteoForecastResponse): DailyForecast[] {
    const { daily } = data;

    return daily.time.map((date, i) => ({
      date,
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      precipitationSum: daily.precipitation_sum[i],
      snowfallSum: daily.snowfall_sum[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
      precipitationProbabilityMax: daily.precipitation_probability_max[i],
      weatherCode: daily.weather_code[i],
      sunshineDuration: daily.sunshine_duration[i],
      uvIndexMax: daily.uv_index_max[i],
    }));
  }
}
