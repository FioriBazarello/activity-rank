# Activity Rank — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that ranks activities (Skiing, Surfing, Outdoor/Indoor Sightseeing) by weather desirability for a given city over the next 7 days.

**Architecture:** Monorepo with pnpm workspaces. Backend: Apollo Server with config-driven scoring engine. Frontend: Vite + React + Apollo Client + shadcn/ui. TDD on all backend services.

**Tech Stack:** pnpm, TypeScript, Apollo Server/Client, Vite, React, Tailwind, shadcn/ui, Vitest, Open-Meteo API.

---

## Task 1: Monorepo Setup

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.npmrc`
- Create: `tsconfig.base.json`

**Step 1: Initialize git repo**

Run: `git init`

**Step 2: Create root package.json**

```json
{
  "name": "activity-rank",
  "private": true,
  "scripts": {
    "dev:server": "pnpm --filter @activity-rank/server dev",
    "dev:web": "pnpm --filter @activity-rank/web dev",
    "dev": "pnpm run --parallel dev:server dev:web",
    "test": "pnpm --filter @activity-rank/server test",
    "build": "pnpm -r build"
  }
}
```

**Step 3: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

**Step 4: Create .npmrc**

```
auto-install-peers=true
```

**Step 5: Create .gitignore**

```
node_modules/
dist/
.env
*.local
.DS_Store
```

**Step 6: Create tsconfig.base.json**

Shared TypeScript config that both packages extend.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 7: Commit**

```
git add -A && git commit -m "chore: setup monorepo com pnpm workspaces"
```

---

## Task 2: Backend Project Scaffolding

**Files:**
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/server/vitest.config.ts`

**Step 1: Create packages/server/package.json**

```json
{
  "name": "@activity-rank/server",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@apollo/server": "^4",
    "graphql": "^16",
    "graphql-tag": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "tsx": "^4",
    "vitest": "^3",
    "@types/node": "^22"
  }
}
```

**Step 2: Create packages/server/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["tests/**/*", "dist"]
}
```

**Step 3: Create packages/server/vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

**Step 4: Install dependencies**

Run: `pnpm install` (from root)

**Step 5: Create directory structure**

Run from `packages/server`:
```
mkdir -p src/schema/resolvers src/services src/config src/types tests/services tests/config tests/fixtures
```

**Step 6: Commit**

```
git add -A && git commit -m "chore: scaffold projeto backend com Apollo Server e Vitest"
```

---

## Task 3: Types & Interfaces

**Files:**
- Create: `packages/server/src/types/weather.ts`
- Create: `packages/server/src/types/scoring.ts`
- Create: `packages/server/src/types/graphql.ts`

**Step 1: Create weather types**

File: `packages/server/src/types/weather.ts`

```typescript
export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  snowfallSum: number;
  windSpeedMax: number;
  precipitationProbabilityMax: number;
  weatherCode: number;
  sunshineDuration: number;
  uvIndexMax: number;
}

export interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    snowfall_sum: number[];
    wind_speed_10m_max: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
  };
}

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}
```

**Step 2: Create scoring types**

File: `packages/server/src/types/scoring.ts`

```typescript
export interface ScoreRange {
  min: number;
  max: number;
  score: number;
}

export interface VariableConfig {
  variable: string;
  weight: number;
  ranges: ScoreRange[];
}

export interface ActivityConfig {
  name: ActivityType;
  variables: VariableConfig[];
}

export enum ActivityType {
  SKIING = "SKIING",
  SURFING = "SURFING",
  OUTDOOR_SIGHTSEEING = "OUTDOOR_SIGHTSEEING",
  INDOOR_SIGHTSEEING = "INDOOR_SIGHTSEEING",
}
```

**Step 3: Create GraphQL types**

File: `packages/server/src/types/graphql.ts`

```typescript
import type { GeocodingService } from "../services/geocoding.service.js";
import type { WeatherService } from "../services/weather.service.js";
import type { ScoringService } from "../services/scoring.service.js";

