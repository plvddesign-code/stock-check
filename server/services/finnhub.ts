import axios from "axios";
import type { StockQuote, StockMetrics, NewsItem } from "@shared/schema";

const API_KEY = "cqqr0aor01qj4n7qv4u0cqqr0aor01qj4n7qv4v0"; // Free tier key
const BASE_URL = "https://finnhub.io/api/v1";

// Fallback to a public/demo key if needed
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || API_KEY;

export interface AnalystRating {
  rating: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  count: number;
  target?: number;
  change?: string;
}

export interface SynthesizedRiskData {
  newsSentiment: {
    recentCount: number;
    newsHeadlines: string[];
    sentimentTone: "positive" | "negative" | "neutral";
    sentimentScore: number; // -1 to 1
  };
  analystRating: AnalystRating | null;
  riskFactors: string[];
  catalysts: string[];
  priceSignals: string[];
  confidence: number;
}

export async function getStockQuote(ticker: string): Promise<StockQuote> {
  try {
    const [quoteRes, profileRes] = await Promise.all([
      axios.get(`${BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_KEY}`),
      axios.get(`${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`),
    ]);

    const quote = quoteRes.data;
    const profile = profileRes.data;

    if (!quote || quote.c === undefined) {
      throw new Error(`Stock data not found for ticker: ${ticker}`);
    }

    return {
      symbol: ticker.toUpperCase(),
      companyName: profile.name || ticker,
      currentPrice: quote.c,
      previousClose: quote.pc || quote.c,
      change: quote.c - (quote.pc || quote.c),
      changePercent: ((quote.c - (quote.pc || quote.c)) / (quote.pc || quote.c)) * 100,
      marketCap: 0, // Finnhub free tier doesn't include market cap
      volume: quote.v || 0,
      averageVolume: 0,
      high: quote.h || quote.c,
      low: quote.l || quote.c,
      open: quote.o || quote.c,
      fiftyTwoWeekHigh: quote.h52 || quote.c,
      fiftyTwoWeekLow: quote.l52 || quote.c,
    };
  } catch (error: any) {
    console.error("Finnhub quote error:", error.message);
    throw new Error(`Failed to fetch stock data for ${ticker}`);
  }
}

export async function getStockMetrics(ticker: string): Promise<StockMetrics> {
  try {
    const res = await axios.get(
      `${BASE_URL}/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_KEY}`
    );

    const metrics = res.data.metric || {};

    return {
      peRatio: metrics.peNormalizedAnnual || null,
      eps: metrics.epsNormalizedAnnual || null,
      beta: metrics.beta || null,
      dividendYield: metrics.dividendYieldIndicatedAnnual || null,
      profitMargin: metrics.marginNet || null,
      debtToEquity: metrics.debtToEquity || null,
      returnOnEquity: metrics.roe || null,
      revenueGrowth: metrics.revenuePerShareGrowth3Y || null,
    };
  } catch (error: any) {
    console.error("Finnhub metrics error:", error.message);
    return {
      peRatio: null,
      eps: null,
      beta: null,
      dividendYield: null,
      profitMargin: null,
      debtToEquity: null,
      returnOnEquity: null,
      revenueGrowth: null,
    };
  }
}

export async function getStockNews(ticker: string): Promise<NewsItem[]> {
  try {
    const res = await axios.get(
      `${BASE_URL}/company-news?symbol=${ticker}&from=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&token=${FINNHUB_KEY}`
    );

    const news = res.data || [];

    return news.slice(0, 10).map((item: any) => ({
      title: item.headline || "Untitled",
      publisher: item.source || "Unknown",
      link: item.url || "#",
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      summary: item.summary || undefined,
    }));
  } catch (error: any) {
    console.error("Finnhub news error:", error.message);
    return [];
  }
}

export async function getHistoricalPrices(
  ticker: string,
  days: number = 30
): Promise<Array<{ date: string; close: number }>> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const res = await axios.get(
      `${BASE_URL}/stock/candle?symbol=${ticker}&resolution=D&from=${startTimestamp}&to=${endTimestamp}&token=${FINNHUB_KEY}`
    );

    const data = res.data;

    if (!data.c || data.c.length === 0) {
      return [];
    }

    return data.c.map((close: number, index: number) => ({
      date: new Date(data.t[index] * 1000).toISOString(),
      close,
    }));
  } catch (error: any) {
    console.error("Finnhub historical prices error:", error.message);
    return [];
  }
}

