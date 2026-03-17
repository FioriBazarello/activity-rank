import type { GeocodingService } from "../services/geocoding.service.js";
import type { WeatherService } from "../services/weather.service.js";
import type { ScoringService } from "../services/scoring.service.js";

export type { Location } from "../domain/types/location.js";

export interface GraphQLContext {
  services: {
    geocoding: GeocodingService;
    weather: WeatherService;
    scoring: ScoringService;
  };
}
