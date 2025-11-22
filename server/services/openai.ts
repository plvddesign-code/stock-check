import OpenAI from "openai";
import type { StockQuote, StockMetrics, NewsItem, AIAnalysis } from "@shared/schema";
import { enrichMetrics, generateRiskNarrative, type EnrichedMetrics } from "./financial-metrics";
import type { SynthesizedRiskData } from "./finnhub";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateStockAnalysis(
  ticker: string,
  quote: StockQuote,
  metrics: StockMetrics,
  news: NewsItem[],
  businessSummary: string,
  synthesizedRiskData?: SynthesizedRiskData
): Promise<AIAnalysis> {
  if (!openai) {
    console.warn("OpenAI API key not configured - using fallback analysis");
    return createFallbackAnalysis(ticker, quote, metrics);
  }

  try {
    // Calculate enriched metrics for more specific risk analysis
    const enriched = enrichMetrics(quote, metrics);
    const riskNarrative = generateRiskNarrative(enriched);

    const prompt = `You are a financial analyst helping retail investors understand stocks in plain English.

Analyze ${ticker} (${quote.companyName}) with SPECIFIC, DATA-BACKED conclusions:

CURRENT PRICE & MOMENTUM:
- Price: $${quote.currentPrice} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
- Volume: ${(quote.volume / 1e6).toFixed(1)}M shares daily
- 52-week Range: $${quote.fiftyTwoWeekLow.toFixed(2)} - $${quote.fiftyTwoWeekHigh.toFixed(2)}

VALUATION & PROFITABILITY:
- P/E Ratio: ${metrics.peRatio?.toFixed(1) ?? 'N/A'} (${enriched.valuationRisk.peRatioRisk})
- Profit Margin: ${metrics.profitMargin ? (metrics.profitMargin * 100).toFixed(1) : 'N/A'}% (${enriched.profitabilityRisk.marginTrend})
- EPS: $${metrics.eps?.toFixed(2) ?? 'N/A'}
- ROE: ${metrics.returnOnEquity ? (metrics.returnOnEquity * 100).toFixed(1) : 'N/A'}%

FINANCIAL HEALTH:
- Debt/Equity: ${metrics.debtToEquity?.toFixed(2) ?? 'N/A'} (${enriched.leverageRisk.debtRisk})
- Revenue Growth: ${metrics.revenueGrowth ? (metrics.revenueGrowth * 100).toFixed(1) : 'N/A'}% (${enriched.growthRisk.growthRealism})
- Beta: ${metrics.beta?.toFixed(2) ?? 'N/A'} (${enriched.volatilityRisk.volatilityLevel})
- Dividend Yield: ${metrics.dividendYield ? (metrics.dividendYield * 100).toFixed(2) + '%' : 'None'}

RISK ASSESSMENT:
- Overall Risk Score: ${enriched.overallRiskScore}/10 (${enriched.riskProfile} profile)
- Key Risks: ${riskNarrative.keyRisks.slice(0, 3).join('; ') || 'None identified'}
- Key Opportunities: ${riskNarrative.keyOpportunities.slice(0, 3).join('; ') || 'Standard growth prospects'}

REAL-TIME NEWS & SENTIMENT ANALYSIS:
- Recent News Count: ${synthesizedRiskData?.newsSentiment.recentCount || 0} articles
- Sentiment Tone: ${synthesizedRiskData?.newsSentiment.sentimentTone || 'neutral'} (score: ${synthesizedRiskData?.newsSentiment.sentimentScore?.toFixed(2)})
- News Headlines: ${synthesizedRiskData?.newsSentiment.newsHeadlines.slice(0, 3).join('; ') || 'No recent news'}
- Analyst Rating: ${synthesizedRiskData?.analystRating?.rating?.replace('_', ' ').toUpperCase() || 'Not available'} (${synthesizedRiskData?.analystRating?.count || 0} analysts)
${synthesizedRiskData?.analystRating?.target ? `- Price Target: $${synthesizedRiskData.analystRating.target.toFixed(2)}` : ''}
- Identified Risks: ${synthesizedRiskData?.riskFactors.slice(0, 2).join('; ') || 'None from latest data'}
- Price Signals: ${synthesizedRiskData?.priceSignals.slice(0, 2).join('; ') || 'Neutral price momentum'}
- Catalysts: ${synthesizedRiskData?.catalysts.slice(0, 2).join('; ') || 'Standard operational execution'}

BUSINESS: ${businessSummary}

RECENT NEWS: ${news.slice(0, 3).map(n => `- ${n.title} (${n.publisher})`).join('\n')}

Provide analysis in JSON format with DETAILED, DATA-BACKED reasoning:
{
  "summary": "2-3 sentence plain-English summary of what's happening with this stock",
  "recommendation": "BUY" | "HOLD" | "SELL",
  "confidence": 0.0 to 1.0,
  "reasoning": "Clear explanation with specific metrics and data supporting the recommendation",
  "risks": [
    {
      "title": "Risk Title",
      "description": "What this risk is in simple terms",
      "why": "Specific reason WHY this is a risk with data. E.g., 'The company's profit margins of 10% are declining compared to industry average of 15%, meaning less money left for growth'",
      "whyNot": "Why it might NOT be a risk or counterargument",
      "supportingData": ["Margin declined from 12% to 10%", "Industry average: 15%", "Company targets 12% by 2026"],
      "sources": [
        { "type": "official", "label": "10-K Filing", "data": "Latest earnings report shows margin compression" },
        { "type": "market", "label": "Industry Analysis", "data": "Competitors average 15-18% margins" },
        { "type": "news", "label": "Market News", "data": "Recent guidance indicates margin recovery expected" }
      ],
      "severity": "medium"
    }
  ] (3-5 detailed risks with specific data),
  "opportunities": [
    {
      "title": "Opportunity Title",
      "description": "What this opportunity is",
      "why": "Specific reason WHY this is an opportunity. E.g., 'Revenue growing at 16% annually while competitors grow at 8%, indicating market share gains'",
      "supportingData": ["Revenue growth: 16% vs competitor average 8%", "New market segment entering Q1 2026", "Partnership announced with major retailer"],
      "sources": [
        { "type": "official", "label": "Earnings Call", "data": "Management highlighted new segment potential" },
        { "type": "market", "label": "Analyst Reports", "data": "Average price target suggests 30% upside" },
        { "type": "news", "label": "Partnership News", "data": "New distribution deal announced yesterday" }
      ],
      "potential": "high"
    }
  ] (2-4 detailed opportunities with specific data and sources),
  "financialHealthScore": 1-10 (overall financial health),
  "sentimentScore": 1-10 (based on news and market sentiment)
}

IMPORTANT INSTRUCTIONS:
1. BASE ALL RECOMMENDATIONS ON SPECIFIC, REAL-TIME DATA PROVIDED
2. Use actual numbers from analyst ratings, news sentiment, and financial metrics - don't generalize
3. For each risk/opportunity, explain the MECHANISM with specific evidence from the data provided
4. Label sources accurately: Official (earnings/analyst ratings), Market (sentiment/price targets), News (recent articles with actual links)
5. Include BOTH "why" it matters AND "why not" (counterarguments) using the actual data
6. Confidence should be HIGH if multiple data sources align, LOWER if signals are mixed
7. Risk severity: HIGH if negative sentiment + poor metrics, MEDIUM if isolated concern, LOW if offset by positives
8. Opportunity potential: HIGH if analyst upside + positive sentiment, MEDIUM if one factor positive, LOW if speculative

Use real-time analyst ratings, news sentiment scores, and price targets as core evidence. Every claim must reference actual data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst who explains complex financial information in simple, everyday language for retail investors."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Process risks - could be strings or detailed RiskDetail objects
    const processedRisks = Array.isArray(result.risks) 
      ? result.risks.slice(0, 5).map((risk: any) => {
          if (typeof risk === 'string') return risk;
          return {
            title: risk.title || "Risk",
            description: risk.description || "",
            why: risk.why || "",
            whyNot: risk.whyNot,
            supportingData: risk.supportingData || [],
            sources: risk.sources || [],
            severity: risk.severity || "medium"
          };
        })
      : [];

    // Process opportunities - could be strings or detailed OpportunityDetail objects
    const processedOpportunities = Array.isArray(result.opportunities)
      ? result.opportunities.slice(0, 4).map((opp: any) => {
          if (typeof opp === 'string') return opp;
          return {
            title: opp.title || "Opportunity",
            description: opp.description || "",
            why: opp.why || "",
            supportingData: opp.supportingData || [],
            sources: opp.sources || [],
            potential: opp.potential || "medium"
          };
        })
      : [];

    return {
      summary: result.summary || "Unable to generate summary at this time.",
      recommendation: ["BUY", "HOLD", "SELL"].includes(result.recommendation) 
        ? result.recommendation 
        : "HOLD",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Analysis unavailable.",
      risks: processedRisks,
      opportunities: processedOpportunities,
      financialHealthScore: Math.max(1, Math.min(10, Math.round(result.financialHealthScore || 5))),
      sentimentScore: Math.max(1, Math.min(10, Math.round(result.sentimentScore || 5))),
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    return createFallbackAnalysis(ticker, quote, metrics);
  }
}

function createFallbackAnalysis(
  ticker: string,
  quote: StockQuote,
  metrics: StockMetrics
): AIAnalysis {
  const isPositive = quote.changePercent >= 0;
  const peRatio = metrics.peRatio || 0;
  const profitMargin = metrics.profitMargin || 0;
  
  let recommendation: "BUY" | "HOLD" | "SELL" = "HOLD";
  let healthScore = 5;
  let sentimentScore = isPositive ? 6 : 4;
  
  if (peRatio > 0 && peRatio < 15 && profitMargin > 0.1) {
    recommendation = "BUY";
    healthScore = 7;
  } else if (peRatio > 50 || profitMargin < 0) {
    recommendation = "SELL";
    healthScore = 3;
  }

  return {
    summary: `${quote.companyName} is currently trading at $${quote.currentPrice.toFixed(2)}, showing ${isPositive ? 'positive' : 'negative'} momentum with a ${Math.abs(quote.changePercent).toFixed(2)}% ${isPositive ? 'gain' : 'loss'} in recent trading. ${peRatio > 0 ? `The P/E ratio of ${peRatio.toFixed(2)} suggests ${peRatio < 20 ? 'reasonable' : 'elevated'} valuation levels.` : ''}`,
    recommendation,
    confidence: 0.6,
    reasoning: "Basic analysis based on financial metrics. For detailed AI-powered insights, please configure your OpenAI API key.",
    risks: [
      {
        title: "Limited Real-Time Data",
        description: "The analysis is based on limited market data available",
        why: "Without access to real-time pricing and advanced data sources, we cannot catch intraday market signals that might indicate emerging problems",
        whyNot: "Daily analysis is sufficient for most long-term investors who don't trade frequently",
        supportingData: ["Current price data", "Recent momentum indicators"],
        sources: [{ type: "market" as const, label: "Market Data", data: "Price movement tracking" }],
        severity: "low" as const
      },
      {
        title: "Market Volatility Risk",
        description: "Overall market conditions could impact this stock",
        why: `Stock prices are influenced by broad market movements. If the market declines 10%, this stock could fall more or less depending on its volatility`,
        whyNot: "Diversification and long-term holding can mitigate short-term market swings",
        supportingData: ["Market sensitivity", "Historical volatility"],
        sources: [{ type: "market" as const, label: "Market Analysis", data: "Broader economic factors" }],
        severity: "medium" as const
      },
      {
        title: "Company-Specific Challenges",
        description: "Unexpected business changes could harm the stock",
        why: "Any major negative news (leadership change, major customer loss, product recall) would immediately impact stock price",
        whyNot: "Strong companies have resilience and can recover from setbacks if fundamentals remain solid",
        supportingData: ["Company fundamentals", "Industry position"],
        sources: [{ type: "news" as const, label: "Company News", data: "Recent announcements and guidance" }],
        severity: "medium" as const
      }
    ],
    opportunities: [
      {
        title: "Business Expansion",
        description: "The company could grow faster than expected",
        why: "If the company enters new markets or launches successful products, revenue could grow beyond current expectations, driving stock price appreciation",
        supportingData: ["Growth projections", "Market potential"],
        sources: [{ type: "official" as const, label: "Company Guidance", data: "Management outlook on expansion" }],
        potential: "medium" as const
      },
      {
        title: "Market Demand Growth",
        description: "Customer demand could exceed projections",
        why: "If the company's products become more popular than expected (tech trends, consumer preferences), revenue and profits could surge significantly",
        supportingData: ["Industry trends", "Market demand indicators"],
        sources: [{ type: "market" as const, label: "Market Trends", data: "Consumer spending patterns" }],
        potential: "high" as const
      }
    ],
    financialHealthScore: healthScore,
    sentimentScore,
  };
}
