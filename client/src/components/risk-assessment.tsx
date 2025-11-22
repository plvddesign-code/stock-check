import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Target, TrendingUp, AlertCircle } from "lucide-react";
import type { AIAnalysis, RiskDetail, OpportunityDetail } from "@shared/schema";

interface RiskAssessmentProps {
  analysis: AIAnalysis;
}

function isRiskDetail(risk: any): risk is RiskDetail {
  return risk && typeof risk === 'object' && 'title' in risk && 'why' in risk;
}

function isOpportunityDetail(opp: any): opp is OpportunityDetail {
  return opp && typeof opp === 'object' && 'title' in opp && 'why' in opp;
}

function getSourceColor(type: string) {
  switch (type) {
    case 'official': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
    case 'market': return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
    case 'news': return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
    case 'insider': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
    case 'rumor': return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
    default: return 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300';
  }
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
            Specific challenges with data-backed reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.risks && analysis.risks.length > 0 ? (
            <div className="space-y-4">
              {analysis.risks.map((risk, index) => {
                if (isRiskDetail(risk)) {
                  return (
                    <div 
                      key={index}
                      className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-100 dark:border-rose-900/50 space-y-3"
                      data-testid={`text-risk-${index}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">{risk.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                        </div>
                        {risk.severity && (
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap font-medium ${risk.severity === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : risk.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'}`}>
                            {risk.severity}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 ml-7 text-sm">
                        {risk.why && (
                          <div>
                            <p className="font-medium text-foreground">Why:</p>
                            <p className="text-muted-foreground">{risk.why}</p>
                          </div>
                        )}
                        {risk.whyNot && (
                          <div>
                            <p className="font-medium text-foreground">However:</p>
                            <p className="text-muted-foreground">{risk.whyNot}</p>
                          </div>
                        )}
                        
                        {risk.supportingData && risk.supportingData.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground text-xs">Supporting Data:</p>
                            <ul className="space-y-1 mt-1">
                              {risk.supportingData.map((data, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {data}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {risk.sources && risk.sources.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground text-xs">Sources:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {risk.sources.map((source, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-1 rounded capitalize ${getSourceColor(source.type)}`}
                                >
                                  {source.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-100 dark:border-rose-900/50" data-testid={`text-risk-${index}`}>
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed text-foreground">{risk}</span>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No significant risks identified.</p>
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
            Positive catalysts with supporting evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.opportunities && analysis.opportunities.length > 0 ? (
            <div className="space-y-4">
              {analysis.opportunities.map((opportunity, index) => {
                if (isOpportunityDetail(opportunity)) {
                  return (
                    <div 
                      key={index}
                      className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900/50 space-y-3"
                      data-testid={`text-opportunity-${index}`}
                    >
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">{opportunity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{opportunity.description}</p>
                        </div>
                        {opportunity.potential && (
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap font-medium ${opportunity.potential === 'high' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200' : opportunity.potential === 'medium' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200'}`}>
                            {opportunity.potential}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 ml-7 text-sm">
                        {opportunity.why && (
                          <div>
                            <p className="font-medium text-foreground">Why this matters:</p>
                            <p className="text-muted-foreground">{opportunity.why}</p>
                          </div>
                        )}
                        
                        {opportunity.supportingData && opportunity.supportingData.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground text-xs">Evidence:</p>
                            <ul className="space-y-1 mt-1">
                              {opportunity.supportingData.map((data, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {data}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {opportunity.sources && opportunity.sources.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground text-xs">Sources:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {opportunity.sources.map((source, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-1 rounded capitalize ${getSourceColor(source.type)}`}
                                >
                                  {source.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900/50" data-testid={`text-opportunity-${index}`}>
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed text-foreground">{opportunity}</span>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No significant opportunities identified.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
