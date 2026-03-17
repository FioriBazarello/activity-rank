export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// TODO: Replace `any` with proper types when services are implemented
export interface GraphQLContext {
  services: {
    geocoding: { search(city: string): Promise<Location> };
    weather: { getForecast(lat: number, lon: number): Promise<any[]> };
    scoring: { rankActivities(forecast: any[]): any[] };
  };
}
