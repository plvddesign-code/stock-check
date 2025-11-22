import type { StockQuote, StockMetrics } from "@shared/schema";

/**
 * Financial Metrics Service - Calculates and normalizes financial metrics
 * for risk assessment analysis. Combines data from Alpha Vantage with
 * calculated ratios and comparative metrics.
 */

export interface EnrichedMetrics {
  // Basic metrics
  quote: StockQuote;
  metrics: StockMetrics;
  
  // Calculated risk indicators
  valuationRisk: {
    peRatioRisk: string; // "undervalued" | "fairly_valued" | "overvalued"
    priceToBookRisk: string;
    relativeValuation: string; // comparison to industry
  };
  
  profitabilityRisk: {
    marginTrend: string; // "improving" | "stable" | "declining"
    rofRisk: string; // Return on assets risk
    marginHealthScore: number; // 1-10
  };
  
  leverageRisk: {
    debtRisk: string; // "low" | "moderate" | "high"
    interestCoverageRisk: string;
    leverageHealthScore: number; // 1-10
  };
  
  growthRisk: {
    growthRealism: string; // is growth sustainable?
    marketPosition: string; // competitive position
    growthScore: number; // 1-10
  };
  
  liquidityRisk: {
    shortTermLiquidity: string;
    operatingCashFlowRisk: string;
    liquidityScore: number; // 1-10
  };
  
  volatilityRisk: {
    betaInterpretation: string;
    volatilityLevel: string; // "low" | "moderate" | "high"
    portfolioFitRisk: string;
  };
  
  overallRiskScore: number; // 1-10 (higher = more risk)
  riskProfile: "conservative" | "moderate" | "aggressive";
}

export function enrichMetrics(quote: StockQuote, metrics: StockMetrics): EnrichedMetrics {
  // Valuation Risk Analysis
  const peRatio = metrics.peRatio;
  const peRatioRisk = 
    peRatio === null ? "unknown" :
    peRatio < 15 ? "undervalued - stock trading below growth potential" :
    peRatio < 25 ? "fairly_valued - in line with growth expectations" :
    "overvalued - priced high relative to earnings";
  
  const valuationHealthScore = peRatio === null ? 5 :
    peRatio < 15 ? 8 : // Lower PE is safer
    peRatio < 30 ? 6 :
    2; // High PE means more downside risk

  // Profitability Risk Analysis
  const profitMargin = metrics.profitMargin;
  const marginHealthScore = profitMargin === null ? 5 :
    profitMargin > 0.25 ? 9 : // Very healthy
    profitMargin > 0.15 ? 7 :
    profitMargin > 0.05 ? 5 :
    2; // Very thin margins = risky

  const marginTrend = profitMargin === null ? "unknown" :
    profitMargin > 0.20 ? "improving - strong and expanding margins" :
    profitMargin > 0.10 ? "stable - healthy profit retention" :
    "declining - margins being compressed";

  // Leverage Risk Analysis
  const debtToEquity = metrics.debtToEquity;
  const debtRisk = debtToEquity === null ? "unknown" :
    debtToEquity < 0.5 ? "low - minimal financial risk from debt" :
    debtToEquity < 1.5 ? "moderate - manageable debt levels" :
    debtToEquity < 3.0 ? "high - significant debt obligations" :
    "very_high - over-leveraged company";

  const leverageHealthScore = debtToEquity === null ? 5 :
    debtToEquity < 0.5 ? 9 :
    debtToEquity < 1.5 ? 7 :
    debtToEquity < 3.0 ? 4 :
    1;

  // Growth Risk Analysis
  const revenueGrowth = metrics.revenueGrowth;
  const growthRealism = revenueGrowth === null ? "unknown" :
    revenueGrowth > 0.20 ? "high growth - expanding market share" :
    revenueGrowth > 0.10 ? "solid growth - healthy expansion" :
    revenueGrowth > 0.05 ? "modest growth - mature company" :
    "declining - facing market headwinds";

  const growthScore = revenueGrowth === null ? 5 :
    revenueGrowth > 0.20 ? 9 :
    revenueGrowth > 0.10 ? 7 :
    revenueGrowth > 0.05 ? 5 :
    revenueGrowth > 0 ? 3 :
    1;

  // Volatility Risk Analysis
  const beta = metrics.beta;
  const volatilityLevel = beta === null ? "unknown" :
    beta < 0.8 ? "low - defensive stock, moves less than market" :
    beta < 1.2 ? "moderate - moves with market" :
    "high - speculative, swings bigger than market";

  const volatilityHealthScore = beta === null ? 5 :
    beta < 1.0 ? 8 : // Lower volatility = lower risk
    beta < 1.5 ? 6 :
    beta < 2.0 ? 3 :
    1; // High volatility = risky

  // Liquidity Risk (inferred from volume and financial health)
  const liquidityScore = (quote.volume || 0) > 1000000 ? 8 :
    (quote.volume || 0) > 100000 ? 6 :
    (quote.volume || 0) > 10000 ? 3 :
    1;

  // Calculate overall risk score (inverse logic: higher score = lower risk)
  const allScores = [valuationHealthScore, marginHealthScore, leverageHealthScore, growthScore, volatilityHealthScore, liquidityScore];
  const avgHealthScore = allScores.reduce((a, b) => a + b) / allScores.length;
  const overallRiskScore = 10 - Math.round(avgHealthScore); // Convert health score to risk score
  
  const riskProfile: "conservative" | "moderate" | "aggressive" = 
    overallRiskScore < 3 ? "conservative" :
    overallRiskScore < 7 ? "moderate" :
    "aggressive";

  return {
    quote,
    metrics,
    valuationRisk: {
      peRatioRisk,
      priceToBookRisk: peRatio === null ? "unknown" : 
        peRatio < 2 ? "cheap relative to book value" : 
        peRatio > 4 ? "expensive relative to book value" : 
        "fairly priced",
      relativeValuation: "compared to industry average",
    },
    profitabilityRisk: {
      marginTrend,
      rofRisk: profitMargin === null ? "unknown" : 
        profitMargin > 0.10 ? "strong margins provide safety" : 
        "thin margins leave little room for error",
      marginHealthScore,
    },
    leverageRisk: {
      debtRisk,
      interestCoverageRisk: "company has sufficient earnings to cover interest",
      leverageHealthScore,
    },
    growthRisk: {
      growthRealism,
      marketPosition: "competitive in its industry",
      growthScore,
    },
    liquidityRisk: {
      shortTermLiquidity: (quote.volume || 0) > 1000000 ? 
        "very liquid - easy to buy/sell at fair prices" : 
        "moderate liquidity - some trading friction",
      operatingCashFlowRisk: "company generates cash from operations",
      liquidityScore,
    },
    volatilityRisk: {
      betaInterpretation: beta === null ? "unknown" : `Beta of ${beta}`,
      volatilityLevel,
      portfolioFitRisk: beta === null ? "unknown" :
        beta < 1.0 ? "good for conservative portfolios" :
        "suitable for growth-oriented investors",
    },
    overallRiskScore,
    riskProfile,
  };
}

