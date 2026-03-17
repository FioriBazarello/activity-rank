export interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    snowfall_sum: number[];
    wind_speed_10m_max: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
  };
}
