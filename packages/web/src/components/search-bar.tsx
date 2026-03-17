import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
        className={`transition-all duration-300 ${isHero ? "h-12" : ""}`}
      >
        <Search className="size-4" />
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
