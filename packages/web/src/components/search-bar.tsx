import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [city, setCity] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city name..."
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !city.trim()} size="default">
        <Search data-icon="inline-start" className="size-4" />
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