export interface GraphQLContext {
  services: {
    geocoding: GeocodingService;
    weather: WeatherService;
    scoring: ScoringService;
  };
}

export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}
```

**Step 4: Commit**

```
git add -A && git commit -m "feat: define tipos para weather, scoring e GraphQL"
```

---

## Task 4: Scoring Config (TDD)

**Files:**
- Test: `packages/server/tests/config/scoring.config.test.ts`
- Create: `packages/server/src/config/scoring.config.ts`

**Step 1: Write failing tests**

File: `packages/server/tests/config/scoring.config.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { scoringConfig } from "../../src/config/scoring.config.js";
import { ActivityType } from "../../src/types/scoring.js";

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
      const totalWeight = activity.variables.reduce(
        (sum, v) => sum + v.weight,
        0
      );
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
          expect(variable.ranges[i].min).toBeGreaterThanOrEqual(
            variable.ranges[i - 1].min
          );
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
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --filter @activity-rank/server test`
Expected: FAIL — `scoringConfig` does not exist yet.

**Step 3: Implement scoring config**

File: `packages/server/src/config/scoring.config.ts`

Implement the full config with all 4 activities, their variables, weights, and ranges as defined in the design doc. Reference: `docs/plans/2026-03-17-activity-rank-design.md` Scoring System section.

Each activity has variables with:
- `variable`: key matching a `DailyForecast` field name
- `weight`: decimal summing to 1.0 per activity
- `ranges`: array of `{ min, max, score }` sorted ascending by `min`, using `-Infinity` and `Infinity` for open-ended ranges

```typescript
import { type ActivityConfig, ActivityType } from "../types/scoring.js";

