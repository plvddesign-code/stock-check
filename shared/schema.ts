import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name"),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

// API Response types (not stored in DB)
export interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  averageVolume: number;
  high: number;
  low: number;
  open: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface StockMetrics {
  peRatio: number | null;
  eps: number | null;
  beta: number | null;
  dividendYield: number | null;
  profitMargin: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  revenueGrowth: number | null;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  summary?: string;
}

export interface AIAnalysis {
  summary: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  reasoning: string;
  risks: string[];
  opportunities: string[];
  financialHealthScore: number;
  sentimentScore: number;
}

export interface StockAnalysisResponse {
  quote: StockQuote;
  metrics: StockMetrics;
  news: NewsItem[];
  aiAnalysis: AIAnalysis;
  businessSummary: string;
  sector: string;
  industry: string;
  historicalPrices: Array<{ date: string; close: number }>;
}
