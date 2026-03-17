# Plano de implementação — Backend Ports & Adapters

Referência: `docs/plans/2026-03-17-backend-ports-adapters-design.md`

## Pré-condições

- Todos os testes atuais passando antes de iniciar
- Cada step termina com testes passando (refatoração segura)

---

## Step 1 — Criar camada de domínio (ports + types)

**Arquivos a criar:**

1. `src/domain/ports/weather.port.ts`
   - Exportar `interface WeatherProvider` com método `getForecast(lat: number, lon: number): Promise<DailyForecast[]>`

2. `src/domain/ports/geocoding.port.ts`
   - Exportar `interface GeocodingProvider` com método `search(city: string): Promise<Location>`

3. `src/domain/types/weather.ts`
   - Mover `DailyForecast` de `src/types/weather.ts`
   - Manter `OpenMeteoForecastResponse` e `OpenMeteoGeocodingResponse` em `src/types/weather.ts` (são tipos de infraestrutura)

4. `src/domain/types/location.ts`
   - Mover `Location` de `src/types/graphql.ts`

5. `src/domain/types/scoring.ts`
   - Mover `ScoreRange`, `VariableConfig`, `ActivityConfig`, `ActivityType` de `src/types/scoring.ts`

**Verificação:** `pnpm test` passa (nada quebra, só criamos arquivos novos + atualizamos imports)

---

## Step 2 — Criar adapters de infraestrutura

**Arquivos a criar:**

1. `src/infrastructure/weather/open-meteo-weather.adapter.ts`
   - Classe `OpenMeteoWeatherAdapter implements WeatherProvider`
   - Migrar lógica de `WeatherService`: fetch + `transformResponse`
   - Importar `OpenMeteoForecastResponse` de `src/types/weather.ts` (tipo de infra)

2. `src/infrastructure/geocoding/open-meteo-geocoding.adapter.ts`
   - Classe `OpenMeteoGeocodingAdapter implements GeocodingProvider`
   - Migrar lógica de `GeocodingService`: fetch + parsing

**Verificação:** Novos arquivos compilam sem erros

---

## Step 3 — Mover ScoringService para application/

**Arquivos a criar/mover:**

1. `src/application/scoring.service.ts`
   - Mover `ScoringService` de `src/services/scoring.service.ts`
   - Atualizar imports para apontar para `domain/types/`

**Verificação:** `pnpm test` passa

---

## Step 4 — Atualizar GraphQLContext e index.ts

**Arquivos a alterar:**

1. `src/types/graphql.ts`
   - Importar `WeatherProvider` e `GeocodingProvider` dos ports
   - Importar `ScoringService` de `application/`
   - Context usa interfaces em vez de classes concretas

2. `src/index.ts`
   - Importar `OpenMeteoWeatherAdapter` e `OpenMeteoGeocodingAdapter`
   - Importar `ScoringService` de `application/`
   - Instanciar adapters no context

3. `src/schema/resolvers/activity-ranking.ts`
   - Atualizar import do `GraphQLContext` (se o path mudou)

**Verificação:** `pnpm test` passa, servidor inicia com `pnpm dev:server`

---

## Step 5 — Migrar testes para os adapters

**Arquivos a alterar/mover:**

1. `tests/services/weather.service.test.ts` → `tests/infrastructure/open-meteo-weather.adapter.test.ts`
   - Trocar imports para `OpenMeteoWeatherAdapter`
   - Renomear describes/its conforme necessário

2. `tests/services/geocoding.service.test.ts` → `tests/infrastructure/open-meteo-geocoding.adapter.test.ts`
   - Trocar imports para `OpenMeteoGeocodingAdapter`

3. `tests/services/scoring.service.test.ts` → `tests/application/scoring.service.test.ts`
   - Atualizar imports

4. `tests/config/scoring.config.test.ts`
   - Atualizar imports se necessário

**Verificação:** `pnpm test` — todos os 25 testes passam

---

## Step 6 — Limpar arquivos antigos

**Arquivos a remover:**

1. `src/services/weather.service.ts`
2. `src/services/geocoding.service.ts`
3. `src/services/scoring.service.ts`
4. `src/types/scoring.ts` (movido para domain)
5. Mover tipos de infra do Open-Meteo (`OpenMeteoForecastResponse`, `OpenMeteoGeocodingResponse`) para `src/infrastructure/weather/` e `src/infrastructure/geocoding/` respectivamente
6. Remover `src/services/` (diretório vazio)
7. Limpar `src/types/` — manter apenas `graphql.ts` (ou mover para onde fizer sentido)

**Verificação:** `pnpm test` passa, sem arquivos órfãos, sem imports quebrados

---

## Step 7 — Atualizar README

- Atualizar seção de arquitetura para refletir a nova estrutura
- Mencionar padrão Ports & Adapters e a possibilidade de trocar providers

---

## Resumo de dependências entre steps

```
Step 1 (domain) → Step 2 (adapters) → Step 3 (application)
                                            ↓
                                      Step 4 (wiring)
                                            ↓
                                      Step 5 (testes)
                                            ↓
                                      Step 6 (cleanup)
                                            ↓
                                      Step 7 (README)
```

Cada step é um commit atômico. Caso algo quebre, o rollback é simples.
