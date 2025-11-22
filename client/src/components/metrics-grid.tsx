import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { StockMetrics, MetricHealth } from "@shared/schema";

interface MetricsGridProps {
  metrics: StockMetrics;
}

interface MetricCardProps {
  label: string;
  value: number | null;
  tooltip: string;
  format?: (val: number) => string;
  testId: string;
  health?: MetricHealth;
}

function getColorClasses(health?: MetricHealth): string {
  if (!health) return "text-muted-foreground";
  switch (health.statusColor) {
    case "green":
      return "text-green-600 dark:text-green-400";
    case "red":
      return "text-red-600 dark:text-red-400";
    case "yellow":
      return "text-yellow-600 dark:text-yellow-400";
    case "blue":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-muted-foreground";
  }
}

function MetricCard({ label, value, tooltip, format, testId, health }: MetricCardProps) {
  const displayValue = value !== null && value !== undefined
    ? format ? format(value) : value.toFixed(2)
    : "N/A";

  const healthColorClass = getColorClasses(health);
  const bgClass = health?.statusColor === "green" 
    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
    : health?.statusColor === "red"
    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
    : health?.statusColor === "yellow"
    ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
    : "";

  return (
    <Card className={`hover-elevate ${bgClass} ${health ? "border" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </h4>
            {health && (
              <p className={`text-xs mt-1 font-medium ${healthColorClass}`}>
                {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
              </p>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="hover-elevate rounded-full p-1 transition-colors hover:bg-accent/30 hover:text-accent-foreground cursor-help"
                  data-testid={`tooltip-${testId}`}
                  aria-label={`Learn more about ${label}`}
                >
                  <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-left">
                <div className="text-sm leading-relaxed space-y-2">
                  <p className="font-semibold text-base">{label}</p>
                  <p>{tooltip}</p>
                  {health && (
                    <div className="pt-2 border-t border-muted space-y-2">
                      <p className="text-xs">
                        <span className="font-semibold">Status:</span> {health.explanation}
                      </p>
                      {health.quarterYear && (
                        <p className="text-xs text-muted-foreground">
                          Data from: {health.quarterYear}
                        </p>
                      )}
                    </div>
                  )}
                  {displayValue !== "N/A" && (
                    <p className="text-xs pt-2 border-t border-muted">
                      Current value: {displayValue}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className={`text-3xl font-semibold font-mono ${healthColorClass}`} data-testid={`metric-${testId}`}>
          {displayValue}
        </p>
      </CardContent>
    </Card>
  );
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="P/E Ratio"
        value={metrics.peRatio}
        tooltip={metrics.peExplanation || "Price-to-Earnings ratio shows how much investors pay for each dollar of earnings. Good: 15-25 (fair value), Low <15 (undervalued), High >30 (overvalued)."}
        health={metrics.peHealth}
        testId="pe-ratio"
      />
      <MetricCard
        label="EPS"
        value={metrics.eps}
        tooltip={metrics.epsExplanation || "Earnings Per Share indicates profit per share. Good: Growing YoY, Concerning: Declining or negative earnings."}
        format={(val) => `$${val.toFixed(2)}`}
        health={metrics.epsHealth}
        testId="eps"
      />
      <MetricCard
        label="Beta"
        value={metrics.beta}
        tooltip={metrics.betaExplanation || "Beta measures stock volatility. Good: <1.0 (stable), Fair: 1.0-1.5 (market-like), Concerning: >1.5 (very volatile)."}
        health={metrics.betaHealth}
        testId="beta"
      />
      <MetricCard
        label="Dividend Yield"
        value={metrics.dividendYield}
        tooltip={metrics.dividendExplanation || "Dividend Yield shows annual dividend as % of price. Good: 2-5%, Excellent: >5%, Concerning: Suspended or unstable."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        health={metrics.dividendHealth}
        testId="dividend-yield"
      />
      <MetricCard
        label="Profit Margin"
        value={metrics.profitMargin}
        tooltip={metrics.marginExplanation || "Profit Margin shows % of revenue as profit. Good: >20%, Fair: 10-20%, Concerning: <5% (vulnerable to price pressure)."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        health={metrics.marginHealth}
        testId="profit-margin"
      />
      <MetricCard
        label="Debt/Equity"
        value={metrics.debtToEquity}
        tooltip={metrics.debtExplanation || "Debt-to-Equity ratio measures leverage. Good: <0.5 (minimal risk), Fair: 0.5-1.5 (manageable), Concerning: >2.0 (over-leveraged)."}
        health={metrics.debtHealth}
        testId="debt-equity"
      />
      <MetricCard
        label="ROE"
        value={metrics.returnOnEquity}
        tooltip={metrics.roeExplanation || "Return on Equity shows profit per shareholder dollar. Good: >15%, Excellent: >20%, Concerning: <10% (inefficient capital use)."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        health={metrics.roeHealth}
        testId="roe"
      />
      <MetricCard
        label="Revenue Growth"
        value={metrics.revenueGrowth}
        tooltip={metrics.revenueExplanation || "Revenue Growth shows YoY sales increase. Good: >10% annually, Fair: 5-10%, Concerning: <0% (declining sales)."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        health={metrics.growthHealth}
        testId="revenue-growth"
      />
    </div>
  );
}
