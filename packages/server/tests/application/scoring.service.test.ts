import { describe, it, expect } from "vitest";
import { ScoringService } from "../../src/application/scoring.service.js";
import { scoringConfig } from "../../src/config/scoring.config.js";
import { ActivityType } from "../../src/domain/types/scoring.js";
import type { DailyForecast } from "../../src/domain/types/weather.js";

const service = new ScoringService(scoringConfig);

const perfectSkiDay: DailyForecast = {
  date: "2026-03-17",
  temperatureMax: -8,
  temperatureMin: -15,
  precipitationSum: 0,
  snowfallSum: 20,
  windSpeedMax: 10,
  precipitationProbabilityMax: 10,
  weatherCode: 73,
  sunshineDuration: 14400,
  uvIndexMax: 2,
};

const hotSunnyDay: DailyForecast = {
  date: "2026-03-18",
  temperatureMax: 28,
  temperatureMin: 18,
  precipitationSum: 0,
  snowfallSum: 0,
  windSpeedMax: 8,
  precipitationProbabilityMax: 5,
  weatherCode: 0,
  sunshineDuration: 43200,
  uvIndexMax: 7,
};

const rainyStormyDay: DailyForecast = {
  date: "2026-03-19",
  temperatureMax: 10,
  temperatureMin: 5,
  precipitationSum: 25,
  snowfallSum: 0,
  windSpeedMax: 55,
  precipitationProbabilityMax: 95,
  weatherCode: 95,
  sunshineDuration: 3600,
  uvIndexMax: 1,
};

describe("ScoringService", () => {
  describe("getVariableScore", () => {
    it("returns correct score for value within a range", () => {
      const ranges = [
        { min: -Infinity, max: 0, score: 0 },
        { min: 0, max: 10, score: 5 },
        { min: 10, max: Infinity, score: 10 },
      ];
      expect(service.getVariableScore(5, ranges)).toBe(5);
    });

    it("returns correct score for value at range boundary (min inclusive)", () => {
      const ranges = [
        { min: -Infinity, max: 0, score: 0 },
        { min: 0, max: 10, score: 5 },
        { min: 10, max: Infinity, score: 10 },
      ];
      expect(service.getVariableScore(0, ranges)).toBe(5);
    });

    it("returns 0 when no range matches", () => {
      const ranges = [{ min: 5, max: 10, score: 5 }];
      expect(service.getVariableScore(3, ranges)).toBe(0);
    });
  });

  describe("rankActivities", () => {
    it("returns scores for all 4 activities per day", () => {
      const result = service.rankActivities([hotSunnyDay]);
      expect(result).toHaveLength(1);
      expect(result[0].rankings).toHaveLength(4);
      const activityNames = result[0].rankings.map((r) => r.activity);
      expect(activityNames).toContain(ActivityType.SKIING);
      expect(activityNames).toContain(ActivityType.SURFING);
      expect(activityNames).toContain(ActivityType.OUTDOOR_SIGHTSEEING);
      expect(activityNames).toContain(ActivityType.INDOOR_SIGHTSEEING);
    });

    it("returns 7 days of data when given 7 days", () => {
      const sevenDays = Array.from({ length: 7 }, (_, i) => ({
        ...hotSunnyDay,
        date: `2026-03-${17 + i}`,
      }));
      const result = service.rankActivities(sevenDays);
      expect(result).toHaveLength(7);
    });

    it("all scores are between 0 and 10", () => {
      const result = service.rankActivities([perfectSkiDay, hotSunnyDay, rainyStormyDay]);
      for (const day of result) {
        for (const ranking of day.rankings) {
          expect(ranking.score).toBeGreaterThanOrEqual(0);
          expect(ranking.score).toBeLessThanOrEqual(10);
        }
      }
    });

    it("rankings are sorted by score descending", () => {
      const result = service.rankActivities([hotSunnyDay]);
      const scores = result[0].rankings.map((r) => r.score);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it("scores skiing high on a perfect snow day", () => {
      const result = service.rankActivities([perfectSkiDay]);
      const skiing = result[0].rankings.find((r) => r.activity === ActivityType.SKIING);
      expect(skiing!.score).toBeGreaterThan(7);
    });

    it("scores outdoor sightseeing high on a sunny mild day", () => {
      const result = service.rankActivities([hotSunnyDay]);
      const outdoor = result[0].rankings.find((r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING);
      expect(outdoor!.score).toBeGreaterThan(6);
    });

    it("scores indoor sightseeing high on a stormy day", () => {
      const result = service.rankActivities([rainyStormyDay]);
      const indoor = result[0].rankings.find((r) => r.activity === ActivityType.INDOOR_SIGHTSEEING);
      expect(indoor!.score).toBeGreaterThan(7);
    });

    it("preserves date and weather data in result", () => {
      const result = service.rankActivities([hotSunnyDay]);
      expect(result[0].date).toBe("2026-03-18");
      expect(result[0].weather.temperatureMax).toBe(28);
    });
  });
});
