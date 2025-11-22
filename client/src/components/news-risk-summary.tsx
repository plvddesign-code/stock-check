import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface NewsRiskSummaryProps {
  risks?: string[];
  opportunities?: string[];
}

export function NewsRiskSummary({ risks = [], opportunities = [] }: NewsRiskSummaryProps) {
  const hasContent = risks.length > 0 || opportunities.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {risks.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              Key Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {risks.map((risk, index) => (
                <li 
                  key={index}
                  className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-100 dark:border-rose-900/50"
                  data-testid={`text-risk-news-${index}`}
                >
                  <span className="text-rose-600 dark:text-rose-400 font-bold min-w-fit">•</span>
                  <span className="text-sm leading-relaxed text-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {opportunities.length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              Key Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {opportunities.map((opportunity, index) => (
                <li 
                  key={index}
                  className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900/50"
                  data-testid={`text-opportunity-news-${index}`}
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold min-w-fit">•</span>
                  <span className="text-sm leading-relaxed text-foreground">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