export const scoringConfig: ActivityConfig[] = [
  {
    name: ActivityType.SKIING,
    variables: [
      {
        variable: "snowfallSum",
        weight: 0.3,
        ranges: [
          { min: -Infinity, max: 0, score: 0 },
          { min: 0, max: 1, score: 2 },
          { min: 1, max: 3, score: 4 },
          { min: 3, max: 7, score: 7 },
          { min: 7, max: 15, score: 9 },
          { min: 15, max: Infinity, score: 10 },
        ],
      },
      {
        variable: "temperatureMax",
        weight: 0.25,
        ranges: [
          { min: -Infinity, max: -15, score: 6 },
          { min: -15, max: -5, score: 10 },
          { min: -5, max: 0, score: 9 },
          { min: 0, max: 5, score: 5 },
          { min: 5, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "windSpeedMax",
        weight: 0.2,
        ranges: [
          { min: -Infinity, max: 15, score: 10 },
          { min: 15, max: 30, score: 7 },
          { min: 30, max: 50, score: 4 },
          { min: 50, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "precipitationSum",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 0.1, score: 10 },
          { min: 0.1, max: 5, score: 5 },
          { min: 5, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "weatherCode",
        weight: 0.1,
        ranges: [
          { min: -Infinity, max: 2, score: 4 },
          { min: 2, max: 4, score: 6 },
          { min: 4, max: 56, score: 0 },
          { min: 56, max: 70, score: 2 },
          { min: 70, max: 78, score: 10 },
          { min: 78, max: 85, score: 0 },
          { min: 85, max: 87, score: 10 },
          { min: 87, max: Infinity, score: 0 },
        ],
      },
    ],
  },
  {
    name: ActivityType.SURFING,
    variables: [
      {
        variable: "windSpeedMax",
        weight: 0.3,
        ranges: [
          { min: -Infinity, max: 5, score: 2 },
          { min: 5, max: 10, score: 4 },
          { min: 10, max: 20, score: 6 },
          { min: 20, max: 35, score: 10 },
          { min: 35, max: 50, score: 5 },
          { min: 50, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "temperatureMax",
        weight: 0.2,
        ranges: [
          { min: -Infinity, max: 10, score: 2 },
          { min: 10, max: 18, score: 5 },
          { min: 18, max: 25, score: 8 },
          { min: 25, max: 32, score: 10 },
          { min: 32, max: Infinity, score: 7 },
        ],
      },
      {
        variable: "precipitationSum",
        weight: 0.2,
        ranges: [
          { min: -Infinity, max: 0.1, score: 10 },
          { min: 0.1, max: 5, score: 6 },
          { min: 5, max: 15, score: 3 },
          { min: 15, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "weatherCode",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 2, score: 10 },
          { min: 2, max: 3, score: 8 },
          { min: 3, max: 4, score: 5 },
          { min: 4, max: 60, score: 2 },
          { min: 60, max: 95, score: 2 },
          { min: 95, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "uvIndexMax",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 2, score: 4 },
          { min: 2, max: 5, score: 8 },
          { min: 5, max: 8, score: 10 },
          { min: 8, max: 11, score: 6 },
          { min: 11, max: Infinity, score: 3 },
        ],
      },
    ],
  },
  {
    name: ActivityType.OUTDOOR_SIGHTSEEING,
    variables: [
      {
        variable: "sunshineDuration",
        weight: 0.25,
        ranges: [
          { min: -Infinity, max: 7200, score: 0 },
          { min: 7200, max: 18000, score: 4 },
          { min: 18000, max: 28800, score: 7 },
          { min: 28800, max: 43200, score: 9 },
          { min: 43200, max: Infinity, score: 10 },
        ],
      },
      {
        variable: "temperatureMax",
        weight: 0.25,
        ranges: [
          { min: -Infinity, max: 5, score: 2 },
          { min: 5, max: 15, score: 5 },
          { min: 15, max: 25, score: 10 },
          { min: 25, max: 33, score: 7 },
          { min: 33, max: Infinity, score: 3 },
        ],
      },
      {
        variable: "precipitationProbabilityMax",
        weight: 0.2,
        ranges: [
          { min: -Infinity, max: 10, score: 10 },
          { min: 10, max: 30, score: 7 },
          { min: 30, max: 60, score: 4 },
          { min: 60, max: 80, score: 2 },
          { min: 80, max: Infinity, score: 0 },
        ],
      },
      {
        variable: "windSpeedMax",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 10, score: 10 },
          { min: 10, max: 25, score: 7 },
          { min: 25, max: 40, score: 4 },
          { min: 40, max: Infinity, score: 1 },
        ],
      },
      {
        variable: "uvIndexMax",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 2, score: 5 },
          { min: 2, max: 5, score: 9 },
          { min: 5, max: 8, score: 10 },
          { min: 8, max: 11, score: 5 },
          { min: 11, max: Infinity, score: 2 },
        ],
      },
    ],
  },
  {
    name: ActivityType.INDOOR_SIGHTSEEING,
    variables: [
      {
        variable: "precipitationSum",
        weight: 0.3,
        ranges: [
          { min: -Infinity, max: 0.1, score: 3 },
          { min: 0.1, max: 5, score: 6 },
          { min: 5, max: 15, score: 8 },
          { min: 15, max: Infinity, score: 10 },
        ],
      },
      {
        variable: "temperatureMax",
        weight: 0.25,
        ranges: [
          { min: -Infinity, max: 5, score: 9 },
          { min: 5, max: 15, score: 6 },
          { min: 15, max: 25, score: 3 },
          { min: 25, max: 33, score: 6 },
          { min: 33, max: Infinity, score: 9 },
        ],
      },
      {
        variable: "windSpeedMax",
        weight: 0.2,
        ranges: [
          { min: -Infinity, max: 15, score: 3 },
          { min: 15, max: 30, score: 6 },
          { min: 30, max: 50, score: 8 },
          { min: 50, max: Infinity, score: 10 },
        ],
      },
      {
        variable: "sunshineDuration",
        weight: 0.15,
        ranges: [
          { min: -Infinity, max: 10800, score: 10 },
          { min: 10800, max: 21600, score: 7 },
          { min: 21600, max: 36000, score: 4 },
          { min: 36000, max: Infinity, score: 2 },
        ],
      },
      {
        variable: "weatherCode",
        weight: 0.1,
        ranges: [
          { min: -Infinity, max: 2, score: 2 },
          { min: 2, max: 4, score: 5 },
          { min: 4, max: 60, score: 6 },
          { min: 60, max: 80, score: 8 },
          { min: 80, max: 96, score: 10 },
          { min: 96, max: Infinity, score: 10 },
        ],
      },
    ],
  },
];
```

**Step 4: Run tests to verify they pass**

Run: `pnpm --filter @activity-rank/server test`
Expected: ALL PASS

**Step 5: Commit**

```
git add -A && git commit -m "feat: config de scoring com pesos e faixas para 4 atividades (TDD)"
```

---

## Task 5: Scoring Service (TDD)

**Files:**
- Test: `packages/server/tests/services/scoring.service.test.ts`
- Create: `packages/server/src/services/scoring.service.ts`

**Step 1: Write failing tests**

File: `packages/server/tests/services/scoring.service.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { ScoringService } from "../../src/services/scoring.service.js";
import { scoringConfig } from "../../src/config/scoring.config.js";
import { ActivityType } from "../../src/types/scoring.js";
import type { DailyForecast } from "../../src/types/weather.js";

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
      const result = service.rankActivities([
        perfectSkiDay,
        hotSunnyDay,
        rainyStormyDay,
      ]);
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
      const skiing = result[0].rankings.find(
        (r) => r.activity === ActivityType.SKIING
      );
      expect(skiing!.score).toBeGreaterThan(7);
    });

    it("scores outdoor sightseeing high on a sunny mild day", () => {
      const result = service.rankActivities([hotSunnyDay]);
      const outdoor = result[0].rankings.find(
        (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING
      );
      expect(outdoor!.score).toBeGreaterThan(6);
    });

    it("scores indoor sightseeing high on a stormy day", () => {
      const result = service.rankActivities([rainyStormyDay]);
      const indoor = result[0].rankings.find(
        (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING
      );
      expect(indoor!.score).toBeGreaterThan(7);
    });

    it("preserves date and weather data in result", () => {
      const result = service.rankActivities([hotSunnyDay]);
      expect(result[0].date).toBe("2026-03-18");
      expect(result[0].weather.temperatureMax).toBe(28);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --filter @activity-rank/server test`
Expected: FAIL — `ScoringService` does not exist yet.

**Step 3: Implement ScoringService**

File: `packages/server/src/services/scoring.service.ts`

```typescript
import type { ActivityConfig, ScoreRange } from "../types/scoring.js";
import type { DailyForecast } from "../types/weather.js";

interface DayResult {
  date: string;
  weather: DailyForecast;
  rankings: Array<{ activity: string; score: number }>;
}

export class ScoringService {
  constructor(private config: ActivityConfig[]) {}

  rankActivities(forecast: DailyForecast[]): DayResult[] {
    return forecast.map((day) => {
      const rankings = this.config
        .map((activity) => ({
          activity: activity.name,
          score: this.calculateScore(day, activity),
        }))
        .sort((a, b) => b.score - a.score);

      return { date: day.date, weather: day, rankings };
    });
  }

  private calculateScore(day: DailyForecast, activity: ActivityConfig): number {
    let totalScore = 0;

    for (const variable of activity.variables) {
      const value = day[variable.variable as keyof DailyForecast] as number;
      const variableScore = this.getVariableScore(value, variable.ranges);
      totalScore += variableScore * variable.weight;
    }

    return Math.round(totalScore * 10) / 10;
  }

  getVariableScore(value: number, ranges: ScoreRange[]): number {
    for (const range of ranges) {
      if (value >= range.min && value < range.max) {
        return range.score;
      }
    }
    return 0;
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm --filter @activity-rank/server test`
Expected: ALL PASS

**Step 5: Commit**

```
git add -A && git commit -m "feat: scoring service com cálculo de score por atividade/dia (TDD)"
```

---

## Task 6: Test Fixtures

**Files:**
- Create: `packages/server/tests/fixtures/geocoding-response.fixture.ts`
- Create: `packages/server/tests/fixtures/weather-response.fixture.ts`

**Step 1: Create geocoding fixture**

File: `packages/server/tests/fixtures/geocoding-response.fixture.ts`

```typescript
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
```

**Step 2: Create weather fixture**

File: `packages/server/tests/fixtures/weather-response.fixture.ts`

Create a realistic 7-day Open-Meteo response for Paris. Use realistic weather data arrays with 7 elements each.

```typescript
import type { OpenMeteoForecastResponse } from "../../src/types/weather.js";

export const parisWeatherResponse: OpenMeteoForecastResponse = {
  daily: {
    time: [
      "2026-03-17",
      "2026-03-18",
      "2026-03-19",
      "2026-03-20",
      "2026-03-21",
      "2026-03-22",
      "2026-03-23",
    ],
    temperature_2m_max: [15, 12, 8, 18, 22, 20, 14],
    temperature_2m_min: [7, 5, 2, 9, 13, 11, 6],
    precipitation_sum: [0, 2.5, 12, 0, 0, 0.5, 8],
    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
    wind_speed_10m_max: [15, 25, 40, 10, 8, 12, 30],
    precipitation_probability_max: [10, 45, 90, 5, 0, 20, 75],
    weather_code: [1, 3, 63, 0, 0, 2, 61],
    sunshine_duration: [36000, 18000, 3600, 43200, 46800, 28800, 7200],
    uv_index_max: [4, 3, 1, 6, 7, 5, 2],
  },
};
```

**Step 3: Commit**

```
git add -A && git commit -m "test: adiciona fixtures de geocoding e weather"
```

---

## Task 7: Geocoding Service (TDD)

**Files:**
- Test: `packages/server/tests/services/geocoding.service.test.ts`
- Create: `packages/server/src/services/geocoding.service.ts`

**Step 1: Write failing tests**

File: `packages/server/tests/services/geocoding.service.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeocodingService } from "../../src/services/geocoding.service.js";
import {
  parisGeocodingResponse,
  emptyGeocodingResponse,
  noResultsGeocodingResponse,
} from "../fixtures/geocoding-response.fixture.js";

describe("GeocodingService", () => {
  let service: GeocodingService;

  beforeEach(() => {
    service = new GeocodingService();
    vi.restoreAllMocks();
  });

  it("returns location for a valid city", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisGeocodingResponse,
    } as Response);

    const result = await service.search("Paris");
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

    await expect(service.search("Xyzabc")).rejects.toThrow("City not found");
  });

  it("throws error when city is not found (no results key)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => noResultsGeocodingResponse,
    } as Response);

    await expect(service.search("Xyzabc")).rejects.toThrow("City not found");
  });

  it("throws error when API request fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(service.search("Paris")).rejects.toThrow(
      "Geocoding API error"
    );
  });

  it("calls Open-Meteo geocoding API with correct URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisGeocodingResponse,
    } as Response);

    await service.search("Paris");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("geocoding-api.open-meteo.com/v1/search?name=Paris")
    );
  });
});
```

**Step 2: Run tests, verify fail**

Run: `pnpm --filter @activity-rank/server test`
Expected: FAIL — `GeocodingService` does not exist.

**Step 3: Implement GeocodingService**

File: `packages/server/src/services/geocoding.service.ts`

```typescript
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
```

**Step 4: Run tests, verify pass**

Run: `pnpm --filter @activity-rank/server test`
Expected: ALL PASS

**Step 5: Commit**

```
git add -A && git commit -m "feat: geocoding service com busca de cidade via Open-Meteo (TDD)"
```

---

## Task 8: Weather Service (TDD)

**Files:**
- Test: `packages/server/tests/services/weather.service.test.ts`
- Create: `packages/server/src/services/weather.service.ts`

**Step 1: Write failing tests**

File: `packages/server/tests/services/weather.service.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WeatherService } from "../../src/services/weather.service.js";
import { parisWeatherResponse } from "../fixtures/weather-response.fixture.js";

