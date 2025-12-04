import { 
  type User, type UpsertUser, 
  type Entry, type InsertEntry, 
  type CarData, type InsertCarData, 
  type Insight, type InsertInsight, 
  type MedicalContact, type InsertMedicalContact, 
  type MedicalReferral, type InsertMedicalReferral, 
  type FollowUpTask, type InsertFollowUpTask, 
  type Idea, type InsertIdea,
  type FamilyMember, type InsertFamilyMember,
  type Condition, type InsertCondition,
  type Medication, type InsertMedication,
  type AiIntake, type InsertAiIntake
} from "@shared/schema";
import { db } from "./db";
import { 
  users, entries, carData, insights, 
  medicalContacts, medicalReferrals, followUpTasks, ideas,
  familyMembers, conditions, medications, aiIntakes
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";

type WithUserId<T> = T & { userId: string };

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  createEntry(entry: WithUserId<InsertEntry>): Promise<Entry>;
  getEntries(userId: string, filters?: { category?: string; startDate?: Date; endDate?: Date }): Promise<Entry[]>;
  getEntry(id: string): Promise<Entry | undefined>;
  updateEntry(id: string, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(id: string): Promise<boolean>;
  
  createCarData(data: WithUserId<InsertCarData>): Promise<CarData>;
  getCarData(userId: string): Promise<CarData[]>;
  
  createInsight(insight: WithUserId<InsertInsight>): Promise<Insight>;
  getInsights(userId: string): Promise<Insight[]>;
  deleteInsight(id: string): Promise<boolean>;
  
  // Family Members
  createFamilyMember(member: WithUserId<InsertFamilyMember>): Promise<FamilyMember>;
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  getFamilyMember(id: string): Promise<FamilyMember | undefined>;
  updateFamilyMember(id: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined>;
  deleteFamilyMember(id: string): Promise<boolean>;
  
  // Conditions
  createCondition(condition: WithUserId<InsertCondition>): Promise<Condition>;
  getConditions(userId: string, filters?: { familyMemberId?: string; type?: string; status?: string }): Promise<Condition[]>;
  getCondition(id: string): Promise<Condition | undefined>;
  updateCondition(id: string, condition: Partial<InsertCondition>): Promise<Condition | undefined>;
  deleteCondition(id: string): Promise<boolean>;
  
  // Medications
  createMedication(medication: WithUserId<InsertMedication>): Promise<Medication>;
  getMedications(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string }): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  updateMedication(id: string, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: string): Promise<boolean>;
  
  // Medical Contacts
  createMedicalContact(contact: WithUserId<InsertMedicalContact>): Promise<MedicalContact>;
  getMedicalContacts(userId: string, filters?: { familyMemberId?: string }): Promise<MedicalContact[]>;
  getMedicalContact(id: string): Promise<MedicalContact | undefined>;
  updateMedicalContact(id: string, contact: Partial<InsertMedicalContact>): Promise<MedicalContact | undefined>;
  deleteMedicalContact(id: string): Promise<boolean>;
  
  // Medical Referrals
  createMedicalReferral(referral: WithUserId<InsertMedicalReferral>): Promise<MedicalReferral>;
  getMedicalReferrals(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string }): Promise<MedicalReferral[]>;
  getMedicalReferral(id: string): Promise<MedicalReferral | undefined>;
  updateMedicalReferral(id: string, referral: Partial<InsertMedicalReferral>): Promise<MedicalReferral | undefined>;
  deleteMedicalReferral(id: string): Promise<boolean>;
  
  // Follow-Up Tasks
  createFollowUpTask(task: WithUserId<InsertFollowUpTask>): Promise<FollowUpTask>;
  getFollowUpTasks(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string; daysAhead?: number }): Promise<FollowUpTask[]>;
  getFollowUpTask(id: string): Promise<FollowUpTask | undefined>;
  updateFollowUpTask(id: string, task: Partial<InsertFollowUpTask>): Promise<FollowUpTask | undefined>;
  deleteFollowUpTask(id: string): Promise<boolean>;
  getChildTasks(parentTaskId: string): Promise<FollowUpTask[]>;
  
  // AI Intake
  createAiIntake(intake: WithUserId<InsertAiIntake>): Promise<AiIntake>;
  getAiIntakes(userId: string, status?: string): Promise<AiIntake[]>;
  getAiIntake(id: string): Promise<AiIntake | undefined>;
  updateAiIntake(id: string, intake: Partial<InsertAiIntake>): Promise<AiIntake | undefined>;
  deleteAiIntake(id: string): Promise<boolean>;
  
  // Ideas
  createIdea(idea: WithUserId<InsertIdea>): Promise<Idea>;
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

  async createEntry(entry: WithUserId<InsertEntry>): Promise<Entry> {
    const processedEntry = {
      ...entry,
      amount: entry.amount !== undefined && entry.amount !== null ? String(entry.amount) : undefined,
    };
    const result = await db.insert(entries).values(processedEntry).returning();
    return result[0];
  }

  async getEntries(userId: string, filters?: { category?: string; startDate?: Date; endDate?: Date }): Promise<Entry[]> {
    const conditions_arr = [eq(entries.userId, userId)];
    
    if (filters?.category) {
      conditions_arr.push(eq(entries.category, filters.category));
    }
    
    if (filters?.startDate) {
      conditions_arr.push(gte(entries.timestamp, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions_arr.push(lte(entries.timestamp, filters.endDate));
    }
    
    return db.select().from(entries).where(and(...conditions_arr)).orderBy(desc(entries.timestamp));
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

  async createCarData(data: WithUserId<InsertCarData>): Promise<CarData> {
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

  async createInsight(insight: WithUserId<InsertInsight>): Promise<Insight> {
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

  // ============================================
  // FAMILY MEMBERS
  // ============================================
  async createFamilyMember(member: WithUserId<InsertFamilyMember>): Promise<FamilyMember> {
    const result = await db.insert(familyMembers).values(member).returning();
    return result[0];
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return db.select().from(familyMembers).where(eq(familyMembers.userId, userId)).orderBy(familyMembers.name);
  }

  async getFamilyMember(id: string): Promise<FamilyMember | undefined> {
    const result = await db.select().from(familyMembers).where(eq(familyMembers.id, id)).limit(1);
    return result[0];
  }

  async updateFamilyMember(id: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined> {
    const result = await db.update(familyMembers).set({ ...member, updatedAt: new Date() }).where(eq(familyMembers.id, id)).returning();
    return result[0];
  }

  async deleteFamilyMember(id: string): Promise<boolean> {
    const result = await db.delete(familyMembers).where(eq(familyMembers.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // CONDITIONS
  // ============================================
  async createCondition(condition: WithUserId<InsertCondition>): Promise<Condition> {
    const result = await db.insert(conditions).values(condition).returning();
    return result[0];
  }

  async getConditions(userId: string, filters?: { familyMemberId?: string; type?: string; status?: string }): Promise<Condition[]> {
    const conditions_arr = [eq(conditions.userId, userId)];
    if (filters?.familyMemberId) conditions_arr.push(eq(conditions.familyMemberId, filters.familyMemberId));
    if (filters?.type) conditions_arr.push(eq(conditions.type, filters.type));
    if (filters?.status) conditions_arr.push(eq(conditions.status, filters.status));
    return db.select().from(conditions).where(and(...conditions_arr)).orderBy(desc(conditions.createdAt));
  }

  async getCondition(id: string): Promise<Condition | undefined> {
    const result = await db.select().from(conditions).where(eq(conditions.id, id)).limit(1);
    return result[0];
  }

  async updateCondition(id: string, condition: Partial<InsertCondition>): Promise<Condition | undefined> {
    const result = await db.update(conditions).set({ ...condition, updatedAt: new Date() }).where(eq(conditions.id, id)).returning();
    return result[0];
  }

  async deleteCondition(id: string): Promise<boolean> {
    const result = await db.delete(conditions).where(eq(conditions.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // MEDICATIONS
  // ============================================
  async createMedication(medication: WithUserId<InsertMedication>): Promise<Medication> {
    const result = await db.insert(medications).values(medication).returning();
    return result[0];
  }

  async getMedications(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string }): Promise<Medication[]> {
    const conditions_arr = [eq(medications.userId, userId)];
    if (filters?.familyMemberId) conditions_arr.push(eq(medications.familyMemberId, filters.familyMemberId));
    if (filters?.conditionId) conditions_arr.push(eq(medications.conditionId, filters.conditionId));
    if (filters?.status) conditions_arr.push(eq(medications.status, filters.status));
    return db.select().from(medications).where(and(...conditions_arr)).orderBy(desc(medications.createdAt));
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    const result = await db.select().from(medications).where(eq(medications.id, id)).limit(1);
    return result[0];
  }

  async updateMedication(id: string, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const result = await db.update(medications).set({ ...medication, updatedAt: new Date() }).where(eq(medications.id, id)).returning();
    return result[0];
  }

  async deleteMedication(id: string): Promise<boolean> {
    const result = await db.delete(medications).where(eq(medications.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // MEDICAL CONTACTS
  // ============================================
  async createMedicalContact(contact: WithUserId<InsertMedicalContact>): Promise<MedicalContact> {
    const result = await db.insert(medicalContacts).values(contact).returning();
    return result[0];
  }

  async getMedicalContacts(userId: string, filters?: { familyMemberId?: string }): Promise<MedicalContact[]> {
    const conditions_arr = [eq(medicalContacts.userId, userId)];
    if (filters?.familyMemberId) conditions_arr.push(eq(medicalContacts.familyMemberId, filters.familyMemberId));
    return db.select().from(medicalContacts).where(and(...conditions_arr)).orderBy(desc(medicalContacts.createdAt));
  }

  async getMedicalContact(id: string): Promise<MedicalContact | undefined> {
    const result = await db.select().from(medicalContacts).where(eq(medicalContacts.id, id)).limit(1);
    return result[0];
  }

  async updateMedicalContact(id: string, contact: Partial<InsertMedicalContact>): Promise<MedicalContact | undefined> {
    const result = await db.update(medicalContacts).set({ ...contact, updatedAt: new Date() }).where(eq(medicalContacts.id, id)).returning();
    return result[0];
  }

  async deleteMedicalContact(id: string): Promise<boolean> {
    const result = await db.delete(medicalContacts).where(eq(medicalContacts.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // MEDICAL REFERRALS
  // ============================================
  async createMedicalReferral(referral: WithUserId<InsertMedicalReferral>): Promise<MedicalReferral> {
    const processedReferral = {
      ...referral,
      dateSent: referral.dateSent || new Date(),
    };
    const result = await db.insert(medicalReferrals).values(processedReferral).returning();
    return result[0];
  }

  async getMedicalReferrals(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string }): Promise<MedicalReferral[]> {
    const conditions_arr = [eq(medicalReferrals.userId, userId)];
    if (filters?.familyMemberId) conditions_arr.push(eq(medicalReferrals.familyMemberId, filters.familyMemberId));
    if (filters?.conditionId) conditions_arr.push(eq(medicalReferrals.conditionId, filters.conditionId));
    if (filters?.status) conditions_arr.push(eq(medicalReferrals.status, filters.status));
    return db.select().from(medicalReferrals).where(and(...conditions_arr)).orderBy(desc(medicalReferrals.createdAt));
  }

  async getMedicalReferral(id: string): Promise<MedicalReferral | undefined> {
    const result = await db.select().from(medicalReferrals).where(eq(medicalReferrals.id, id)).limit(1);
    return result[0];
  }

  async updateMedicalReferral(id: string, referral: Partial<InsertMedicalReferral>): Promise<MedicalReferral | undefined> {
    const result = await db.update(medicalReferrals).set({ ...referral, updatedAt: new Date() }).where(eq(medicalReferrals.id, id)).returning();
    return result[0];
  }

  async deleteMedicalReferral(id: string): Promise<boolean> {
    const result = await db.delete(medicalReferrals).where(eq(medicalReferrals.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // FOLLOW-UP TASKS
  // ============================================
  async createFollowUpTask(task: WithUserId<InsertFollowUpTask>): Promise<FollowUpTask> {
    const result = await db.insert(followUpTasks).values(task).returning();
    return result[0];
  }

  async getFollowUpTasks(userId: string, filters?: { familyMemberId?: string; conditionId?: string; status?: string; daysAhead?: number }): Promise<FollowUpTask[]> {
    const conditions_arr = [eq(followUpTasks.userId, userId)];
    if (filters?.familyMemberId) conditions_arr.push(eq(followUpTasks.familyMemberId, filters.familyMemberId));
    if (filters?.conditionId) conditions_arr.push(eq(followUpTasks.conditionId, filters.conditionId));
    if (filters?.status) conditions_arr.push(eq(followUpTasks.status, filters.status));
    if (filters?.daysAhead) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.daysAhead);
      conditions_arr.push(lte(followUpTasks.triggerDate, futureDate));
    }
    return db.select().from(followUpTasks).where(and(...conditions_arr)).orderBy(followUpTasks.triggerDate);
  }

  async getFollowUpTask(id: string): Promise<FollowUpTask | undefined> {
    const result = await db.select().from(followUpTasks).where(eq(followUpTasks.id, id)).limit(1);
    return result[0];
  }

  async updateFollowUpTask(id: string, task: Partial<InsertFollowUpTask>): Promise<FollowUpTask | undefined> {
    const result = await db.update(followUpTasks).set({ ...task, updatedAt: new Date() }).where(eq(followUpTasks.id, id)).returning();
    return result[0];
  }

  async deleteFollowUpTask(id: string): Promise<boolean> {
    const result = await db.delete(followUpTasks).where(eq(followUpTasks.id, id)).returning();
    return result.length > 0;
  }

  async getChildTasks(parentTaskId: string): Promise<FollowUpTask[]> {
    return db.select().from(followUpTasks).where(eq(followUpTasks.parentTaskId, parentTaskId)).orderBy(followUpTasks.triggerDate);
  }

  // ============================================
  // AI INTAKE
  // ============================================
  async createAiIntake(intake: WithUserId<InsertAiIntake>): Promise<AiIntake> {
    const result = await db.insert(aiIntakes).values(intake).returning();
    return result[0];
  }

  async getAiIntakes(userId: string, status?: string): Promise<AiIntake[]> {
    const conditions_arr = [eq(aiIntakes.userId, userId)];
    if (status) conditions_arr.push(eq(aiIntakes.status, status));
    return db.select().from(aiIntakes).where(and(...conditions_arr)).orderBy(desc(aiIntakes.createdAt));
  }

  async getAiIntake(id: string): Promise<AiIntake | undefined> {
    const result = await db.select().from(aiIntakes).where(eq(aiIntakes.id, id)).limit(1);
    return result[0];
  }

  async updateAiIntake(id: string, intake: Partial<InsertAiIntake>): Promise<AiIntake | undefined> {
    const result = await db.update(aiIntakes).set(intake).where(eq(aiIntakes.id, id)).returning();
    return result[0];
  }

  async deleteAiIntake(id: string): Promise<boolean> {
    const result = await db.delete(aiIntakes).where(eq(aiIntakes.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // IDEAS
  // ============================================
  async createIdea(idea: WithUserId<InsertIdea>): Promise<Idea> {
    const result = await db.insert(ideas).values(idea).returning();
    return result[0];
  }

  async getIdeas(userId: string, filters?: { category?: string; status?: string }): Promise<Idea[]> {
    const conditions_arr = [eq(ideas.userId, userId)];
    if (filters?.category) conditions_arr.push(eq(ideas.category, filters.category));
    if (filters?.status) conditions_arr.push(eq(ideas.status, filters.status));
    return db.select().from(ideas).where(and(...conditions_arr)).orderBy(desc(ideas.createdAt));
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
