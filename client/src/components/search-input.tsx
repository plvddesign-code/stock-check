import { useState, useRef, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

interface SearchInputProps {
  onSelect: (ticker: string) => void;
  onSubmit?: () => void;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ onSelect, value, onChange, onSubmit }: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value.toUpperCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Fetch search results
  const { data: results } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", debouncedValue],
    queryFn: async () => {
      if (!debouncedValue || debouncedValue.length < 1) {
        return [];
      }
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedValue)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: debouncedValue.length > 0,
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (ticker: string) => {
    onChange(ticker);
    onSelect(ticker);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsOpen(false);
      onSubmit?.();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by ticker or company name (e.g., AAPL, Apple)"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(value.length > 0)}
          className="pl-12 h-14 text-lg bg-background/60 border-foreground/20 text-foreground placeholder:text-foreground/50"
          data-testid="input-ticker-search"
          aria-label="Stock search input"
          autoComplete="off"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-foreground/20 rounded-lg shadow-lg z-50 overflow-hidden"
          data-testid="dropdown-search-results"
        >
          {results.map((result) => (
            <button
              key={result.ticker}
              onClick={() => handleSelectResult(result.ticker)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors text-left border-b border-foreground/10 last:border-b-0"
              data-testid={`button-search-result-${result.ticker}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{result.ticker}</div>
                <div className="text-sm text-foreground/70 truncate">
                  {result.name}
                  {result.exchange && result.exchange !== "Unknown" && (
                    <span className="ml-2 text-foreground/50">• {result.exchange}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/50 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && results && results.length === 0 && debouncedValue.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-foreground/20 rounded-lg shadow-lg z-50 px-4 py-3 text-sm text-foreground/70"
          data-testid="text-no-results"
        >
          No companies found. Try a different search.
        </div>
      )}
    </div>
  );
}
