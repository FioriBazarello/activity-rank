import type { OpenMeteoForecastResponse } from "../../src/infrastructure/weather/open-meteo.types.js";

export const parisWeatherResponse: OpenMeteoForecastResponse = {
  daily: {
    time: ["2026-03-17","2026-03-18","2026-03-19","2026-03-20","2026-03-21","2026-03-22","2026-03-23"],
    temperature_2m_max: [15, 12, 8, 18, 22, 20, 14],
    temperature_2m_min: [7, 5, 2, 9, 13, 11, 6],
    precipitation_sum: [0, 2.5, 12, 0, 0, 0.5, 8],
    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
    wind_speed_10m_max: [15, 25, 40, 10, 8, 12, 30],
    precipitation_probability_max: [10, 45, 90, 5, 0, 20, 75],
    weather_code: [1, 3, 63, 0, 0, 2, 61],
    sunshine_duration: [36000, 18000, 3600, 43200, 46800, 28800, 7200],
    uv_index_max: [4, 3, 1, 6, 7, 5, 2],
  },
};
