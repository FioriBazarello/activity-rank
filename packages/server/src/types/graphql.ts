import type { GeocodingProvider } from "../domain/ports/geocoding.port.js";
import type { WeatherProvider } from "../domain/ports/weather.port.js";
import type { ScoringService } from "../application/scoring.service.js";

export type { Location } from "../domain/types/location.js";

export interface GraphQLContext {
  services: {
    geocoding: GeocodingProvider;
    weather: WeatherProvider;
    scoring: ScoringService;
  };
}
