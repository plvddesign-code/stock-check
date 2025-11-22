import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Target, TrendingUp, AlertCircle } from "lucide-react";
import type { AIAnalysis } from "@shared/schema";

interface RiskAssessmentProps {
  analysis: AIAnalysis;
}

export function RiskAssessment({ analysis }: RiskAssessmentProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-rose-200 dark:border-rose-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            Key Risks
          </CardTitle>
          <CardDescription>
            Things that could negatively impact this investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.risks && analysis.risks.length > 0 ? (
            <ul className="space-y-4">
              {analysis.risks.map((risk, index) => (
                <li 
                  key={index} 
                  className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-100 dark:border-rose-900/50" 
                  data-testid={`text-risk-${index}`}
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed text-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No significant risks identified at this time.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" />
            Opportunities
          </CardTitle>
          <CardDescription>
            Things that could positively impact this investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.opportunities && analysis.opportunities.length > 0 ? (
            <ul className="space-y-4">
              {analysis.opportunities.map((opportunity, index) => (
                <li 
                  key={index} 
                  className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900/50" 
                  data-testid={`text-opportunity-${index}`}
                >
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed text-foreground">{opportunity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No significant opportunities identified at this time.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
