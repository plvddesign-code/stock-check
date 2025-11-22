import { TrendingUp, TrendingDown } from "lucide-react";
import type { StockQuote } from "@shared/schema";

interface StockHeaderProps {
  quote: StockQuote;
}

export function StockHeader({ quote }: StockHeaderProps) {
  const isPositive = quote.change >= 0;
  const changePercent = Math.abs(quote.changePercent);

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-accent shadow-xl p-8 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50" />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-6xl md:text-7xl font-bold font-mono mb-2 text-white" data-testid="text-ticker">
            {quote.symbol}
          </h1>
          <p className="text-xl md:text-2xl text-white/80" data-testid="text-company-name">
            {quote.companyName}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-sm text-white/70 mb-1">Current Price</p>
            <p className="text-5xl md:text-6xl font-bold font-mono text-white" data-testid="text-current-price">
              ${quote.currentPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-emerald-300" data-testid="icon-trend-up" />
            ) : (
              <TrendingDown className="w-6 h-6 text-rose-300" data-testid="icon-trend-down" />
            )}
            <div>
              <p className={`text-2xl md:text-3xl font-semibold font-mono ${
                isPositive ? "text-emerald-300" : "text-rose-300"
              }`} data-testid="text-price-change">
                {isPositive ? "+" : ""}{quote.change.toFixed(2)}
              </p>
              <p className={`text-lg font-medium ${
                isPositive ? "text-emerald-300" : "text-rose-300"
              }`} data-testid="text-price-change-percent">
                ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-sm text-white/70 mb-1">Market Cap</p>
            <p className="text-lg font-semibold font-mono text-white" data-testid="text-market-cap">
              ${(quote.marketCap / 1e9).toFixed(2)}B
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Volume</p>
            <p className="text-lg font-semibold font-mono text-white" data-testid="text-volume">
              {(quote.volume / 1e6).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">52W High</p>
            <p className="text-lg font-semibold font-mono text-white" data-testid="text-52w-high">
              ${quote.fiftyTwoWeekHigh.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">52W Low</p>
            <p className="text-lg font-semibold font-mono text-white" data-testid="text-52w-low">
              ${quote.fiftyTwoWeekLow.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
