import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AIAnalysis } from "@shared/schema";

interface AISummaryCardProps {
  analysis: AIAnalysis;
}

export function AISummaryCard({ analysis }: AISummaryCardProps) {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "BUY":
        return "bg-emerald-600 text-white hover-elevate active-elevate-2";
      case "SELL":
        return "bg-rose-600 text-white hover-elevate active-elevate-2";
      default:
        return "bg-amber-600 text-white hover-elevate active-elevate-2";
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "BUY":
        return <TrendingUp className="w-4 h-4" />;
      case "SELL":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-2 shadow-xl glass backdrop-blur-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" data-testid="icon-ai" />
            </div>
            <CardTitle className="text-2xl gradient-text">AI Analysis</CardTitle>
          </div>
          <Badge 
            className={`${getRecommendationColor(analysis.recommendation)} flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold no-default-hover-elevate no-default-active-elevate`}
            data-testid="badge-recommendation"
          >
            {getRecommendationIcon(analysis.recommendation)}
            {analysis.recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-lg leading-loose text-foreground" data-testid="text-ai-summary">
            {analysis.summary}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Level</span>
            <span className="text-sm font-semibold font-mono" data-testid="text-confidence">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>
          <Progress value={analysis.confidence * 100} className="h-2" />
        </div>

        <div className="pt-4 border-t space-y-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Reasoning
            </h4>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-reasoning">
              {analysis.reasoning}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Financial Health Score
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono" data-testid="text-health-score">
                  {analysis.financialHealthScore}
                </span>
                <span className="text-muted-foreground">/10</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Sentiment Score
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono" data-testid="text-sentiment-score">
                  {analysis.sentimentScore}
                </span>
                <span className="text-muted-foreground">/10</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