describe("WeatherService", () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService();
    vi.restoreAllMocks();
  });

  it("returns 7 days of forecast", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    const result = await service.getForecast(48.85, 2.35);
    expect(result).toHaveLength(7);
  });

  it("transforms Open-Meteo response to DailyForecast format", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    const result = await service.getForecast(48.85, 2.35);
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

    await expect(service.getForecast(48.85, 2.35)).rejects.toThrow(
      "Weather API error"
    );
  });

  it("calls Open-Meteo forecast API with correct parameters", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => parisWeatherResponse,
    } as Response);

    await service.getForecast(48.85, 2.35);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;

    expect(calledUrl).toContain("api.open-meteo.com/v1/forecast");
    expect(calledUrl).toContain("latitude=48.85");
    expect(calledUrl).toContain("longitude=2.35");
    expect(calledUrl).toContain("daily=");
    expect(calledUrl).toContain("temperature_2m_max");
    expect(calledUrl).toContain("snowfall_sum");
  });
});
```

**Step 2: Run tests, verify fail**

Run: `pnpm --filter @activity-rank/server test`
Expected: FAIL — `WeatherService` does not exist.

**Step 3: Implement WeatherService**

File: `packages/server/src/services/weather.service.ts`

```typescript
import type {
  DailyForecast,
  OpenMeteoForecastResponse,
} from "../types/weather.js";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

