import { describe, it, expect } from "vitest";
import { scoringConfig } from "../../src/config/scoring.config.js";
import { ActivityType } from "../../src/domain/types/scoring.js";

describe("ScoringConfig", () => {
  it("defines all four activities", () => {
    const activityNames = scoringConfig.map((a) => a.name);
    expect(activityNames).toContain(ActivityType.SKIING);
    expect(activityNames).toContain(ActivityType.SURFING);
    expect(activityNames).toContain(ActivityType.OUTDOOR_SIGHTSEEING);
    expect(activityNames).toContain(ActivityType.INDOOR_SIGHTSEEING);
    expect(scoringConfig).toHaveLength(4);
  });

  it("has weights that sum to 1.0 for each activity", () => {
    for (const activity of scoringConfig) {
      const totalWeight = activity.variables.reduce((sum, v) => sum + v.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 5);
    }
  });

  it("has at least one variable per activity", () => {
    for (const activity of scoringConfig) {
      expect(activity.variables.length).toBeGreaterThan(0);
    }
  });

  it("has ranges sorted by min value ascending for each variable", () => {
    for (const activity of scoringConfig) {
      for (const variable of activity.variables) {
        for (let i = 1; i < variable.ranges.length; i++) {
          expect(variable.ranges[i].min).toBeGreaterThanOrEqual(variable.ranges[i - 1].min);
        }
      }
    }
  });

  it("has scores between 0 and 10 for all ranges", () => {
    for (const activity of scoringConfig) {
      for (const variable of activity.variables) {
        for (const range of variable.ranges) {
          expect(range.score).toBeGreaterThanOrEqual(0);
          expect(range.score).toBeLessThanOrEqual(10);
        }
      }
    }
  });
});
