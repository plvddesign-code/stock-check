import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Sparkles, TrendingDown, TrendingUp, AlertTriangle, Target, BarChart3, Newspaper, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { StockAnalysisResponse } from "@shared/schema";
import { StockHeader } from "@/components/stock-header";
import { AISummaryCard } from "@/components/ai-summary-card";
import { MetricsGrid } from "@/components/metrics-grid";
import { PriceChart } from "@/components/price-chart";
import { NewsList } from "@/components/news-list";
import { NewsRiskSummary } from "@/components/news-risk-summary";

export default function StockAnalysis() {
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [chartPeriodDays, setChartPeriodDays] = useState(30);
  const [, params] = useRoute("/stock/:ticker");
  const [, setLocation] = useLocation();
  const ticker = params?.ticker?.toUpperCase();

  const { data, isLoading, error } = useQuery<StockAnalysisResponse>({
    queryKey: ["/api/stock", ticker, "analysis"],
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<Array<{ date: string; close: number }>>({
    queryKey: ["/api/stock", ticker, "historical", chartPeriodDays],
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });

  if (!ticker) {
    setLocation("/");
    return null;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const is404 = errorMessage.includes("not found") || errorMessage.includes("404");
    const is502 = errorMessage.includes("502") || errorMessage.includes("external sources");

    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {is404 ? "Stock Not Found" : is502 ? "Service Unavailable" : "Error Loading Stock"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground" data-testid="text-error-message">
              {errorMessage}
            </p>
            {is502 && (
              <p className="text-sm text-muted-foreground">
                This is a temporary issue. Please try again in a few moments.
              </p>
            )}
            <Button onClick={() => setLocation("/")} className="w-full" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold font-mono">StockSense</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        ) : data ? (
          <div className="space-y-12">
            <StockHeader quote={data.quote} />
            
            {data.aiAnalysis && <AISummaryCard analysis={data.aiAnalysis} />}
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">Key Metrics</h2>
              </div>
              <MetricsGrid metrics={data.metrics} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Price Trend</h2>
                </div>
                <PriceChart 
                  data={chartData || data.historicalPrices} 
                  ticker={ticker}
                  onPeriodChange={setChartPeriodDays}
                  isLoading={chartLoading}
                />
              </div>

              <div className="space-y-6 self-start">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What This Company Does</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p 
                      className={`text-muted-foreground leading-relaxed ${!expandedSummary ? 'line-clamp-2' : ''}`}
                      data-testid="text-business-summary"
                    >
                      {data.businessSummary}
                    </p>
                    {data.businessSummary.length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedSummary(!expandedSummary)}
                        className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                        data-testid="button-read-more"
                      >
                        {expandedSummary ? (
                          <>
                            Read less
                            <ChevronUp className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Read more
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Badge variant="secondary" data-testid="badge-sector">{data.sector}</Badge>
                      <Badge variant="secondary" data-testid="badge-industry">{data.industry}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {data.newsRiskSummary && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Risk & Opportunity Analysis</h2>
                <NewsRiskSummary 
                  risks={data.newsRiskSummary.risks}
                  opportunities={data.newsRiskSummary.opportunities}
                />
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">Recent News</h2>
              </div>
              <NewsList news={data.news} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