const DAILY_VARIABLES = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "snowfall_sum",
  "wind_speed_10m_max",
  "precipitation_probability_max",
  "weather_code",
  "sunshine_duration",
  "uv_index_max",
].join(",");

export class WeatherService {
  async getForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    const url = `${FORECAST_API_URL}?latitude=${lat}&longitude=${lon}&daily=${DAILY_VARIABLES}&timezone=auto&forecast_days=7`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();
    return this.transformResponse(data);
  }

  private transformResponse(data: OpenMeteoForecastResponse): DailyForecast[] {
    const { daily } = data;

    return daily.time.map((date, i) => ({
      date,
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      precipitationSum: daily.precipitation_sum[i],
      snowfallSum: daily.snowfall_sum[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
      precipitationProbabilityMax: daily.precipitation_probability_max[i],
      weatherCode: daily.weather_code[i],
      sunshineDuration: daily.sunshine_duration[i],
      uvIndexMax: daily.uv_index_max[i],
    }));
  }
}
```

**Step 4: Run tests, verify pass**

Run: `pnpm --filter @activity-rank/server test`
Expected: ALL PASS

**Step 5: Commit**

```
git add -A && git commit -m "feat: weather service com busca de forecast via Open-Meteo (TDD)"
```

---

## Task 9: GraphQL Schema + Resolver + Server Bootstrap

**Files:**
- Create: `packages/server/src/schema/type-defs.ts`
- Create: `packages/server/src/schema/resolvers/activity-ranking.ts`
- Create: `packages/server/src/index.ts`

**Step 1: Create type definitions**

File: `packages/server/src/schema/type-defs.ts`

Use the exact GraphQL schema from the design doc (see Task 3 of design doc, GraphQL Schema section). Use `gql` tag from `graphql-tag`.

**Step 2: Create resolver**

File: `packages/server/src/schema/resolvers/activity-ranking.ts`

The resolver:
1. Validates `city` is not empty
2. Calls `services.geocoding.search(city)` to get location
3. Calls `services.weather.getForecast(lat, lon)` to get forecast
4. Calls `services.scoring.rankActivities(forecast)` to get rankings
5. Returns `{ location, forecast: rankings }`

Errors from services are caught and re-thrown as `GraphQLError` with appropriate codes (`BAD_USER_INPUT`, `INTERNAL_SERVER_ERROR`).

**Step 3: Create server bootstrap**

File: `packages/server/src/index.ts`

Bootstrap Apollo Server with:
- `typeDefs` and `resolvers`
- `startStandaloneServer` with context factory that creates service instances
- `ScoringService` receives `scoringConfig` in constructor
- Listen on port 4000
- Log URL on startup

**Step 4: Test manually**

Run: `pnpm --filter @activity-rank/server dev`
Open: `http://localhost:4000` — Apollo Sandbox should load.
Test query:
```graphql
query {
  activityRanking(city: "Paris") {
    location { name country latitude longitude }
    forecast {
      date
      weather { temperatureMax weatherCode }
      rankings { activity score }
    }
  }
}
```

