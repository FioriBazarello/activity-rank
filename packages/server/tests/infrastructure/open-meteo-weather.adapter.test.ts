import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenMeteoWeatherAdapter } from "../../src/infrastructure/weather/open-meteo-weather.adapter.js";
import { parisWeatherResponse } from "../fixtures/weather-response.fixture.js";

describe("OpenMeteoWeatherAdapter", () => {
  let adapter: OpenMeteoWeatherAdapter;

  beforeEach(() => {
    adapter = new OpenMeteoWeatherAdapter();
    vi.restoreAllMocks();
  });

  it("returns 7 days of forecast", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    const result = await adapter.getForecast(48.85, 2.35);
    expect(result).toHaveLength(7);
  });

  it("transforms Open-Meteo response to DailyForecast format", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    const result = await adapter.getForecast(48.85, 2.35);
    const firstDay = result[0];

    expect(firstDay.date).toBe("2026-03-17");
    expect(firstDay.temperatureMax).toBe(15);
    expect(firstDay.temperatureMin).toBe(7);
    expect(firstDay.precipitationSum).toBe(0);
    expect(firstDay.snowfallSum).toBe(0);
    expect(firstDay.windSpeedMax).toBe(15);
    expect(firstDay.precipitationProbabilityMax).toBe(10);
    expect(firstDay.weatherCode).toBe(1);
    expect(firstDay.sunshineDuration).toBe(36000);
    expect(firstDay.uvIndexMax).toBe(4);
  });

  it("throws error when API request fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    await expect(adapter.getForecast(48.85, 2.35)).rejects.toThrow("Weather API error");
  });

  it("calls Open-Meteo forecast API with correct parameters", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    await adapter.getForecast(48.85, 2.35);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;

    expect(calledUrl).toContain("api.open-meteo.com/v1/forecast");
    expect(calledUrl).toContain("latitude=48.85");
    expect(calledUrl).toContain("longitude=2.35");
    expect(calledUrl).toContain("daily=");
    expect(calledUrl).toContain("temperature_2m_max");
    expect(calledUrl).toContain("snowfall_sum");
  });
});
