import axios from "axios";
import type { StockQuote, StockMetrics, NewsItem } from "@shared/schema";

const API_KEY = "cqqr0aor01qj4n7qv4u0cqqr0aor01qj4n7qv4v0"; // Free tier key
const BASE_URL = "https://finnhub.io/api/v1";

// Fallback to a public/demo key if needed
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || API_KEY;

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
