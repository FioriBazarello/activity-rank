# Frontend Responsiveness Design

**Goal:** Melhorar responsividade e layout do frontend, movendo a busca para o corpo e tornando os cards responsivos com CSS Grid.

## Decisões

### Header
Header minimalista com apenas o título "Activity Rank". Sem SearchBar, sem extras. Mantém semântica HTML (`<header>`), sticky com backdrop-blur.

### SearchBar no corpo (hero → compacta)
- **Estado vazio:** layout "hero" centralizado verticalmente, com título descritivo + SearchBar grande
- **Estado com resultados:** SearchBar migra para o topo do `<main>`, compacta, com `max-w-md`
- **Transição:** CSS puro com `transition-all duration-300` + classes condicionais

### Grid responsivo
| Breakpoint | Colunas |
|---|---|
| Mobile (<640px) | 1 |
| Tablet (640-1023px) | 2 |
| Desktop (1024px+) | 3 |

- `RankingGrid` usa `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- `DayCard` perde largura fixa, vira `w-full`
- Container `max-w-5xl` limita largura em telas grandes

### LoadingSkeleton
Segue o mesmo grid responsivo dos cards reais.

## Componentes afetados
| Componente | Mudança |
|---|---|
| `App.tsx` | Remove SearchBar do header, lógica hero/compacta no main |
| `search-bar.tsx` | Aceita variante hero/compact |
| `ranking-grid.tsx` | `flex` → `grid` responsivo |
| `day-card.tsx` | Remove largura fixa |
| `loading-skeleton.tsx` | Mesmo grid responsivo |
