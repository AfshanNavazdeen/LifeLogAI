import { type User, type UpsertUser, type Entry, type InsertEntry, type CarData, type InsertCarData, type Insight, type InsertInsight, type MedicalContact, type InsertMedicalContact, type MedicalReferral, type InsertMedicalReferral, type FollowUpTask, type InsertFollowUpTask, type Idea, type InsertIdea } from "@shared/schema";
import { db } from "./db";
import { users, entries, carData, insights, medicalContacts, medicalReferrals, followUpTasks, ideas } from "@shared/schema";
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
  
  createMedicalContact(contact: InsertMedicalContact): Promise<MedicalContact>;
  getMedicalContacts(userId: string): Promise<MedicalContact[]>;
  updateMedicalContact(id: string, contact: Partial<InsertMedicalContact>): Promise<MedicalContact | undefined>;
  
  createMedicalReferral(referral: InsertMedicalReferral): Promise<MedicalReferral>;
  getMedicalReferrals(userId: string): Promise<MedicalReferral[]>;
  updateMedicalReferral(id: string, referral: Partial<InsertMedicalReferral>): Promise<MedicalReferral | undefined>;
  
  createFollowUpTask(task: InsertFollowUpTask): Promise<FollowUpTask>;
  getFollowUpTasks(userId: string, daysAhead?: number): Promise<FollowUpTask[]>;
  updateFollowUpTask(id: string, task: Partial<InsertFollowUpTask>): Promise<FollowUpTask | undefined>;
  
  createIdea(idea: InsertIdea): Promise<Idea>;
  getIdeas(userId: string, filters?: { category?: string; status?: string }): Promise<Idea[]>;
  updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  getRelatedIdeas(userId: string, entryId: string): Promise<Idea[]>;
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

  // Medical Contacts
  async createMedicalContact(contact: InsertMedicalContact): Promise<MedicalContact> {
    const result = await db.insert(medicalContacts).values(contact).returning();
    return result[0];
  }

  async getMedicalContacts(userId: string): Promise<MedicalContact[]> {
    return db.select().from(medicalContacts).where(eq(medicalContacts.userId, userId)).orderBy(desc(medicalContacts.createdAt));
  }

  async updateMedicalContact(id: string, contact: Partial<InsertMedicalContact>): Promise<MedicalContact | undefined> {
    const result = await db.update(medicalContacts).set(contact).where(eq(medicalContacts.id, id)).returning();
    return result[0];
  }

  // Medical Referrals
  async createMedicalReferral(referral: InsertMedicalReferral): Promise<MedicalReferral> {
    const processedReferral = {
      ...referral,
      dateSent: referral.dateSent || new Date(),
    };
    const result = await db.insert(medicalReferrals).values(processedReferral).returning();
    return result[0];
  }

  async getMedicalReferrals(userId: string): Promise<MedicalReferral[]> {
    return db.select().from(medicalReferrals).where(eq(medicalReferrals.userId, userId)).orderBy(desc(medicalReferrals.createdAt));
  }

  async updateMedicalReferral(id: string, referral: Partial<InsertMedicalReferral>): Promise<MedicalReferral | undefined> {
    const result = await db.update(medicalReferrals).set(referral).where(eq(medicalReferrals.id, id)).returning();
    return result[0];
  }

  // Follow-Up Tasks
  async createFollowUpTask(task: InsertFollowUpTask): Promise<FollowUpTask> {
    const result = await db.insert(followUpTasks).values(task).returning();
    return result[0];
  }

  async getFollowUpTasks(userId: string, daysAhead?: number): Promise<FollowUpTask[]> {
    const conditions = [eq(followUpTasks.userId, userId)];
    if (daysAhead) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      conditions.push(lte(followUpTasks.triggerDate, futureDate));
    }
    return db.select().from(followUpTasks).where(and(...conditions)).orderBy(followUpTasks.triggerDate);
  }

  async updateFollowUpTask(id: string, task: Partial<InsertFollowUpTask>): Promise<FollowUpTask | undefined> {
    const result = await db.update(followUpTasks).set(task).where(eq(followUpTasks.id, id)).returning();
    return result[0];
  }

  // Ideas
  async createIdea(idea: InsertIdea): Promise<Idea> {
    const result = await db.insert(ideas).values(idea).returning();
    return result[0];
  }

  async getIdeas(userId: string, filters?: { category?: string; status?: string }): Promise<Idea[]> {
    const conditions = [eq(ideas.userId, userId)];
    if (filters?.category) conditions.push(eq(ideas.category, filters.category));
    if (filters?.status) conditions.push(eq(ideas.status, filters.status));
    return db.select().from(ideas).where(and(...conditions)).orderBy(desc(ideas.createdAt));
  }

  async updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea | undefined> {
    const result = await db.update(ideas).set({ ...idea, updatedAt: new Date() }).where(eq(ideas.id, id)).returning();
    return result[0];
  }

  async getRelatedIdeas(userId: string, entryId: string): Promise<Idea[]> {
    return db.select().from(ideas).where(and(eq(ideas.userId, userId), eq(ideas.linkedEntryId, entryId))).orderBy(desc(ideas.createdAt));
  }
}

export const storage = new DbStorage();
