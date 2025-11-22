import YahooFinance from "yahoo-finance2";
import type { StockQuote, StockMetrics, NewsItem, MetricHealth } from "@shared/schema";

const yahooFinance = new YahooFinance();

/**
 * Calculate health status for a metric based on value and thresholds
 */
function calculateMetricHealth(metricName: string, value: number | null): MetricHealth {
  if (value === null || value === undefined) {
    return {
      status: "unknown",
      statusColor: "gray",
      explanation: "Data not available from Yahoo Finance",
      quarterYear: "N/A",
      dataSource: "Yahoo Finance"
    };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  let quarterYear = "";
  if (currentMonth >= 1 && currentMonth <= 3) quarterYear = `Q4 ${currentYear - 1}`;
  else if (currentMonth >= 4 && currentMonth <= 6) quarterYear = `Q1 ${currentYear}`;
  else if (currentMonth >= 7 && currentMonth <= 9) quarterYear = `Q2 ${currentYear}`;
  else quarterYear = `Q3 ${currentYear}`;

  switch (metricName) {
    case "peRatio":
      if (value < 15) return {
        status: "excellent", statusColor: "green",
        explanation: "Trading below market average - potential undervalued opportunity",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value < 25) return {
        status: "good", statusColor: "blue",
        explanation: "Fair valuation - in line with growth expectations",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value < 35) return {
        status: "fair", statusColor: "yellow",
        explanation: "Above average valuation - higher growth expectations priced in",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Trading at premium - vulnerable to growth disappointment",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "eps":
      if (value > 5) return {
        status: "excellent", statusColor: "green",
        explanation: "Strong earnings per share - healthy profitability",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 2) return {
        status: "good", statusColor: "blue",
        explanation: "Solid earnings - company is profitable",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0) return {
        status: "fair", statusColor: "yellow",
        explanation: "Modest earnings - company barely profitable",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Negative or very low earnings - company losing money",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "beta":
      if (value < 0.8) return {
        status: "good", statusColor: "green",
        explanation: "Low volatility - stable, defensive stock",
        quarterYear: "Current", dataSource: "Yahoo Finance"
      };
      if (value < 1.2) return {
        status: "good", statusColor: "blue",
        explanation: "Market-like volatility - moves with the overall market",
        quarterYear: "Current", dataSource: "Yahoo Finance"
      };
      if (value < 1.5) return {
        status: "fair", statusColor: "yellow",
        explanation: "Above-market volatility - expect larger price swings",
        quarterYear: "Current", dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "High volatility - speculative stock with significant risk",
        quarterYear: "Current", dataSource: "Yahoo Finance"
      };

    case "dividendYield":
      if (value >= 0.05) return {
        status: "excellent", statusColor: "green",
        explanation: "Excellent dividend yield - strong income potential",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value >= 0.02) return {
        status: "good", statusColor: "blue",
        explanation: "Healthy dividend yield - solid income stream",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0) return {
        status: "fair", statusColor: "yellow",
        explanation: "Modest dividend - company reinvests most profits",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "No dividend - all profits reinvested or retained",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "profitMargin":
      if (value > 0.25) return {
        status: "excellent", statusColor: "green",
        explanation: "Exceptional margins - best-in-class profitability",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.15) return {
        status: "good", statusColor: "blue",
        explanation: "Healthy margins - strong pricing power",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.05) return {
        status: "fair", statusColor: "yellow",
        explanation: "Thin margins - vulnerable to cost increases",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Very thin margins - little room for error",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "debtToEquity":
      if (value < 0.5) return {
        status: "excellent", statusColor: "green",
        explanation: "Low leverage - minimal financial risk",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value < 1.5) return {
        status: "good", statusColor: "blue",
        explanation: "Moderate debt - manageable obligations",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value < 2.5) return {
        status: "fair", statusColor: "yellow",
        explanation: "High leverage - significant debt burden",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Very high leverage - excessive debt risk",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "returnOnEquity":
      if (value > 0.20) return {
        status: "excellent", statusColor: "green",
        explanation: "Exceptional ROE - excellent returns on shareholder capital",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.15) return {
        status: "good", statusColor: "blue",
        explanation: "Strong ROE - good capital efficiency",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.10) return {
        status: "good", statusColor: "blue",
        explanation: "Solid ROE - adequate returns on capital",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.05) return {
        status: "fair", statusColor: "yellow",
        explanation: "Moderate ROE - below average capital efficiency",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Weak ROE - poor returns on shareholder capital",
        quarterYear, dataSource: "Yahoo Finance"
      };

    case "revenueGrowth":
      if (value > 0.15) return {
        status: "excellent", statusColor: "green",
        explanation: "Strong revenue growth - expanding business",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.10) return {
        status: "good", statusColor: "blue",
        explanation: "Healthy revenue growth - solid expansion",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0.05) return {
        status: "good", statusColor: "blue",
        explanation: "Modest revenue growth - stable business",
        quarterYear, dataSource: "Yahoo Finance"
      };
      if (value > 0) return {
        status: "fair", statusColor: "yellow",
        explanation: "Minimal growth - business is stagnant",
        quarterYear, dataSource: "Yahoo Finance"
      };
      return {
        status: "concerning", statusColor: "red",
        explanation: "Negative growth - declining revenue",
        quarterYear, dataSource: "Yahoo Finance"
      };

    default:
      return {
        status: "unknown",
        statusColor: "gray",
        explanation: "Data not available",
        quarterYear: "N/A",
        dataSource: "Yahoo Finance"
      };
  }
}

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
  try {
    // Get basic metrics from quote
    const quote = await yahooFinance.quote(ticker);

    // Get detailed financial metrics from quoteSummary
    let financialData: any = {};
    let keyStats: any = {};
    try {
      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: "financialData"
      });
      
      if (summary.financialData) {
        financialData = summary.financialData;
      }
    } catch (e) {
      console.warn(`Could not fetch financialData for ${ticker}:`, e);
    }

    try {
      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: "defaultKeyStatistics"
      });
      
      if (summary.defaultKeyStatistics) {
        keyStats = summary.defaultKeyStatistics;
      }
    } catch (e) {
      console.warn(`Could not fetch defaultKeyStatistics for ${ticker}:`, e);
    }

    // Extract metrics from both sources - prefer detailed financial data
    const peRatio = keyStats?.trailingPE || quote.trailingPE || null;
    const eps = keyStats?.trailingEps || quote.epsTrailingTwelveMonths || null;
    const beta = keyStats?.beta || quote.beta || null;
    const dividendYield = quote.dividendYield || null;
    const profitMargin = financialData?.profitMargins || null;
    const debtToEquity = financialData?.debtToEquity || null;
    const returnOnEquity = financialData?.returnOnEquity || null;
    const revenueGrowth = financialData?.revenueGrowth || null;

    console.log(`[${ticker}] Real metrics - P/E: ${peRatio}, EPS: ${eps}, Dividend: ${dividendYield}%, Beta: ${beta}, Profit Margin: ${profitMargin ? (profitMargin * 100).toFixed(1) : 'N/A'}%, D/E: ${debtToEquity}, ROE: ${returnOnEquity}`);

    return {
      peRatio,
      peHealth: calculateMetricHealth("peRatio", peRatio),
      eps,
      epsHealth: calculateMetricHealth("eps", eps),
      beta,
      betaHealth: calculateMetricHealth("beta", beta),
      dividendYield,
      dividendHealth: calculateMetricHealth("dividendYield", dividendYield),
      profitMargin,
      marginHealth: calculateMetricHealth("profitMargin", profitMargin),
      debtToEquity,
      debtHealth: calculateMetricHealth("debtToEquity", debtToEquity),
      returnOnEquity,
      roeHealth: calculateMetricHealth("returnOnEquity", returnOnEquity),
      revenueGrowth,
      growthHealth: calculateMetricHealth("revenueGrowth", revenueGrowth),
    };
  } catch (error) {
    console.error(`Error fetching metrics for ${ticker}:`, error);
    throw error;
  }
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

export async function searchCompanies(
  query: string
): Promise<Array<{ ticker: string; name: string; exchange: string }>> {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const results = await yahooFinance.search(query.trim(), {
      quotesCount: 10,
      newsCount: 0,
    });

    if (!results.quotes || results.quotes.length === 0) {
      return [];
    }

    return results.quotes
      .filter((q: any) => q.symbol && q.symbol.trim())
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || "Unknown",
      }))
      .slice(0, 10);
  } catch (error) {
    console.error("Error searching companies:", error);
    return [];
  }
}
