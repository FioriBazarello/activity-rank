import type { Location } from "../types/location.js";

export interface GeocodingProvider {
  search(city: string): Promise<Location>;
}
