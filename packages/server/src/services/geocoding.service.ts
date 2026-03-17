import type { OpenMeteoGeocodingResponse } from "../types/weather.js";
import type { Location } from "../types/graphql.js";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export class GeocodingService {
  async search(city: string): Promise<Location> {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data: OpenMeteoGeocodingResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    const result = data.results[0];
    return {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  }
}
