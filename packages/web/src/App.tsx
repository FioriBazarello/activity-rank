import { useLazyQuery } from "@apollo/client/react";
import { ACTIVITY_RANKING_QUERY } from "@/graphql/queries";
import type { ActivityRankingQuery } from "@/types/graphql";
import { SearchBar } from "@/components/search-bar";
import { RankingGrid } from "@/components/ranking-grid";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorMessage } from "@/components/error-message";
import { MapPin } from "lucide-react";

function App() {
  const [fetchRanking, { data, loading, error }] = useLazyQuery<ActivityRankingQuery>(
    ACTIVITY_RANKING_QUERY,
  );

  function handleSearch(city: string) {
    fetchRanking({ variables: { city } });
  }

  function handleRetry() {
    fetchRanking();
  }

  const result = data?.activityRanking;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight shrink-0">Activity Rank</h1>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {result && (
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

        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <p className="text-lg font-medium">Search for a city to see activity rankings</p>
            <p className="text-sm mt-1">
              Get a 7-day forecast with the best activities for each day
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
