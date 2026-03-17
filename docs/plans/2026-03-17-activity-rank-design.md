# Activity Rank — Design Document

## Overview

Web application that accepts a city name and returns a ranking of how desirable it will be to visit for various activities over the next 7 days, based on weather data from Open-Meteo.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces (`packages/server` + `packages/web`) |
| Backend | Apollo Server, Node.js, TypeScript |
| Frontend | Vite + React + Apollo Client + shadcn/ui + Tailwind |
| Tests | Vitest with TDD on backend |
| External API | Open-Meteo (geocoding + daily forecast) |

## Activities Ranked

1. Skiing
2. Surfing
3. Outdoor Sightseeing
4. Indoor Sightseeing

## Architecture

```
Client (React + Apollo Client)
        │ GraphQL (HTTP)
        ▼
Server (Apollo Server)
  ├── Resolvers        → orchestration, no business logic
  ├── GeocodingService → city name → lat/lon (Open-Meteo Geocoding API)
  ├── WeatherService   → lat/lon → daily forecast (Open-Meteo Forecast API)
  ├── ScoringService   → forecast + config → scores per activity per day
  └── ScoringConfig    → weights and ranges per activity (data, not logic)
```

### Separation of Concerns

| Layer | Knows about | Does NOT know about |
|---|---|---|
| Resolvers | GraphQL schema, which services to call | How to fetch weather, how to calculate scores |
| GeocodingService | Open-Meteo geocoding API | Scores, GraphQL, weather data |
| WeatherService | Open-Meteo forecast API | Scores, GraphQL, geocoding |
| ScoringService | Scoring config, math | External APIs, GraphQL, HTTP |
| ScoringConfig | Value ranges, weights | Calculation logic, APIs |

### Extensibility

Adding a new activity (e.g. "Fishing") requires only adding a new block in `scoring.config.ts`. No changes to the ScoringService, WeatherService, or resolvers.

### Dependency Injection

Services are injected via Apollo Context, not imported directly in resolvers. This enables easy mocking in tests.

## GraphQL Schema

```graphql
type Query {
  activityRanking(city: String!): ActivityRankingResult!
}

type ActivityRankingResult {
  location: Location!
  forecast: [DayForecast!]!
}

type Location {
  name: String!
  country: String!
  latitude: Float!
  longitude: Float!
}

type DayForecast {
  date: String!
  weather: WeatherSummary!
  rankings: [ActivityScore!]!
}

type WeatherSummary {
  temperatureMax: Float!
  temperatureMin: Float!
  precipitationSum: Float!
  snowfallSum: Float!
  windSpeedMax: Float!
  precipitationProbabilityMax: Float!
  weatherCode: Int!
  sunshineDuration: Float!
  uvIndexMax: Float!
}

type ActivityScore {
  activity: ActivityType!
  score: Float!
}

enum ActivityType {
  SKIING
  SURFING
  OUTDOOR_SIGHTSEEING
  INDOOR_SIGHTSEEING
}
```

## Scoring System

### Concept

Each weather variable gets an individual score (0–10) based on value ranges. The final score per activity is the weighted average of its variable scores, resulting in a 0–10 score per activity per day.

### Open-Meteo Daily Variables Used

- `temperature_2m_max` (°C)
- `temperature_2m_min` (°C)
- `precipitation_sum` (mm)
- `snowfall_sum` (cm)
- `wind_speed_10m_max` (km/h)
- `precipitation_probability_max` (%)
- `weather_code` (WMO code)
- `sunshine_duration` (seconds)
- `uv_index_max` (index)

### Skiing

| Variable | Weight | Score Logic (0–10) |
|---|---|---|
| `snowfall_sum` | 0.30 | 0cm→0, 1-3cm→4, 3-7cm→7, 7-15cm→9, >15cm→10 |
| `temperature_2m_max` | 0.25 | >5°C→0, 0~5°C→5, -5~0°C→9, -15~-5°C→10, <-15°C→6 |
| `wind_speed_10m_max` | 0.20 | <15→10, 15-30→7, 30-50→4, >50→0 |
| `precipitation_sum` | 0.15 | 0mm→10, 1-5mm→5, >5mm→0 |
| `weather_code` | 0.10 | Snow codes(71-77,85-86)→10, Overcast(3)→6, Clear(0-1)→4, Rain→0 |

### Surfing

| Variable | Weight | Score Logic (0–10) |
|---|---|---|
| `wind_speed_10m_max` | 0.30 | <5→2, 10-20→6, 20-35→10, 35-50→5, >50→0 |
| `temperature_2m_max` | 0.20 | <10°C→2, 10-18→5, 18-25→8, 25-32→10, >32→7 |
| `precipitation_sum` | 0.20 | 0mm→10, 1-5mm→6, 5-15mm→3, >15mm→0 |
| `weather_code` | 0.15 | Clear(0-1)→10, Partly cloudy(2)→8, Overcast(3)→5, Rain→2, Thunderstorm→0 |
| `uv_index_max` | 0.15 | 0-2→4, 3-5→8, 6-8→10, 9-11→6, >11→3 |

### Outdoor Sightseeing

