export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherSummary {
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

export interface ActivityScore {
  activity: string;
  score: number;
}

export interface DayForecast {
  date: string;
  weather: WeatherSummary;
  rankings: ActivityScore[];
}

export interface ActivityRankingResult {
  location: Location;
  forecast: DayForecast[];
}

export interface ActivityRankingQuery {
  activityRanking: ActivityRankingResult;
}
