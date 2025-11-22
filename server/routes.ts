import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { dbStorage } from "./db-storage";
import { storage as memStorage } from "./storage";
import { 
  getStockQuote, 
  getStockMetrics, 
  getStockNews, 
  getHistoricalPrices,
  getBusinessSummary 
} from "./services/alpha-vantage";
import { generateStockAnalysis } from "./services/openai";
import type { StockAnalysisResponse } from "@shared/schema";
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

      let quote, metrics, news, historicalPrices, businessInfo;

      try {
        [quote, metrics, news, historicalPrices, businessInfo] = await Promise.all([
          getStockQuote(upperTicker),
          getStockMetrics(upperTicker),
          getStockNews(upperTicker),
          getHistoricalPrices(upperTicker, 30),
          getBusinessSummary(upperTicker),
        ]);
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

      const aiAnalysis = await generateStockAnalysis(
        upperTicker,
        quote,
        metrics,
        news,
        businessInfo.businessSummary
      );

      const response: StockAnalysisResponse = {
        quote,
        metrics,
        news,
        aiAnalysis,
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
        const quote = await getStockQuote(ticker.toUpperCase());
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
