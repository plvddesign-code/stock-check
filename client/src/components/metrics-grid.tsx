import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { StockMetrics } from "@shared/schema";

interface MetricsGridProps {
  metrics: StockMetrics;
}

interface MetricCardProps {
  label: string;
  value: number | null;
  tooltip: string;
  format?: (val: number) => string;
  testId: string;
}

function MetricCard({ label, value, tooltip, format, testId }: MetricCardProps) {
  const displayValue = value !== null && value !== undefined
    ? format ? format(value) : value.toFixed(2)
    : "N/A";

  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="hover-elevate rounded-full" data-testid={`tooltip-${testId}`}>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-sm leading-relaxed space-y-2">
                  <p className="font-semibold text-base">{label}</p>
                  <p>{tooltip}</p>
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
        <p className="text-3xl font-semibold font-mono" data-testid={`metric-${testId}`}>
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
        tooltip={metrics.peExplanation || "Price-to-Earnings ratio shows how much investors pay for each dollar of earnings. Lower values may indicate better value, but context matters."}
        testId="pe-ratio"
      />
      <MetricCard
        label="EPS"
        value={metrics.eps}
        tooltip={metrics.epsExplanation || "Earnings Per Share indicates how much profit the company makes per share. Higher is generally better."}
        format={(val) => `$${val.toFixed(2)}`}
        testId="eps"
      />
      <MetricCard
        label="Beta"
        value={metrics.beta}
        tooltip={metrics.betaExplanation || "Beta measures stock volatility compared to the market. Above 1 means more volatile, below 1 means less volatile than the market."}
        testId="beta"
      />
      <MetricCard
        label="Dividend Yield"
        value={metrics.dividendYield}
        tooltip={metrics.dividendExplanation || "Dividend Yield shows the annual dividend payment as a percentage of the stock price. Higher yields can indicate steady income potential."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        testId="dividend-yield"
      />
      <MetricCard
        label="Profit Margin"
        value={metrics.profitMargin}
        tooltip={metrics.marginExplanation || "Profit Margin shows what percentage of revenue becomes profit. Higher margins indicate better efficiency."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        testId="profit-margin"
      />
      <MetricCard
        label="Debt/Equity"
        value={metrics.debtToEquity}
        tooltip={metrics.debtExplanation || "Debt-to-Equity ratio measures financial leverage. Lower values generally indicate less risk from debt."}
        testId="debt-equity"
      />
      <MetricCard
        label="ROE"
        value={metrics.returnOnEquity}
        tooltip={metrics.roeExplanation || "Return on Equity shows how efficiently the company uses shareholder investments to generate profit. Higher is better."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        testId="roe"
      />
      <MetricCard
        label="Revenue Growth"
        value={metrics.revenueGrowth}
        tooltip={metrics.revenueExplanation || "Revenue Growth shows the year-over-year increase in sales. Positive growth indicates expanding business."}
        format={(val) => `${(val * 100).toFixed(2)}%`}
        testId="revenue-growth"
      />
    </div>
  );
}
