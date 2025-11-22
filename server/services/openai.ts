import OpenAI from "openai";
import type { StockQuote, StockMetrics, NewsItem, AIAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateStockAnalysis(
  ticker: string,
  quote: StockQuote,
  metrics: StockMetrics,
  news: NewsItem[],
  businessSummary: string
): Promise<AIAnalysis> {
  if (!openai) {
    console.warn("OpenAI API key not configured - using fallback analysis");
    return createFallbackAnalysis(ticker, quote, metrics);
  }

  try {
    const prompt = `You are a financial analyst helping retail investors understand stocks in plain English.

Analyze ${ticker} (${quote.companyName}) and provide insights:

CURRENT DATA:
- Price: $${quote.currentPrice} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
- Market Cap: $${(quote.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${metrics.peRatio ?? 'N/A'}
- EPS: ${metrics.eps ?? 'N/A'}
- Beta: ${metrics.beta ?? 'N/A'}
- Dividend Yield: ${metrics.dividendYield ? (metrics.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
- Profit Margin: ${metrics.profitMargin ? (metrics.profitMargin * 100).toFixed(2) + '%' : 'N/A'}
- Debt/Equity: ${metrics.debtToEquity ?? 'N/A'}
- ROE: ${metrics.returnOnEquity ? (metrics.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}
- Revenue Growth: ${metrics.revenueGrowth ? (metrics.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}

BUSINESS: ${businessSummary}

RECENT NEWS: ${news.slice(0, 3).map(n => `- ${n.title}`).join('\n')}

Provide analysis in JSON format:
{
  "summary": "2-3 sentence plain-English summary of what's happening with this stock",
  "recommendation": "BUY" | "HOLD" | "SELL",
  "confidence": 0.0 to 1.0,
  "reasoning": "Clear explanation of why this recommendation makes sense",
  "risks": [
    "Risk title: Simple one-line risk description that a beginner can understand",
    "Risk title: Another clear risk explanation without jargon"
  ] (3-5 key risks, each as a simple, beginner-friendly sentence or two),
  "opportunities": [
    "Opportunity title: What could go well and why it matters for investors",
    "Opportunity title: Another positive factor explained simply"
  ] (2-4 opportunities, each beginner-friendly),
  "financialHealthScore": 1-10 (overall financial health),
  "sentimentScore": 1-10 (based on news and market sentiment)
}

IMPORTANT: Write risks and opportunities in language a complete beginner can understand. Avoid financial jargon.
For each risk/opportunity, explain WHAT it is and WHY it matters in everyday language.
Examples:
- Good risk: "High debt levels: The company has a lot of borrowing, which means more money goes to paying interest instead of growing the business"
- Good opportunity: "Strong profit margins: The company keeps more money from each sale, which could mean better returns for investors"

Focus on clarity, simplicity, and actionable insights.`;

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

    return {
      summary: result.summary || "Unable to generate summary at this time.",
      recommendation: ["BUY", "HOLD", "SELL"].includes(result.recommendation) 
        ? result.recommendation 
        : "HOLD",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Analysis unavailable.",
      risks: Array.isArray(result.risks) ? result.risks.slice(0, 5) : [],
      opportunities: Array.isArray(result.opportunities) ? result.opportunities.slice(0, 4) : [],
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
      "Limited data: Without real-time pricing data, we can't catch last-minute price swings that might signal problems",
      "Market changes: Stock prices go up and down based on overall market conditions that are hard to predict",
      "Company challenges: Any unexpected problems in the business (like losing a major customer) would affect the stock"
    ],
    opportunities: [
      "Growth potential: The company might grow faster than expected if their business expands",
      "Market demand: If customers suddenly want more of what they sell, the stock price could rise significantly"
    ],
    financialHealthScore: healthScore,
    sentimentScore,
  };
}
