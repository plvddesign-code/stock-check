import { useState } from "react";
import { useLocation } from "wouter";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setLocation(`/stock/${ticker.toUpperCase()}`);
    }
  };

  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)",
          animation: "gradient 15s ease infinite"
        }}
      />
      <style>{`
        @keyframes gradient {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.05) saturate(1.1); }
        }
      `}</style>

      {/* Content with semi-transparent dark overlay for accessibility */}
      <div className="relative z-10">
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" data-testid="icon-logo" />
              <h1 className="text-xl font-semibold font-mono" data-testid="text-app-name">StockSense</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-3xl w-full space-y-12 bg-background/70 backdrop-blur rounded-2xl p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Stock Analysis</span>
              </div>

              <h2
                className="text-5xl md:text-6xl font-bold tracking-tight text-foreground"
                data-testid="text-hero-title"
              >
                Explain the real story <br />
                <span className="text-primary">behind any stock</span>
              </h2>

              <p
                className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto"
                data-testid="text-hero-subtitle"
              >
                Get plain-English explanations of financial metrics, risks, and opportunities.
                No jargon, just clarity.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                <Input
                  type="text"
                  placeholder="Enter stock ticker (e.g., AAPL, TSLA, MSFT)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="pl-12 h-14 text-lg bg-background/60 border-foreground/20 text-foreground placeholder:text-foreground/50"
                  data-testid="input-ticker-search"
                  aria-label="Stock ticker search input"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                data-testid="button-analyze"
              >
                Analyze Stock
              </Button>
            </form>

            <div className="space-y-3">
              <p className="text-sm text-foreground/70 text-center">Popular stocks</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularStocks.map((stock) => (
                  <Button
                    key={stock}
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/stock/${stock}`)}
                    className="font-mono"
                    data-testid={`button-popular-${stock.toLowerCase()}`}
                  >
                    {stock}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t bg-background/80 backdrop-blur-sm py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-foreground/70">
            Built for retail investors who want clarity, not complexity
          </div>
        </footer>
      </div>
    </div>
  );
}
