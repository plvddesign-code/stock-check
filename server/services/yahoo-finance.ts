import yahooFinance from "yahoo-finance2";
import type { StockQuote, StockMetrics, NewsItem } from "@shared/schema";

export async function getStockQuote(ticker: string): Promise<StockQuote> {
  const quote = await yahooFinance.quote(ticker);

  if (!quote || !quote.regularMarketPrice) {
    throw new Error(`Stock data not found for ticker: ${ticker}`);
  }

  return {
    symbol: quote.symbol,
    companyName: quote.longName || quote.shortName || ticker,
    currentPrice: quote.regularMarketPrice,
    previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
    change: quote.regularMarketChange || 0,
    changePercent: quote.regularMarketChangePercent || 0,
    marketCap: quote.marketCap || 0,
    volume: quote.regularMarketVolume || 0,
    averageVolume: quote.averageVolume || 0,
    high: quote.regularMarketDayHigh || quote.regularMarketPrice,
    low: quote.regularMarketDayLow || quote.regularMarketPrice,
    open: quote.regularMarketOpen || quote.regularMarketPrice,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || quote.regularMarketPrice,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow || quote.regularMarketPrice,
  };
}

export async function getStockMetrics(ticker: string): Promise<StockMetrics> {
  const quote = await yahooFinance.quote(ticker);

  return {
    peRatio: quote.trailingPE || null,
    eps: quote.epsTrailingTwelveMonths || null,
    beta: quote.beta || null,
    dividendYield: quote.dividendYield || null,
    profitMargin: quote.profitMargins || null,
    debtToEquity: quote.debtToEquity || null,
    returnOnEquity: quote.returnOnEquity || null,
    revenueGrowth: quote.revenueGrowth || null,
  };
}

export async function getStockNews(ticker: string): Promise<NewsItem[]> {
  try {
    const search = await yahooFinance.search(ticker);
    const news = search.news || [];

    return news.slice(0, 10).map((item: any) => ({
      title: item.title || "Untitled",
      publisher: item.publisher || "Unknown",
      link: item.link || "#",
      publishedAt: item.providerPublishTime 
        ? new Date(item.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
      summary: item.summary || undefined,
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
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

    const history = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    return history.map((item) => ({
      date: item.date.toISOString(),
      close: item.close,
    }));
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return [];
  }
}

export async function getBusinessSummary(ticker: string): Promise<{
  businessSummary: string;
  sector: string;
  industry: string;
}> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: ["assetProfile", "summaryProfile"],
    });

    const profile = quote.assetProfile || quote.summaryProfile;

    return {
      businessSummary: profile?.longBusinessSummary || 
        `${ticker} is a publicly traded company. Detailed business information is not available at this time.`,
      sector: profile?.sector || "Unknown",
      industry: profile?.industry || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching business summary:", error);
    return {
      businessSummary: `${ticker} is a publicly traded company. Detailed business information is not available at this time.`,
      sector: "Unknown",
      industry: "Unknown",
    };
  }
}
