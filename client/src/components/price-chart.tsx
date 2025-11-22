import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceChartProps {
  data: Array<{ date: string; close: number }>;
  ticker: string;
  onPeriodChange?: (days: number) => void;
  isLoading?: boolean;
}

type TimePeriod = "1d" | "5d" | "1m" | "6m" | "1y" | "max";

const periodConfig: Record<TimePeriod, { label: string; days: number }> = {
  "1d": { label: "1D", days: 1 },
  "5d": { label: "5D", days: 5 },
  "1m": { label: "1M", days: 30 },
  "6m": { label: "6M", days: 180 },
  "1y": { label: "1Y", days: 365 },
  "max": { label: "Max", days: 1825 },
};

export function PriceChart({ data, ticker, onPeriodChange, isLoading }: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1m");

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    onPeriodChange?.(periodConfig[period].days);
  };

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: item.close,
  }));

  const minPrice = data.length > 0 ? Math.min(...data.map((d) => d.close)) : 0;
  const maxPrice = data.length > 0 ? Math.max(...data.map((d) => d.close)) : 0;
  const priceRange = maxPrice - minPrice || 1;
  const yAxisMin = Math.max(0, minPrice - priceRange * 0.1);
  const yAxisMax = maxPrice + priceRange * 0.1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Movement</CardTitle>
          <div className="flex gap-2" data-testid="chart-period-filters">
            {(Object.entries(periodConfig) as Array<[TimePeriod, typeof periodConfig[TimePeriod]]>).map(([period, config]) => (
              <Button
                key={period}
                size="sm"
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => handlePeriodChange(period)}
                disabled={isLoading}
                className="min-w-fit"
                data-testid={`button-period-${period}`}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64" data-testid="chart-price-trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[yAxisMin, yAxisMax]}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
