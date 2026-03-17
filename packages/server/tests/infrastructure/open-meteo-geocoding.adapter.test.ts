import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenMeteoGeocodingAdapter } from "../../src/infrastructure/geocoding/open-meteo-geocoding.adapter.js";
import {
  parisGeocodingResponse,
  emptyGeocodingResponse,
  noResultsGeocodingResponse,
} from "../fixtures/geocoding-response.fixture.js";

describe("OpenMeteoGeocodingAdapter", () => {
  let adapter: OpenMeteoGeocodingAdapter;

  beforeEach(() => {
    adapter = new OpenMeteoGeocodingAdapter();
    vi.restoreAllMocks();
  });

  it("returns location for a valid city", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisGeocodingResponse,
    } as Response);

    const result = await adapter.search("Paris");
    expect(result).toEqual({
      name: "Paris",
      country: "France",
      latitude: 48.8566,
      longitude: 2.3522,
    });
  });

  it("throws error when city is not found (empty results)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => emptyGeocodingResponse,
    } as Response);

    await expect(adapter.search("Xyzabc")).rejects.toThrow("City not found");
  });

  it("throws error when city is not found (no results key)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => noResultsGeocodingResponse,
    } as Response);

    await expect(adapter.search("Xyzabc")).rejects.toThrow("City not found");
  });

  it("throws error when API request fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(adapter.search("Paris")).rejects.toThrow("Geocoding API error");
  });

  it("calls Open-Meteo geocoding API with correct URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisGeocodingResponse,
    } as Response);

    await adapter.search("Paris");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("geocoding-api.open-meteo.com/v1/search?name=Paris")
    );
  });
});