**Step 5: Commit**

```
git add -A && git commit -m "feat: schema GraphQL, resolver e bootstrap do Apollo Server"
```

---

## Task 10: Frontend Setup

**Files:**
- Create: `packages/web/` (via Vite scaffolding)
- Modify: `packages/web/package.json`
- Create: `packages/web/src/lib/apollo.ts`
- Create: `packages/web/src/graphql/queries.ts`
- Create: `packages/web/src/types/graphql.ts`

**Step 1: Scaffold Vite + React + TypeScript**

Run from root:
```
cd packages && pnpm create vite web --template react-ts && cd web && pnpm install
```

Update `packages/web/package.json`: set name to `"@activity-rank/web"`.

**Step 2: Install dependencies**

Run from root:
```
pnpm --filter @activity-rank/web add @apollo/client graphql
```

**Step 3: Setup Tailwind CSS + shadcn/ui**

Follow shadcn/ui Vite installation guide:
- Install and configure Tailwind CSS v4
- Initialize shadcn/ui with `pnpm dlx shadcn@latest init`
- Add required shadcn components: `pnpm dlx shadcn@latest add card input button badge skeleton`

**Step 4: Configure Apollo Client**

File: `packages/web/src/lib/apollo.ts`

```typescript
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});
```

**Step 5: Create GraphQL query**

