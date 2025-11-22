import { db } from "./db";
import { users, watchlist } from "@shared/schema";
import type { User, InsertUser, Watchlist, InsertWatchlist } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DBStorage implements IStorage {
  private ensureDb() {
    if (!db) {
      throw new Error("Database not configured");
    }
    return db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = this.ensureDb();
    const result = await database.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    const database = this.ensureDb();
    return await database.select().from(watchlist).where(eq(watchlist.userId, userId));
  }

  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const database = this.ensureDb();
    const result = await database.insert(watchlist).values(item).returning();
    return result[0];
  }

  async removeFromWatchlist(id: string): Promise<void> {
    const database = this.ensureDb();
    await database.delete(watchlist).where(eq(watchlist.id, id));
  }

  async isInWatchlist(userId: string, ticker: string): Promise<boolean> {
    const database = this.ensureDb();
    const result = await database
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.ticker, ticker)))
      .limit(1);
    return result.length > 0;
  }
}

export const dbStorage = new DBStorage();
