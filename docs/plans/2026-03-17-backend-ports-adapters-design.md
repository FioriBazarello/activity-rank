# Backend Refactoring — Ports & Adapters

## Contexto

O backend atual funciona e está bem organizado, mas os serviços de weather e geocoding estão acoplados diretamente à API do Open-Meteo (URLs hardcoded, formato de resposta específico). Isso impede a troca de provedores sem reescrever os serviços.

## Objetivo

Desacoplar o backend dos provedores externos usando o padrão Ports & Adapters, permitindo injetar implementações alternativas via interfaces.

## Decisões

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Escopo da refatoração | Moderado (interfaces + reorganização de pastas) | Equilíbrio entre arquitetura explícita e complexidade |
| Contrato dos providers | Adapter autocontido (HTTP + transformação) | Interface limpa, menos peças móveis, YAGNI |
| Estrutura de pastas | Separação por camada técnica | Arquitetura visível na estrutura de diretórios |
| ScoringService | Classe concreta sem interface | Lógica pura, sem implementação alternativa |

## Estrutura de pastas

```
src/
├── domain/
│   ├── ports/
│   │   ├── weather.port.ts
│   │   └── geocoding.port.ts
│   └── types/
│       ├── weather.ts
│       ├── location.ts
│       └── scoring.ts
│
├── application/
│   └── scoring.service.ts
│
├── infrastructure/
│   ├── weather/
│   │   └── open-meteo-weather.adapter.ts
│   └── geocoding/
│       └── open-meteo-geocoding.adapter.ts
│
├── config/
│   └── scoring.config.ts
│
└── schema/
    ├── type-defs.ts
    └── resolvers/
        └── activity-ranking.ts
```

## Ports

```typescript
// domain/ports/weather.port.ts
interface WeatherProvider {
  getForecast(lat: number, lon: number): Promise<DailyForecast[]>;
}

// domain/ports/geocoding.port.ts
interface GeocodingProvider {
  search(city: string): Promise<Location>;
}
```

## Adapters

Cada adapter implementa o port correspondente e encapsula a chamada HTTP + transformação para o formato do domínio. A lógica atual dos services migra diretamente para os adapters.

## GraphQLContext

```typescript
interface GraphQLContext {
  services: {
    geocoding: GeocodingProvider;  // interface
    weather: WeatherProvider;      // interface
    scoring: ScoringService;       // classe concreta
  };
}
```

## Injeção de dependência

Continua via Apollo Context. Trocar de provider = mudar uma linha no `index.ts`.

## Impacto

- Schema GraphQL: inalterado
- ScoringService: mesma classe, muda de pasta
- Resolver: mesma lógica, tipos do context atualizados
- Testes: adapters testados no lugar dos services antigos
- Frontend: zero impacto
