import { type ActivityConfig, ActivityType } from "../domain/types/scoring.js";

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
