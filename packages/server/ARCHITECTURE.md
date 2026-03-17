# Backend Architecture

## Pattern: Ports & Adapters (Hexagonal)

The backend follows the Ports & Adapters pattern. The core rule: **business logic depends on abstractions (interfaces), never on concrete external services.** External providers are pluggable — swapping one requires implementing an interface and changing one line of configuration.

## Layers

```
src/
├── domain/            ← Core: interfaces + types (no external dependencies)
│   ├── ports/         ← Contracts for external services
│   └── types/         ← Business data structures
├── application/       ← Business logic (pure, no I/O)
├── infrastructure/    ← Concrete implementations of ports
│   ├── weather/       ← Open-Meteo weather adapter + API-specific types
│   └── geocoding/     ← Open-Meteo geocoding adapter + API-specific types
├── config/            ← Scoring configuration (weights and ranges)
├── schema/            ← GraphQL entry point (type-defs + resolvers)
└── types/             ← GraphQLContext definition
```

### Domain (innermost layer)

Contains **no business logic** — only contracts and data shapes.

**Ports** define what the application *needs* from the outside world:

- `WeatherProvider` — `getForecast(lat, lon): Promise<DailyForecast[]>`
- `GeocodingProvider` — `search(city): Promise<Location>`

These interfaces mention only domain types (`DailyForecast`, `Location`). They have zero knowledge of any API, URL, or HTTP concept.

**Types** are the shared vocabulary: `DailyForecast`, `Location`, `ActivityConfig`, `ScoreRange`, `ActivityType`. Every layer speaks in these terms.

### Application (business logic)

`ScoringService` lives here. It receives a `DailyForecast[]` and produces ranked activity scores using a config-driven weighted average. It is **pure logic** — no HTTP, no external dependencies, no I/O. It only imports from `domain/types/`.

It does not have an interface/port because there is no alternative implementation. Interfaces exist to enable swapping; ScoringService is the single source of truth for scoring logic.

### Infrastructure (outermost layer)

Adapters implement the domain ports for a specific external provider:

- `OpenMeteoWeatherAdapter implements WeatherProvider`
- `OpenMeteoGeocodingAdapter implements GeocodingProvider`

Each adapter encapsulates **two responsibilities**:
1. HTTP call to the provider's API
2. Transformation from the provider's response format into domain types

Provider-specific types (e.g., `OpenMeteoForecastResponse`) live here, inside the adapter's folder. They never leak into domain or application code.

### Schema (GraphQL entry point)

The resolver is a thin orchestration layer. It calls services from `context` and returns results. It depends on `GraphQLContext`, which is typed with **interfaces** — the resolver does not know which adapter is behind `context.services.weather`.

## Dependency Injection

Wiring happens in `index.ts` via Apollo Server's context factory:

```typescript
context: async (): Promise<GraphQLContext> => ({
  services: {
    geocoding: new OpenMeteoGeocodingAdapter(),
    weather: new OpenMeteoWeatherAdapter(),
    scoring: new ScoringService(scoringConfig),
  },
}),
```

`GraphQLContext` enforces the contracts at the type level:

```typescript
interface GraphQLContext {
  services: {
    geocoding: GeocodingProvider;  // interface
    weather: WeatherProvider;      // interface
    scoring: ScoringService;       // concrete (pure logic)
  };
}
```

TypeScript ensures that only classes implementing `WeatherProvider` or `GeocodingProvider` can be assigned here.

## Request Flow

```
1. Client sends:  query { activityRanking(city: "Paris") }
2. Resolver:      context.services.geocoding.search("Paris")
3. Adapter:       fetch Open-Meteo Geocoding API → transform → Location
4. Resolver:      context.services.weather.getForecast(lat, lon)
5. Adapter:       fetch Open-Meteo Forecast API → transform → DailyForecast[7]
6. Resolver:      context.services.scoring.rankActivities(forecast)
7. Application:   weighted score calculation → ranked activities per day
8. Resolver:      return { location, forecast: rankings }
```

## Dependency Direction

```
schema/resolvers → depends on → domain/ports (interfaces)
                                      ↑
infrastructure/adapters → implements → domain/ports (interfaces)

application/scoring → depends on → domain/types (data structures only)
```

The resolver and the adapter both point **inward** toward the domain. They never reference each other. This is the fundamental rule of hexagonal architecture: dependencies flow toward the center.

## Adding a New Weather Provider

1. Create `infrastructure/weather/openweathermap-weather.adapter.ts`
2. Implement `WeatherProvider` (fetch + transform to `DailyForecast[]`)
3. Change one line in `index.ts`:
   ```typescript
   weather: new OpenWeatherMapWeatherAdapter(apiKey),
   ```

No resolver changes. No scoring changes. No domain changes. No test changes (except adding tests for the new adapter).

## Testing Strategy

| Layer | What's tested | How |
|-------|--------------|-----|
| Infrastructure (adapters) | HTTP calls + response transformation | Mock `fetch`, verify output matches `DailyForecast[]` / `Location` |
| Application (ScoringService) | Scoring logic, weighted averages, ranking | Direct instantiation with config, no mocks needed |
| Config | Weight sums, range validity, activity completeness | Direct assertions on config data |

Adapters are tested against their concrete implementation (mocked HTTP). The rest of the application can be tested with fake implementations of the ports — no HTTP mocking needed.

