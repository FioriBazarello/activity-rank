# Activity Rank

## 1. Overview

Activity Rank is a web application that accepts a city name and returns a ranking of how desirable it will be to visit for various activities (Skiing, Surfing, Outdoor Sightseeing, Indoor Sightseeing) over the next 7 days, based on weather data from Open-Meteo.

## 2. Getting Started

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
# Install dependencies
pnpm install

# Run backend and frontend together
pnpm dev

# Run only backend (port 4000)
pnpm dev:server

# Run only frontend (port 5173)
pnpm dev:web

# Run tests
pnpm test
```

## 3. Architecture

Monorepo with pnpm workspaces:

- `packages/server` — Apollo Server (GraphQL API)
- `packages/web` — Vite + React (SPA)

Backend layers:

- **Resolvers** (schema/) — Thin orchestration layer, depends only on interfaces
- **Ports** (domain/ports/) — WeatherProvider and GeocodingProvider interfaces
- **Domain Types** (domain/types/) — DailyForecast, Location, scoring types
- **ScoringService** (application/) — Pure business logic, config-driven scoring
- **Adapters** (infrastructure/) — OpenMeteoWeatherAdapter, OpenMeteoGeocodingAdapter
- **ScoringConfig** (config/) — Declarative configuration with weights and ranges

Key architectural decisions:

- **Ports & Adapters (hexagonal architecture)**: External services (weather, geocoding) are abstracted behind interfaces. Swapping providers requires implementing a new adapter — no changes to business logic or resolvers.
- **Config-driven scoring**: Adding a new activity requires only adding a config block. The scoring engine is generic.
- **Dependency injection via Apollo Context**: Interfaces are injected into resolvers, not concrete classes, enabling easy testing with mocks.
- **Separation of concerns**: Domain types have no infrastructure dependencies. Adapters encapsulate API specifics.

```
Client (React + Apollo Client)
        │ GraphQL (HTTP)
        ▼
Server (Apollo Server)
  ├── Resolvers        → orchestration only (depends on ports)
  ├── Ports            → WeatherProvider, GeocodingProvider (interfaces)
  ├── Domain Types     → DailyForecast, Location, scoring types
  ├── ScoringService   → pure business logic (application/)
  ├── Adapters         → OpenMeteoWeatherAdapter, OpenMeteoGeocodingAdapter
  └── ScoringConfig    → weights & ranges (config/)
```

## 4. Tech Stack

| Layer | Technology |
|-------|-------------|
| Monorepo | pnpm workspaces |
| Backend | Apollo Server, Node.js, TypeScript |
| Frontend | Vite, React, Apollo Client, Tailwind CSS, shadcn/ui |
| Testing | Vitest (TDD) |
| External API | Open-Meteo (free, no API key needed) |

## 5. Scoring System

Each weather variable (temperature, precipitation, snowfall, wind, sunshine, UV index, weather code) receives a score (0–10) based on configured value ranges. The final activity score is the weighted average of its variables. Different activities prioritize different weather conditions.

Example: Skiing weights snowfall at 30%, temperature at 25%. Outdoor sightseeing weights sunshine and temperature at 25% each.

Scores are calculated per day, giving users a 7-day activity recommendation view.

## 6. Testing

- 25 unit tests across 4 test files
- TDD approach: tests written before implementation for all backend services
- Test coverage: ScoringConfig (validation), ScoringService (scoring logic), OpenMeteoWeatherAdapter (API parsing, error handling), OpenMeteoGeocodingAdapter (API parsing, error handling)
- External API calls mocked with `vi.spyOn(global, 'fetch')`

## 7. AI Assistance

How AI (Cursor + Claude) was used:

- **Architecture refactoring**: Collaborative brainstorming session to evolve from flat services to Ports & Adapters pattern, with structured decision-making for each design choice
- **Brainstorming**: Explored architectural approaches and scoring strategies through structured Q&A
- **Design validation**: Reviewed scoring weights and ranges for reasonableness
- **Boilerplate generation**: Monorepo config, Vite setup, shadcn/ui initialization
- **Code generation**: Service implementations, component structure
- **Quality control**: Every AI-generated decision was validated against the design document before implementation

The AI was used as a collaborative tool, not as a black box. All architectural decisions (monorepo structure, config-driven scoring, DI via context) were explicitly discussed and chosen for stated reasons.

## 8. Trade-offs & Omissions

| What was omitted | Why | How it would evolve |
|------------------|-----|---------------------|
| Cache | Time constraint | In-memory cache per lat/lon with 1h TTL. Redis in production. |
| Rate limiting | Time constraint | Rate limiter on Open-Meteo calls + throttle on GraphQL API. |
| Frontend tests | Backend prioritized | Component tests with Vitest + Testing Library. |
| Geocoding autocomplete | UX complexity | Debounced search with dropdown suggestions from geocoding API. |
| Mobile responsiveness | Desktop focus | Tailwind responsive classes (`md:`, `lg:`). |
| i18n | Out of scope | `react-intl` with translation files. |
| CI/CD | Not requested | GitHub Actions with lint, type-check, and tests. |
| E2E tests | Time constraint | Playwright for full user flow testing. |

## 9. What I Would Do Next (given more time)

1. Add caching layer (in-memory → Redis) for weather data
2. Rate limiting to protect against API abuse
3. Geocoding autocomplete with debounce for better UX
4. Frontend component tests
5. Mobile-responsive design
6. Error boundary components
7. CI/CD pipeline with GitHub Actions