| Variable | Weight | Score Logic (0–10) |
|---|---|---|
| `sunshine_duration` | 0.25 | <2h→0, 2-5h→4, 5-8h→7, 8-12h→9, >12h→10 |
| `temperature_2m_max` | 0.25 | <5°C→2, 5-15→5, 15-25→10, 25-33→7, >33→3 |
| `precipitation_probability_max` | 0.20 | 0-10%→10, 10-30%→7, 30-60%→4, 60-80%→2, >80%→0 |
| `wind_speed_10m_max` | 0.15 | <10→10, 10-25→7, 25-40→4, >40→1 |
| `uv_index_max` | 0.15 | 0-2→5, 3-5→9, 6-8→10, 9-11→5, >11→2 |

### Indoor Sightseeing

Inversely proportional to outdoor conditions — bad weather favors indoor activities.

| Variable | Weight | Score Logic (0–10) |
|---|---|---|
| `precipitation_sum` | 0.30 | 0mm→3, 1-5mm→6, 5-15mm→8, >15mm→10 |
| `temperature_2m_max` | 0.25 | 15-25°C→3, <5°C→9, >33°C→9, 5-15→6, 25-33→6 |
| `wind_speed_10m_max` | 0.20 | <15→3, 15-30→6, 30-50→8, >50→10 |
| `sunshine_duration` | 0.15 | >10h→2, 6-10h→4, 3-6h→7, <3h→10 |
| `weather_code` | 0.10 | Clear→2, Cloudy→5, Rain→8, Thunderstorm/Snow→10 |

## Backend Structure

```
packages/server/
├── src/
│   ├── index.ts
│   ├── schema/
│   │   ├── type-defs.ts
│   │   └── resolvers/
│   │       └── activity-ranking.ts
│   ├── services/
│   │   ├── geocoding.service.ts
│   │   ├── weather.service.ts
│   │   └── scoring.service.ts
│   ├── config/
│   │   └── scoring.config.ts
│   └── types/
│       ├── weather.ts
│       ├── scoring.ts
│       └── graphql.ts
├── tests/
│   ├── services/
│   │   ├── scoring.service.test.ts
│   │   ├── weather.service.test.ts
│   │   └── geocoding.service.test.ts
│   ├── config/
│   │   └── scoring.config.test.ts
│   └── fixtures/
│       ├── weather-response.fixture.ts
│       └── geocoding-response.fixture.ts
└── package.json
```

## Frontend Structure

```
packages/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   └── apollo.ts
│   ├── graphql/
│   │   └── queries.ts
│   ├── components/
│   │   ├── search-bar.tsx
│   │   ├── ranking-grid.tsx
│   │   ├── day-card.tsx
│   │   ├── activity-score.tsx
│   │   ├── weather-summary.tsx
│   │   ├── loading-skeleton.tsx
│   │   └── error-message.tsx
│   ├── utils/
│   │   ├── weather-icons.ts
│   │   └── score-color.ts
│   └── types/
│       └── graphql.ts
├── index.html
├── tailwind.config.ts
└── package.json
```

## Frontend Component Hierarchy

```
App
└── SearchBar
└── RankingGrid (loading | error | data)
    ├── LoadingSkeleton
    ├── ErrorMessage
    └── DayCard (×7)
        ├── WeatherSummary
        └── ActivityScore (×4, sorted by score desc)
```

## Testing Strategy (TDD)

| Layer | TDD | Justification |
|---|---|---|
| ScoringService | Yes | Pure logic, core of the app |
| ScoringConfig | Yes | Validate weights sum to 1.0, ranges cover full spectrum |
| WeatherService | Yes | Test parsing/transformation with mocked API responses |
| GeocodingService | Yes | Test parsing + "city not found" handling |
| Resolvers | No | Thin orchestration, covered by future integration tests |
| Frontend | No | Backend prioritized. Mentioned as evolution in README |

Framework: Vitest. Cycle: Red → Green → Refactor.

## Error Handling

| Scenario | Layer | Handling |
|---|---|---|
| City not found | GeocodingService | GraphQL error: "City not found: XYZ" |
| Open-Meteo down | WeatherService | GraphQL error: "Weather data unavailable" |
| Unexpected API response | WeatherService | Validation + descriptive error |
| Empty/invalid input | Resolver | Validation before calling services |
| Network error (frontend) | Apollo Client | ErrorMessage component + retry button |
| Loading state | Frontend | Skeleton loading |

## Trade-offs and Omissions

| Omitted | Reason | Evolution |
|---|---|---|
| Cache | Time constraint | In-memory cache per lat/lon with 1h TTL. Redis in prod. |
| Rate limiting | Time constraint | Rate limiter on Open-Meteo calls + throttle on GraphQL API. |
| Frontend tests | Backend prioritized | Component tests with Vitest + Testing Library. |
| Geocoding autocomplete | UX complexity | Debounced search with dropdown suggestions. |
| Mobile responsiveness | Desktop focus | Tailwind responsive classes (`md:`, `lg:`). |
| i18n | Out of scope | `react-intl` with translation files. |
| CI/CD | Not requested | GitHub Actions with lint, type-check, tests. |