File: `packages/web/src/graphql/queries.ts`

```typescript
import { gql } from "@apollo/client";

export const ACTIVITY_RANKING_QUERY = gql`
  query ActivityRanking($city: String!) {
    activityRanking(city: $city) {
      location {
        name
        country
        latitude
        longitude
      }
      forecast {
        date
        weather {
          temperatureMax
          temperatureMin
          precipitationSum
          snowfallSum
          windSpeedMax
          precipitationProbabilityMax
          weatherCode
          sunshineDuration
          uvIndexMax
        }
        rankings {
          activity
          score
        }
      }
    }
  }
`;
```

**Step 6: Create frontend types**

File: `packages/web/src/types/graphql.ts`

Mirror the GraphQL response types as TypeScript interfaces for use in components.

**Step 7: Wrap App with ApolloProvider**

File: `packages/web/src/main.tsx`

Wrap `<App />` with `<ApolloProvider client={apolloClient}>`.

**Step 8: Commit**

```
git add -A && git commit -m "feat: setup frontend com Vite, React, Tailwind, shadcn/ui e Apollo Client"
```

---

## Task 11: Frontend Components

**Files:**
- Create: `packages/web/src/utils/weather-icons.ts`
- Create: `packages/web/src/utils/score-color.ts`
- Create: `packages/web/src/components/search-bar.tsx`
- Create: `packages/web/src/components/weather-summary.tsx`
- Create: `packages/web/src/components/activity-score.tsx`
- Create: `packages/web/src/components/day-card.tsx`
- Create: `packages/web/src/components/ranking-grid.tsx`
- Create: `packages/web/src/components/loading-skeleton.tsx`
- Create: `packages/web/src/components/error-message.tsx`
- Modify: `packages/web/src/App.tsx`

