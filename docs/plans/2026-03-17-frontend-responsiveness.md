# Frontend Responsiveness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Melhorar responsividade do frontend com grid responsivo, busca no corpo com transição hero→compacta, e header minimalista.

**Architecture:** O layout muda de scroll horizontal com cards fixos para CSS Grid responsivo (1→2→3 colunas). A SearchBar sai do header para o `<main>`, com dois modos visuais (hero centralizado e compacto no topo) alternados via estado booleano derivado de `data`. A transição usa CSS puro com Tailwind `transition-all`.

**Tech Stack:** React, Tailwind CSS v4, shadcn/ui

---

### Task 1: Header minimalista

**Files:**
- Modify: `packages/web/src/App.tsx:27-31`

**Step 1: Remover SearchBar do header**

Alterar o `<header>` em `App.tsx` para conter apenas o título:

```tsx
<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
  <div className="mx-auto max-w-5xl px-6 py-4">
    <h1 className="text-xl font-bold tracking-tight">Activity Rank</h1>
  </div>
</header>
```

Também alterar o `max-w-7xl` do `<main>` para `max-w-5xl` para consistência.

**Step 2: Verificar que o app renderiza sem erros**

Run: `pnpm dev:web` e verificar no navegador que o header aparece sem a barra de busca.

**Step 3: Commit**

```bash
git add packages/web/src/App.tsx
git commit -m "refactor: simplificar header, remover SearchBar"
```

---

### Task 2: SearchBar com modo hero/compact

**Files:**
- Modify: `packages/web/src/components/search-bar.tsx`

**Step 1: Adicionar prop `variant` à SearchBar**

A SearchBar recebe uma prop `variant` com valores `"hero"` ou `"compact"` (default `"compact"`):

```tsx
interface SearchBarProps {
  onSearch: (city: string) => void;
  loading: boolean;
  variant?: "hero" | "compact";
}

export function SearchBar({ onSearch, loading, variant = "compact" }: SearchBarProps) {
  const [city, setCity] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) onSearch(trimmed);
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 transition-all duration-300 ${
        isHero ? "w-full max-w-lg" : "w-full max-w-md"
      }`}
    >
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city name..."
        disabled={loading}
        className={`flex-1 transition-all duration-300 ${isHero ? "h-12 text-lg" : ""}`}
      />
      <Button
        type="submit"
        disabled={loading || !city.trim()}
        size={isHero ? "lg" : "default"}
        className="transition-all duration-300"
      >
        <Search className="size-4" />
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
```

**Step 2: Verificar que o componente aceita a prop sem erros**

Abrir o app e verificar que nenhum erro de TypeScript aparece.

**Step 3: Commit**

```bash
git add packages/web/src/components/search-bar.tsx
git commit -m "feat: adicionar variante hero/compact na SearchBar"
```

---

### Task 3: Layout hero → compacto no App.tsx

**Files:**
- Modify: `packages/web/src/App.tsx`

**Step 1: Implementar lógica de transição no main**

Reescrever o `<main>` para alternar entre hero e compacto baseado em `result || loading || error`:

```tsx
const hasInteracted = Boolean(result || loading || error);

return (
  <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Activity Rank</h1>
      </div>
    </header>

    <main className="mx-auto max-w-5xl px-6">
      <div
        className={`flex flex-col items-center transition-all duration-300 ${
          hasInteracted ? "py-6 items-start" : "py-24 items-center justify-center"
        }`}
      >
        {!hasInteracted && (
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-muted-foreground">
              Search for a city to see activity rankings
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              Get a 7-day forecast with the best activities for each day
            </p>
          </div>
        )}

        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          variant={hasInteracted ? "compact" : "hero"}
        />
      </div>

      {result && !loading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>
            <strong className="text-foreground">{result.location.name}</strong>,{" "}
            {result.location.country}
            <span className="ml-2 text-xs">
              ({result.location.latitude.toFixed(2)}, {result.location.longitude.toFixed(2)})
            </span>
          </span>
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {error && !loading && (
        <ErrorMessage message={error.message} onRetry={handleRetry} />
      )}

      {result && !loading && (
        <RankingGrid forecast={result.forecast} />
      )}
    </main>
  </div>
);
```

**Step 2: Verificar a transição no navegador**

1. Abrir o app — deve exibir o hero centralizado com texto descritivo + SearchBar grande
2. Buscar uma cidade — o hero deve colapsar, SearchBar fica compacta no topo, resultados aparecem abaixo
3. Redimensionar a janela — verificar que funciona em diferentes larguras

**Step 3: Commit**

```bash
git add packages/web/src/App.tsx
git commit -m "feat: implementar transição hero→compacto da SearchBar"
```

---

### Task 4: Grid responsivo no RankingGrid

**Files:**
- Modify: `packages/web/src/components/ranking-grid.tsx`

**Step 1: Substituir flex horizontal por CSS Grid**

```tsx
export function RankingGrid({ forecast }: RankingGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {forecast.map((day) => (
        <DayCard key={day.date} day={day} />
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add packages/web/src/components/ranking-grid.tsx
git commit -m "feat: substituir scroll horizontal por grid responsivo"
```

---

### Task 5: DayCard responsivo

**Files:**
- Modify: `packages/web/src/components/day-card.tsx:21`

**Step 1: Remover largura fixa**

Alterar a classe do `<Card>`:

```tsx
<Card className="w-full">
```

Antes era: `min-w-[280px] w-[280px] shrink-0`

**Step 2: Verificar no navegador**

1. Mobile (< 640px): 1 card por linha, full-width
2. Tablet (640-1023px): 2 cards por linha
3. Desktop (1024px+): 3 cards por linha

**Step 3: Commit**

```bash
git add packages/web/src/components/day-card.tsx
git commit -m "feat: tornar DayCard responsivo com largura fluida"
```

---

### Task 6: LoadingSkeleton responsivo

**Files:**
- Modify: `packages/web/src/components/loading-skeleton.tsx`

**Step 1: Atualizar skeleton para usar o mesmo grid**

```tsx
export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Verificar que o skeleton segue o mesmo layout do grid**

Buscar uma cidade e observar que o skeleton aparece no grid correto.

**Step 3: Commit**

```bash
git add packages/web/src/components/loading-skeleton.tsx
git commit -m "feat: tornar LoadingSkeleton responsivo com grid"
```

---

### Task 7: Verificação final

**Step 1: Testar todos os breakpoints**

Abrir DevTools → Device Toolbar:
- **375px** (mobile): 1 coluna, hero centralizado antes da busca, compacto depois
- **768px** (tablet): 2 colunas
- **1280px** (desktop): 3 colunas, conteúdo limitado por `max-w-5xl`

**Step 2: Testar estados**

- Estado vazio: hero com texto descritivo
- Loading: skeleton no grid correto
- Erro: mensagem de erro centralizada
- Resultados: cards no grid, location info visível

**Step 3: Commit final se houver ajustes**

```bash
git add -A
git commit -m "fix: ajustes finais de responsividade"
```
