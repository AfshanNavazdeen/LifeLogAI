import { type User, type UpsertUser, type Entry, type InsertEntry, type CarData, type InsertCarData, type Insight, type InsertInsight } from "@shared/schema";
import { db } from "./db";
import { users, entries, carData, insights } from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  createEntry(entry: InsertEntry): Promise<Entry>;
  getEntries(userId: string, filters?: { category?: string; startDate?: Date; endDate?: Date }): Promise<Entry[]>;
  getEntry(id: string): Promise<Entry | undefined>;
  updateEntry(id: string, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(id: string): Promise<boolean>;
  
  createCarData(data: InsertCarData): Promise<CarData>;
  getCarData(userId: string): Promise<CarData[]>;
  
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsights(userId: string): Promise<Insight[]>;
  deleteInsight(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async createEntry(entry: InsertEntry): Promise<Entry> {
    const processedEntry = {
      ...entry,
      amount: entry.amount !== undefined && entry.amount !== null ? String(entry.amount) : undefined,
    };
    const result = await db.insert(entries).values(processedEntry).returning();
    return result[0];
  }

  async getEntries(userId: string, filters?: { category?: string; startDate?: Date; endDate?: Date }): Promise<Entry[]> {
    let query = db.select().from(entries).where(eq(entries.userId, userId));
    
    const conditions = [eq(entries.userId, userId)];
    
    if (filters?.category) {
      conditions.push(eq(entries.category, filters.category));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(entries.timestamp, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(entries.timestamp, filters.endDate));
    }
    
    return db.select().from(entries).where(and(...conditions)).orderBy(desc(entries.timestamp));
  }

  async getEntry(id: string): Promise<Entry | undefined> {
    const result = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
    return result[0];
  }

  async updateEntry(id: string, entry: Partial<InsertEntry>): Promise<Entry | undefined> {
    const processedEntry: any = { ...entry };
    if (entry.amount !== undefined && entry.amount !== null) {
      processedEntry.amount = String(entry.amount);
    }
    const result = await db.update(entries).set(processedEntry).where(eq(entries.id, id)).returning();
    return result[0];
  }

  async deleteEntry(id: string): Promise<boolean> {
    const result = await db.delete(entries).where(eq(entries.id, id)).returning();
    return result.length > 0;
  }

  async createCarData(data: InsertCarData): Promise<CarData> {
    const processedData = {
      ...data,
      fuelAmount: data.fuelAmount !== undefined && data.fuelAmount !== null ? String(data.fuelAmount) : undefined,
      fuelCost: data.fuelCost !== undefined && data.fuelCost !== null ? String(data.fuelCost) : undefined,
    };
    const result = await db.insert(carData).values(processedData).returning();
    return result[0];
  }

  async getCarData(userId: string): Promise<CarData[]> {
    return db.select().from(carData).where(eq(carData.userId, userId)).orderBy(desc(carData.timestamp));
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const result = await db.insert(insights).values(insight).returning();
    return result[0];
  }

  async getInsights(userId: string): Promise<Insight[]> {
    return db.select().from(insights).where(eq(insights.userId, userId)).orderBy(desc(insights.createdAt));
  }

  async deleteInsight(id: string): Promise<boolean> {
    const result = await db.delete(insights).where(eq(insights.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
