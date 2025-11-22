import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Target } from "lucide-react";
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
        </CardHeader>
        <CardContent>
          {analysis.risks && analysis.risks.length > 0 ? (
            <ul className="space-y-3">
              {analysis.risks.map((risk, index) => (
                <li key={index} className="flex gap-3" data-testid={`text-risk-${index}`}>
                  <span className="text-rose-600 dark:text-rose-400 mt-1">•</span>
                  <span className="text-muted-foreground leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No significant risks identified</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" />
            Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.opportunities && analysis.opportunities.length > 0 ? (
            <ul className="space-y-3">
              {analysis.opportunities.map((opportunity, index) => (
                <li key={index} className="flex gap-3" data-testid={`text-opportunity-${index}`}>
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span className="text-muted-foreground leading-relaxed">{opportunity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No significant opportunities identified</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