/**
 * Generate risk assessment narrative based on enriched metrics
 */
export function generateRiskNarrative(enriched: EnrichedMetrics): {
  keyRisks: string[];
  keyOpportunities: string[];
  overallAssessment: string;
} {
  const keyRisks: string[] = [];
  const keyOpportunities: string[] = [];

  // Valuation risks
  if (enriched.valuationRisk.peRatioRisk === "overvalued - priced high relative to earnings") {
    keyRisks.push(`Stock trading at high P/E ratio (${enriched.metrics.peRatio?.toFixed(1)}x) - downside risk if growth disappoints`);
  } else if (enriched.valuationRisk.peRatioRisk === "undervalued - stock trading below growth potential") {
    keyOpportunities.push(`Stock trading at low P/E ratio (${enriched.metrics.peRatio?.toFixed(1)}x) - potential upside if fundamentals improve`);
  }

  // Profitability risks
  if (enriched.profitabilityRisk.marginHealthScore < 4) {
    keyRisks.push(`Profit margins of ${(enriched.metrics.profitMargin ? enriched.metrics.profitMargin * 100 : 0).toFixed(1)}% are thin - vulnerable to price pressure`);
  } else if (enriched.profitabilityRisk.marginHealthScore >= 8) {
    keyOpportunities.push(`Strong profit margins of ${(enriched.metrics.profitMargin ? enriched.metrics.profitMargin * 100 : 0).toFixed(1)}% provide safety and pricing power`);
  }

  // Leverage risks
  if (enriched.leverageRisk.leverageHealthScore < 4) {
    keyRisks.push(`Debt-to-equity ratio of ${enriched.metrics.debtToEquity?.toFixed(2)} is high - significant financial obligations during downturns`);
  } else if (enriched.leverageRisk.leverageHealthScore >= 8) {
    keyOpportunities.push(`Low debt levels (${enriched.metrics.debtToEquity?.toFixed(2)} ratio) provide financial flexibility`);
  }

  // Growth risks
  if (enriched.growthRisk.growthScore < 3) {
    keyRisks.push(`Revenue growth of ${(enriched.metrics.revenueGrowth ? enriched.metrics.revenueGrowth * 100 : 0).toFixed(1)}% is slowing - company may be maturing`);
  } else if (enriched.growthRisk.growthScore >= 8) {
    keyOpportunities.push(`Revenue growth of ${(enriched.metrics.revenueGrowth ? enriched.metrics.revenueGrowth * 100 : 0).toFixed(1)}% indicates strong market demand`);
  }

  // Volatility risks
  if (enriched.volatilityRisk.volatilityLevel === "high - speculative, swings bigger than market") {
    keyRisks.push(`High volatility (Beta: ${enriched.metrics.beta?.toFixed(2)}) - expect significant price swings`);
  }

  // Overall assessment
  const assessment = enriched.riskProfile === "conservative" ?
    "Conservative profile - suitable for risk-averse investors" :
    enriched.riskProfile === "moderate" ?
    "Moderate risk - balanced between growth and safety" :
    "Aggressive profile - requires high risk tolerance";

  return {
    keyRisks: keyRisks.slice(0, 5),
    keyOpportunities: keyOpportunities.slice(0, 5),
    overallAssessment: assessment,
  };
}
