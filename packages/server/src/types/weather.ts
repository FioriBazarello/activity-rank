export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  snowfallSum: number;
  windSpeedMax: number;
  precipitationProbabilityMax: number;
  weatherCode: number;
  sunshineDuration: number;
  uvIndexMax: number;
}

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

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}
