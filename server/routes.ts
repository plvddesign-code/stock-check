import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { dbStorage } from "./db-storage";
import { storage as memStorage } from "./storage";
import { 
  getStockQuote as getYahooQuote,
  getStockMetrics as getYahooMetrics,
  getBusinessSummary as getCompanyInfo,
  getHistoricalPrices as getYahooHistoricalPrices,
  getStockNews as getYahooNews
} from "./services/yahoo-finance";
import { 
  getAnalystRating,
  getStockNews
} from "./services/finnhub";
import { 
  getStockMetrics as getAlphaMetrics,
  getBusinessSummary 
} from "./services/alpha-vantage";
import { generateStockAnalysis, generateNewsBasedRiskSummary } from "./services/openai";
import { synthesizeRiskData } from "./services/finnhub";
import type { StockAnalysisResponse, StockQuote, StockMetrics, NewsItem } from "@shared/schema";
import { insertWatchlistSchema } from "@shared/schema";

// Use database storage if available, otherwise fallback to memory storage
const storage = db ? dbStorage : memStorage;

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/stock/:ticker/analysis", async (req, res) => {
    try {
      const { ticker } = req.params;
      
      if (!ticker || typeof ticker !== "string" || ticker.trim().length === 0) {
        return res.status(400).json({ error: "Invalid ticker symbol provided" });
      }

      const upperTicker = ticker.toUpperCase();

      let quote: StockQuote;
      let metrics: StockMetrics;
      let news: NewsItem[];
      let historicalPrices: Array<{ date: string; close: number }>;
      let businessInfo: { businessSummary: string; sector: string; industry: string };

      try {
        // Fetch real data from Yahoo Finance (primary source)
        const [yahooQuote, yahooMetrics, yahooHistory, companyInfo] = await Promise.all([
          getYahooQuote(upperTicker),
          getYahooMetrics(upperTicker),
          getYahooHistoricalPrices(upperTicker, 30),
          getCompanyInfo(upperTicker),
        ]);

        quote = yahooQuote;
        metrics = yahooMetrics;
        historicalPrices = yahooHistory;
        businessInfo = companyInfo;

        // Try to get analyst rating and news from Finnhub (optional - fallback to empty arrays)
        let analystRating = null;
        try {
          analystRating = await getAnalystRating(upperTicker);
        } catch (e) {
          console.warn(`Finnhub analyst rating failed for ${upperTicker}, continuing without it...`);
        }

        // Get news from Yahoo Finance (primary source), fallback to Finnhub
        try {
          news = await getYahooNews(upperTicker);
        } catch (e) {
          console.warn(`Yahoo Finance news failed for ${upperTicker}, trying Finnhub...`);
          try {
            news = await getStockNews(upperTicker);
          } catch (finnhubError) {
            console.warn(`Finnhub news also failed for ${upperTicker}, continuing with empty news...`);
            news = [];
          }
        }
      } catch (apiError: any) {
        if (apiError.message?.includes("not found") || apiError.message?.includes("No data")) {
          return res.status(404).json({ 
            error: `Stock ticker "${upperTicker}" not found. Please verify the ticker symbol.` 
          });
        }
        console.error("External API error:", apiError);
        return res.status(502).json({ 
          error: "Unable to fetch stock data from external sources. Please try again later." 
        });
      }

      // Synthesize risk data from news, sentiment, and analyst ratings
      let synthesizedRisk: any = null;
      try {
        synthesizedRisk = await synthesizeRiskData(upperTicker, news, quote.currentPrice);
      } catch (e) {
        console.warn(`Risk synthesis failed for ${upperTicker}, continuing without risk data...`);
      }

      // Generate AI analysis, but gracefully degrade if it fails
      let aiAnalysis: any = null;
      try {
        aiAnalysis = await generateStockAnalysis(
          upperTicker,
          quote,
          metrics,
          news,
          businessInfo.businessSummary,
          synthesizedRisk
        );
      } catch (e) {
        console.warn(`AI analysis failed for ${upperTicker}, continuing without analysis...`);
      }

      // Generate simplified news-based risk summary, but gracefully degrade if it fails
      let newsRiskSummary: any = null;
      try {
        newsRiskSummary = await generateNewsBasedRiskSummary(upperTicker, news, quote, metrics);
      } catch (e) {
        console.warn(`News risk summary failed for ${upperTicker}, continuing without summary...`);
      }

      const response: StockAnalysisResponse = {
        quote,
        metrics,
        news,
        aiAnalysis,
        newsRiskSummary,
        businessSummary: businessInfo.businessSummary,
        sector: businessInfo.sector,
        industry: businessInfo.industry,
        historicalPrices,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Stock analysis error:", error);
      res.status(500).json({ 
        error: "An unexpected error occurred while analyzing the stock. Please try again." 
      });
    }
  });

  app.get("/api/stock/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      
      if (!ticker || typeof ticker !== "string" || ticker.trim().length === 0) {
        return res.status(400).json({ error: "Invalid ticker symbol provided" });
      }

      try {
        const quote = await getYahooQuote(ticker.toUpperCase());
        res.json(quote);
      } catch (apiError: any) {
        if (apiError.message?.includes("not found") || apiError.message?.includes("No data")) {
          return res.status(404).json({ 
            error: `Stock ticker "${ticker.toUpperCase()}" not found. Please verify the ticker symbol.` 
          });
        }
        throw apiError;
      }
    } catch (error: any) {
      console.error("Stock quote error:", error);
      res.status(502).json({ 
        error: "Unable to fetch stock data from external sources. Please try again later." 
      });
    }
  });

  app.get("/api/stock/:ticker/historical", async (req, res) => {
    try {
      const { ticker } = req.params;
      const { days } = req.query;
      
      if (!ticker || typeof ticker !== "string" || ticker.trim().length === 0) {
        return res.status(400).json({ error: "Invalid ticker symbol provided" });
      }

      const numDays = days ? parseInt(days as string, 10) : 30;
      
      if (isNaN(numDays) || numDays < 1) {
        return res.status(400).json({ error: "Invalid days parameter" });
      }

      try {
        const historicalPrices = await getYahooHistoricalPrices(ticker.toUpperCase(), numDays);
        res.json(historicalPrices);
      } catch (apiError: any) {
        if (apiError.message?.includes("not found") || apiError.message?.includes("No data")) {
          return res.status(404).json({ 
            error: `Stock ticker "${ticker.toUpperCase()}" not found. Please verify the ticker symbol.` 
          });
        }
        throw apiError;
      }
    } catch (error: any) {
      console.error("Stock historical prices error:", error);
      res.status(502).json({ 
        error: "Unable to fetch historical price data from external sources. Please try again later." 
      });
    }
  });

  app.get("/api/watchlist/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const watchlist = await storage.getWatchlist(userId);
      res.json(watchlist);
    } catch (error: any) {
      console.error("Get watchlist error:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const validation = insertWatchlistSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid watchlist data", 
          details: validation.error.errors 
        });
      }

      const item = await storage.addToWatchlist(validation.data);
      res.json(item);
    } catch (error: any) {
      console.error("Add to watchlist error:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeFromWatchlist(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Remove from watchlist error:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  app.get("/api/watchlist/:userId/check/:ticker", async (req, res) => {
    try {
      const { userId, ticker } = req.params;
      const exists = await storage.isInWatchlist(userId, ticker.toUpperCase());
      res.json({ exists });
    } catch (error: any) {
      console.error("Check watchlist error:", error);
      res.status(500).json({ error: "Failed to check watchlist" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
