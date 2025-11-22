import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceChartProps {
  data: Array<{ date: string; close: number }>;
  ticker: string;
}

export function PriceChart({ data, ticker }: PriceChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: item.close,
  }));

  const minPrice = Math.min(...data.map((d) => d.close));
  const maxPrice = Math.max(...data.map((d) => d.close));
  const priceRange = maxPrice - minPrice;
  const yAxisMin = Math.max(0, minPrice - priceRange * 0.1);
  const yAxisMax = maxPrice + priceRange * 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">30-Day Price Movement</CardTitle>
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