export async function getBusinessSummary(ticker: string): Promise<{
  businessSummary: string;
  sector: string;
  industry: string;
}> {
  try {
    const res = await axios.get(
      `${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`
    );

    const profile = res.data;

    return {
      businessSummary:
        profile.description ||
        `${ticker} is a publicly traded company. Detailed business information is not available at this time.`,
      sector: profile.finnhubIndustry || "Unknown",
      industry: profile.finnhubIndustry || "Unknown",
    };
  } catch (error: any) {
    console.error("Finnhub business summary error:", error.message);
    return {
      businessSummary: `${ticker} is a publicly traded company. Detailed business information is not available at this time.`,
      sector: "Unknown",
      industry: "Unknown",
    };
  }
}

/**
 * Get analyst recommendations from Finnhub
 */
export async function getAnalystRating(ticker: string): Promise<AnalystRating | null> {
  try {
    const res = await axios.get(
      `${BASE_URL}/stock/recommendation?symbol=${ticker}&token=${FINNHUB_KEY}`
    );

    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      const latest = res.data[0];
      const totalRatings = latest.buy + latest.hold + latest.sell;
      
      // Determine consensus
      let consensus: AnalystRating["rating"] = "hold";
      if (latest.strongBuy > totalRatings * 0.3) consensus = "strong_buy";
      else if (latest.buy > totalRatings * 0.4) consensus = "buy";
      else if (latest.sell > totalRatings * 0.3) consensus = "sell";
      else if (latest.strongSell > totalRatings * 0.2) consensus = "strong_sell";

      return {
        rating: consensus,
        count: totalRatings,
        target: latest.targetPrice,
        change: latest.change,
      };
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch analyst ratings for ${ticker}:`, error);
    return null;
  }
}

/**
 * Synthesize risk data from latest news, analyst sentiment, and company events
 */
export async function synthesizeRiskData(
  ticker: string,
  news: NewsItem[],
  currentPrice: number
): Promise<SynthesizedRiskData> {
  // Get analyst rating in parallel
  const analystRating = await getAnalystRating(ticker);

  // Analyze news sentiment
  const recentNews = news.slice(0, 5);
  const newsHeadlines = recentNews.map((n) => n.title);

  // Simple sentiment analysis based on keywords
  let positiveCount = 0;
  let negativeCount = 0;

  recentNews.forEach((item) => {
    const titleLower = (item.title + (item.summary || "")).toLowerCase();
    const positiveKeywords = ["beat", "surge", "strong", "growth", "profit", "upgrade", "above", "exceed"];
    const negativeKeywords = ["decline", "miss", "loss", "risk", "warning", "downgrade", "below", "disappoint"];

    positiveKeywords.forEach((kw) => {
      if (titleLower.includes(kw)) positiveCount++;
    });
    negativeKeywords.forEach((kw) => {
      if (titleLower.includes(kw)) negativeCount++;
    });
  });

  const sentimentScore = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);
  const sentimentTone: "positive" | "negative" | "neutral" =
    positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral";

  // Identify risk factors from news and analyst ratings
  const riskFactors: string[] = [];
  if (negativeCount > 0) {
    riskFactors.push(`Recent news shows ${negativeCount} negative headlines indicating potential headwinds`);
  }
  if (analystRating && (analystRating.rating === "sell" || analystRating.rating === "strong_sell")) {
    riskFactors.push(`Analyst consensus is ${analystRating.rating.replace('_', ' ')} - selling pressure expected`);
  }
  if (analystRating?.target && analystRating.target < currentPrice) {
    const downside = ((analystRating.target - currentPrice) / currentPrice * 100).toFixed(1);
    riskFactors.push(`Analysts suggest ${downside}% downside with average price target of $${analystRating.target.toFixed(2)}`);
  }

  // Identify catalysts from news
  const catalysts: string[] = [];
  const upcomingKeywords = ["earnings", "launch", "acquisition", "product", "expansion", "ipo", "buyback"];
  recentNews.forEach((item) => {
    upcomingKeywords.forEach((kw) => {
      if (item.title.toLowerCase().includes(kw)) {
        catalysts.push(item.title);
      }
    });
  });

  // Identify price signals
  const priceSignals: string[] = [];
  if (analystRating?.target && analystRating.target > currentPrice * 1.15) {
    priceSignals.push(`Analysts see ${((analystRating.target - currentPrice) / currentPrice * 100).toFixed(0)}% upside potential`);
  }
  if (sentimentTone === "positive" && positiveCount >= 3) {
    priceSignals.push(`Strong positive sentiment in recent news could drive momentum`);
  }

  return {
    newsSentiment: {
      recentCount: recentNews.length,
      newsHeadlines,
      sentimentTone,
      sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    },
    analystRating,
    riskFactors: riskFactors.slice(0, 3),
    catalysts: catalysts.slice(0, 2),
    priceSignals: priceSignals.slice(0, 2),
    confidence: (recentNews.length > 0 ? 0.5 : 0) + (analystRating ? 0.5 : 0),
  };
}