**Step 1: Create utility functions**

`weather-icons.ts`: Maps WMO weather codes to emoji + label (e.g. 0→"☀️ Clear sky", 61→"🌧️ Rain").

`score-color.ts`: Maps score 0-10 to a CSS color class (red→yellow→green gradient using Tailwind classes).

**Step 2: Create SearchBar component**

- Text input (shadcn `Input`) + search button (shadcn `Button`)
- Calls `onSearch(city)` callback on submit
- Handles Enter key press
- Disables input while loading

**Step 3: Create WeatherSummary component**

- Receives `WeatherSummary` data
- Displays weather emoji (from weather code), temperature range, precipitation info
- Compact layout for inside a card

**Step 4: Create ActivityScore component**

- Receives activity name + score
- Displays activity name + colored score bar + numeric score
- Bar width proportional to score (0-10)
- Color from `score-color.ts` utility

**Step 5: Create DayCard component**

- shadcn `Card` component
- Header: date (formatted as weekday + day) 
- Body: WeatherSummary + list of ActivityScore (sorted by score desc, already sorted from API)

**Step 6: Create LoadingSkeleton component**

- 7 shadcn `Skeleton` cards matching DayCard layout

**Step 7: Create ErrorMessage component**

- Displays error message + retry button
- Handles "City not found" differently from network errors

**Step 8: Create RankingGrid component**

- Receives Apollo query state (`loading`, `error`, `data`)
- Renders LoadingSkeleton | ErrorMessage | grid of DayCards
- Grid: horizontal scroll on mobile, 7 columns on desktop

**Step 9: Assemble App.tsx**

- Title/header
- SearchBar
- Location info (name, country, coordinates) when data is loaded
- RankingGrid with query state
- Uses `useLazyQuery` from Apollo Client to trigger query on search

**Step 10: Test manually**

Run both servers:
```
pnpm dev
```

Test: search for "Paris", "Tokyo", "New York", "Xyzabc" (error case).

**Step 11: Commit**

```
git add -A && git commit -m "feat: componentes do frontend com grid de ranking, cards e busca"
```

---

## Task 12: README

**Files:**
- Create: `README.md`

**Step 1: Write README**

Sections:
1. **Overview** — what the app does (1-2 sentences)
2. **Getting Started** — prerequisites (Node 20+, pnpm 9+), install, run dev, run tests
3. **Architecture** — high-level diagram, backend layers, frontend components
4. **Technical Decisions** — why Apollo, why config-driven scoring, why pnpm workspaces
5. **Scoring System** — brief explanation of how activities are scored
6. **AI Assistance** — how AI was used (brainstorming, architecture review, boilerplate generation, scoring rules validation)
7. **Trade-offs & Omissions** — table from design doc
8. **What I Would Do Next** — cache, rate limiting, frontend tests, autocomplete, mobile, CI/CD

**Step 2: Commit**

```
git add -A && git commit -m "docs: README com arquitetura, decisões técnicas e trade-offs"
```

---

## Execution Order Summary

| Task | Description | TDD | ~Time |
|---|---|---|---|
| 1 | Monorepo setup | — | 5 min |
| 2 | Backend scaffolding | — | 5 min |
| 3 | Types & interfaces | — | 5 min |
| 4 | Scoring config | ✅ | 15 min |
| 5 | Scoring service | ✅ | 15 min |
| 6 | Test fixtures | — | 5 min |
| 7 | Geocoding service | ✅ | 10 min |
| 8 | Weather service | ✅ | 10 min |
| 9 | GraphQL + resolver + server | — | 15 min |
| 10 | Frontend setup | — | 15 min |
| 11 | Frontend components | — | 30 min |
| 12 | README | — | 10 min |
| | **Total** | | **~140 min** |