## Clean Code Principles

This codebase follows Clean Code guidelines (Robert C. Martin). Below is how each principle is applied and how to maintain it.

### Meaningful Names

**What we do:**
- Functions use verbs that describe behavior: `rankActivities`, `calculateScore`, `getForecast`, `search`
- Classes describe what they are: `ScoringService`, `OpenMeteoWeatherAdapter`
- Interfaces describe capabilities: `WeatherProvider`, `GeocodingProvider`
- Types describe data shapes: `DailyForecast`, `Location`, `ScoreRange`

**Guidelines:**
- Avoid generic names: no `data`, `info`, `item`, `manager`, `handler`
- Avoid abbreviations: `temperature`, not `temp`; `latitude`, not `lat` (except in well-known contexts like function parameters)
- Interface names describe *what it provides*, not *what implements it*

### Small Functions with Single Responsibility

**What we do:**
- `ScoringService.rankActivities()` orchestrates, delegates to `calculateScore()`
- `calculateScore()` computes one activity's score, delegates to `getVariableScore()`
- `getVariableScore()` finds the score for one variable in a range
- Each function is under 15 lines and operates at one level of abstraction

**Guidelines:**
- If a function does two things, extract one into a private method
- If you need a comment to explain what a block does, extract it into a named function
- Functions should read top-to-bottom like a narrative

### Single Responsibility Principle (SRP)

| Class | Single Responsibility |
|-------|----------------------|
| `ScoringService` | Calculate activity scores from weather data |
| `OpenMeteoWeatherAdapter` | Fetch and transform Open-Meteo forecast data |
| `OpenMeteoGeocodingAdapter` | Fetch and transform Open-Meteo geocoding data |
| Resolver | Orchestrate the query flow, translate errors |

**Guidelines:**
- A class should have only one reason to change
- If you're adding a feature that doesn't fit the class's responsibility, create a new class
- Adapters combine fetch + transform because both change together when the API changes

### Dependency Inversion Principle (DIP)

**What we do:**
- Resolver depends on `WeatherProvider` and `GeocodingProvider` (interfaces)
- Resolver does not import `OpenMeteoWeatherAdapter` directly
- `GraphQLContext` is typed with interfaces, not concrete classes
- Wiring (which implementation to use) happens only in `index.ts`

**Guidelines:**
- High-level modules (resolver, application) never import from `infrastructure/`
- Always depend on ports (interfaces), not adapters (implementations)
- New adapters should never require changes to business logic

### Error Handling

**What we do:**
- Adapters throw descriptive errors: `Weather API error: ${status}`, `City not found: ${city}`
- Resolver catches errors and translates to GraphQL errors with appropriate codes
- No silent catches that swallow errors
- Errors bubble up with context preserved

**Guidelines:**
- Throw errors at the point of failure with useful messages
- Handle errors at the appropriate layer (adapters throw, resolver translates)
- Never catch without re-throwing or logging
- Use typed error codes for client consumption (`BAD_USER_INPUT`, `INTERNAL_SERVER_ERROR`)

### No Unnecessary Comments

**What we do:**
- Code is self-documenting through meaningful names
- No comments explaining *what* the code does
- Architecture documentation (this file) explains *why* decisions were made

**Guidelines:**
- If you need a comment to explain code, rename variables or extract functions instead
- Comments are acceptable for: non-obvious business rules, external API quirks, performance optimizations
- Never commit commented-out code

### DRY (Don't Repeat Yourself)

**What we do:**
- Scoring logic is centralized in `ScoringService` + `scoringConfig`
- Domain types are defined once in `domain/types/`
- Adapters share the same pattern but not duplicated code (each API is different)

**Guidelines:**
- If you copy-paste code, extract it into a shared function or type
- Configuration (weights, ranges) lives in `config/`, not hardcoded in logic
- Shared types go in `domain/types/`, API-specific types stay in `infrastructure/`

## Guidelines for Contributors

### Adding a New Feature

1. **Does it need external data?** Create a port in `domain/ports/`, then an adapter in `infrastructure/`
2. **Is it business logic?** Add to `application/` layer, import only from `domain/types/`
3. **Is it a new query/mutation?** Add to `schema/`, depend only on ports and application services

### File Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Ports | `{capability}.port.ts` | `weather.port.ts` |
| Adapters | `{provider}-{capability}.adapter.ts` | `open-meteo-weather.adapter.ts` |
| Services | `{domain}.service.ts` | `scoring.service.ts` |
| Types | `{domain}.ts` | `weather.ts`, `location.ts` |
| Infrastructure types | `{provider}.types.ts` | `open-meteo.types.ts` |

### Import Rules

```
✅ domain/    → imports nothing external
✅ application/ → imports from domain/types/
✅ infrastructure/ → imports from domain/ports/, domain/types/
✅ schema/    → imports from domain/ports/, application/, types/
❌ application/ → never imports from infrastructure/
❌ schema/    → never imports from infrastructure/
```

### Before Committing

- [ ] Functions are small (< 15 lines ideally)
- [ ] Names are meaningful (no `data`, `temp`, `x`)
- [ ] No commented-out code
- [ ] Errors have descriptive messages
- [ ] New code follows existing patterns
- [ ] Tests cover the new code
