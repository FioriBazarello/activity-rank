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
