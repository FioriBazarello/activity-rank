import type { GeocodingService } from "../services/geocoding.service.js";
import type { WeatherService } from "../services/weather.service.js";
import type { ScoringService } from "../services/scoring.service.js";

export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GraphQLContext {
  services: {
    geocoding: GeocodingService;
    weather: WeatherService;
    scoring: ScoringService;
  };
}
