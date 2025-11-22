import { type User, type InsertUser, type Watchlist, type InsertWatchlist } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(id: string): Promise<void>;
  isInWatchlist(userId: string, ticker: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private watchlist: Map<string, Watchlist>;

  constructor() {
    this.users = new Map();
    this.watchlist = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return Array.from(this.watchlist.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWatchlist(insertItem: InsertWatchlist): Promise<Watchlist> {
    const id = randomUUID();
    const item: Watchlist = {
      ...insertItem,
      id,
      addedAt: new Date(),
    };
    this.watchlist.set(id, item);
    return item;
  }

  async removeFromWatchlist(id: string): Promise<void> {
    this.watchlist.delete(id);
  }

  async isInWatchlist(userId: string, ticker: string): Promise<boolean> {
    return Array.from(this.watchlist.values()).some(
      (item) => item.userId === userId && item.ticker === ticker
    );
  }
}

export const storage = new MemStorage();
