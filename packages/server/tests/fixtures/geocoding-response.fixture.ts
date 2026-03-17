import type { OpenMeteoGeocodingResponse } from "../../src/types/weather.js";

export const parisGeocodingResponse: OpenMeteoGeocodingResponse = {
  results: [
    {
      name: "Paris",
      country: "France",
      latitude: 48.8566,
      longitude: 2.3522,
    },
  ],
};

export const emptyGeocodingResponse: OpenMeteoGeocodingResponse = {
  results: [],
};

export const noResultsGeocodingResponse: OpenMeteoGeocodingResponse = {};
