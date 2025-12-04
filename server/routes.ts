import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEntrySchema, insertCarDataSchema, insertInsightSchema,
  insertMedicalContactSchema, insertMedicalReferralSchema, insertFollowUpTaskSchema, insertIdeaSchema,
  insertFamilyMemberSchema, insertConditionSchema, insertMedicationSchema, insertAiIntakeSchema,
  type AiParsedItem
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth0";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Auth0
  await setupAuth(app);
  
  // Entries API
  app.post("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const entryData = insertEntrySchema.parse(req.body);
      const entry = await storage.createEntry({
        ...entryData,
        userId,
      });
      
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const { category, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (category) filters.category = String(category);
      if (startDate) filters.startDate = new Date(String(startDate));
      if (endDate) filters.endDate = new Date(String(endDate));
      
      const entries = await storage.getEntries(userId, filters);
      res.json(entries);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const entry = await storage.getEntry(req.params.id);
      if (!entry || entry.userId !== userId) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const existing = await storage.getEntry(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      const updateData = insertEntrySchema.partial().parse(req.body);
      const entry = await storage.updateEntry(req.params.id, updateData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const existing = await storage.getEntry(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      await storage.deleteEntry(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Car Data API
  app.post("/api/car", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const carDataInput = insertCarDataSchema.parse(req.body);
      const carDataResult = await storage.createCarData({
        ...carDataInput,
        userId,
      });
      
      res.json(carDataResult);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/car", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const carDataResults = await storage.getCarData(userId);
      res.json(carDataResults);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Insights API
  app.get("/api/insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const insightsResults = await storage.getInsights(userId);
      res.json(insightsResults);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const insightData = insertInsightSchema.parse(req.body);
      const insight = await storage.createInsight({
        ...insightData,
        userId,
      });
      
      res.json(insight);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/insights/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const existing = await storage.getInsights(userId);
      const insight = existing.find(i => i.id === req.params.id);
      if (!insight) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      await storage.deleteInsight(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Dashboard Stats API
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const entries = await storage.getEntries(userId);
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const thisMonthEntries = entries.filter(e => new Date(e.timestamp) >= currentMonth);
      const fuelEntries = thisMonthEntries.filter(e => e.category === "fuel");
      
      const totalSpending = thisMonthEntries.reduce((sum, e) => sum + (parseFloat(e.amount || "0")), 0);
      const fuelSpending = fuelEntries.reduce((sum, e) => sum + (parseFloat(e.amount || "0")), 0);
      
      res.json({
        totalSpending: totalSpending.toFixed(2),
        fuelSpending: fuelSpending.toFixed(2),
        entryCount: entries.length,
        thisMonthCount: thisMonthEntries.length,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI Categorization API with validation
  const categorizationSchema = z.object({
    title: z.string().min(1).max(500),
    description: z.string().max(2000).optional(),
    amount: z.union([z.string(), z.number()]).optional(),
  });

  app.post("/api/ai/categorize", isAuthenticated, async (req: any, res) => {
    try {
      const validated = categorizationSchema.parse(req.body);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that categorizes life entries. Given a title, description, and optional amount, return a JSON object with: category (fuel, groceries, dining, transport, shopping, health, entertainment, bills, work, personal, or other), suggestedTags (array of relevant tags), and confidence (0-1).",
          },
          {
            role: "user",
            content: `Title: ${validated.title}\nDescription: ${validated.description || "N/A"}\nAmount: ${validated.amount || "N/A"}`,
          },
        ],
        response_format: { type: "json_object" },
      });
      
      const result = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid input" });
      }
      res.status(500).json({ error: "Failed to categorize entry" });
    }
  });

  // Chat API with validation
  const chatSchema = z.object({
    message: z.string().min(1).max(1000),
  });

  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const validated = chatSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const entries = await storage.getEntries(userId);
      const carData = await storage.getCarData(userId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant that answers questions about the user's life data. You have access to their entries (receipts, notes, events) and car data (odometer readings, fuel). Be concise and helpful. Here is their data:\n\nEntries: ${JSON.stringify(entries.slice(0, 50))}\n\nCar Data: ${JSON.stringify(carData.slice(0, 20))}`,
          },
          {
            role: "user",
            content: validated.message,
          },
        ],
      });
      
      res.json({ response: completion.choices[0].message.content });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid input" });
      }
      res.status(500).json({ error: "Failed to process query" });
    }
  });

  // ============================================
  // FAMILY MEMBERS API
  // ============================================
  app.post("/api/medical/family", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memberData = insertFamilyMemberSchema.parse(req.body);
      const member = await storage.createFamilyMember({ ...memberData, userId });
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/family", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const members = await storage.getFamilyMembers(userId);
      res.json(members);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/family/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const member = await storage.getFamilyMember(req.params.id);
      if (!member || member.userId !== userId) {
        return res.status(404).json({ error: "Family member not found" });
      }
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/family/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getFamilyMember(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Family member not found" });
      }
      const updateData = insertFamilyMemberSchema.partial().parse(req.body);
      const member = await storage.updateFamilyMember(req.params.id, updateData);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/family/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getFamilyMember(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Family member not found" });
      }
      await storage.deleteFamilyMember(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // CONDITIONS API
  // ============================================
  app.post("/api/medical/conditions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      const conditionData = insertConditionSchema.parse(body);
      const condition = await storage.createCondition({ ...conditionData, userId });
      res.json(condition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/conditions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { familyMemberId, type, status } = req.query;
      const conditions = await storage.getConditions(userId, {
        familyMemberId: familyMemberId as string,
        type: type as string,
        status: status as string,
      });
      res.json(conditions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/conditions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const condition = await storage.getCondition(req.params.id);
      if (!condition || condition.userId !== userId) {
        return res.status(404).json({ error: "Condition not found" });
      }
      res.json(condition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/conditions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getCondition(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Condition not found" });
      }
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      const updateData = insertConditionSchema.partial().parse(body);
      const condition = await storage.updateCondition(req.params.id, updateData);
      res.json(condition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/conditions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getCondition(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Condition not found" });
      }
      await storage.deleteCondition(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MEDICATIONS API
  // ============================================
  app.post("/api/medical/medications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.prescribedBy === "") body.prescribedBy = undefined;
      const medicationData = insertMedicationSchema.parse(body);
      const medication = await storage.createMedication({ ...medicationData, userId });
      res.json(medication);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/medications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { familyMemberId, conditionId, status } = req.query;
      const medications = await storage.getMedications(userId, {
        familyMemberId: familyMemberId as string,
        conditionId: conditionId as string,
        status: status as string,
      });
      res.json(medications);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/medications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medication = await storage.getMedication(req.params.id);
      if (!medication || medication.userId !== userId) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.json(medication);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/medications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedication(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Medication not found" });
      }
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.prescribedBy === "") body.prescribedBy = undefined;
      const updateData = insertMedicationSchema.partial().parse(body);
      const medication = await storage.updateMedication(req.params.id, updateData);
      res.json(medication);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/medications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedication(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Medication not found" });
      }
      await storage.deleteMedication(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MEDICAL CONTACTS API
  // ============================================
  app.post("/api/medical/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      const contactData = insertMedicalContactSchema.parse(body);
      const contact = await storage.createMedicalContact({ ...contactData, userId });
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { familyMemberId } = req.query;
      const contacts = await storage.getMedicalContacts(userId, {
        familyMemberId: familyMemberId as string,
      });
      res.json(contacts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contact = await storage.getMedicalContact(req.params.id);
      if (!contact || contact.userId !== userId) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedicalContact(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Contact not found" });
      }
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      const updateData = insertMedicalContactSchema.partial().parse(body);
      const contact = await storage.updateMedicalContact(req.params.id, updateData);
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedicalContact(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Contact not found" });
      }
      await storage.deleteMedicalContact(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MEDICAL REFERRALS API
  // ============================================
  app.post("/api/medical/referrals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.senderContactId === "") body.senderContactId = undefined;
      if (body.referredToContactId === "") body.referredToContactId = undefined;
      const referralData = insertMedicalReferralSchema.parse(body);
      const referral = await storage.createMedicalReferral({ ...referralData, userId });
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/referrals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { familyMemberId, conditionId, status } = req.query;
      const referrals = await storage.getMedicalReferrals(userId, {
        familyMemberId: familyMemberId as string,
        conditionId: conditionId as string,
        status: status as string,
      });
      res.json(referrals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/referrals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referral = await storage.getMedicalReferral(req.params.id);
      if (!referral || referral.userId !== userId) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/referrals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedicalReferral(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Referral not found" });
      }
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.senderContactId === "") body.senderContactId = undefined;
      if (body.referredToContactId === "") body.referredToContactId = undefined;
      const updateData = insertMedicalReferralSchema.partial().parse(body);
      const referral = await storage.updateMedicalReferral(req.params.id, updateData);
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/referrals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMedicalReferral(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Referral not found" });
      }
      await storage.deleteMedicalReferral(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // FOLLOW-UP TASKS API
  // ============================================
  app.post("/api/medical/follow-ups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.contactId === "") body.contactId = undefined;
      if (body.referralId === "") body.referralId = undefined;
      if (body.triggerTime === "") body.triggerTime = undefined;
      if (body.parentTaskId === "") body.parentTaskId = undefined;
      
      const taskData = insertFollowUpTaskSchema.parse(body);
      const task = await storage.createFollowUpTask({ ...taskData, userId });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/follow-ups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { familyMemberId, conditionId, status, daysAhead } = req.query;
      const tasks = await storage.getFollowUpTasks(userId, {
        familyMemberId: familyMemberId as string,
        conditionId: conditionId as string,
        status: status as string,
        daysAhead: daysAhead ? parseInt(daysAhead as string) : undefined,
      });
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/follow-ups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getFollowUpTask(req.params.id);
      if (!task || task.userId !== userId) {
        return res.status(404).json({ error: "Follow-up task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/follow-ups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getFollowUpTask(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Follow-up task not found" });
      }
      const body = { ...req.body };
      if (body.familyMemberId === "") body.familyMemberId = undefined;
      if (body.conditionId === "") body.conditionId = undefined;
      if (body.contactId === "") body.contactId = undefined;
      if (body.referralId === "") body.referralId = undefined;
      if (body.triggerTime === "") body.triggerTime = undefined;
      if (body.parentTaskId === "") body.parentTaskId = undefined;
      
      const updateData = insertFollowUpTaskSchema.partial().parse(body);
      const task = await storage.updateFollowUpTask(req.params.id, updateData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/follow-ups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getFollowUpTask(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Follow-up task not found" });
      }
      await storage.deleteFollowUpTask(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/follow-ups/:id/children", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parent = await storage.getFollowUpTask(req.params.id);
      if (!parent || parent.userId !== userId) {
        return res.status(404).json({ error: "Follow-up task not found" });
      }
      const children = await storage.getChildTasks(req.params.id);
      res.json(children);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // AI INTAKE API - Parse medical text
  // ============================================
  const aiParseSchema = z.object({
    text: z.string().min(1).max(10000),
  });

  app.post("/api/medical/ai/parse", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = aiParseSchema.parse(req.body);
      
      const today = new Date().toISOString().split('T')[0];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that parses medical-related notes into structured data for a personal health tracker. Today's date is ${today}.

EXTRACT ALL of the following types of entries from the text - be thorough and don't miss anything:
1. **contacts** - Healthcare providers, nurses, doctors, clinics, hospitals. IMPORTANT: Create a contact for ANY organization/location that has a phone number mentioned (e.g., if "RBH" has phone "01234567890", create a contact for RBH with that phone)
2. **referrals** - Medical referrals to specialists, hospitals, imaging, labs. ALWAYS create a referral when the text mentions referring, sending, or scheduling at another location
3. **followUps** - Tasks, reminders, things to follow up on. ALWAYS include phone numbers in both purpose and description fields
4. **conditions** - Health conditions, diagnoses, preventive care (vaccinations, screenings)
5. **medications** - Prescriptions, medications mentioned

For each extracted item, include:
- type: one of "contact", "referral", "followUp", "condition", "medication"
- confidence: 0-1 indicating how confident you are
- data: the structured fields for that type
- familyMemberName: the actual person's name as mentioned (e.g., "Nini Azam", "John Smith")

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. **contacts**: 
   - Create a contact for EVERY organization with a phone number (hospitals, clinics, departments)
   - Include the "phone" field with the phone number
   - If the place name is abbreviated (RBH, JRH), use the abbreviation as the name
   
2. **referrals**: 
   - Create a referral for EVERY mention of referral, being referred, appointment booking, test scheduling
   - Fields: "referredTo" (what/where), "type" (specialist/imaging/lab/general), "status": "pending"
   
3. **followUps**:
   - Create a follow-up for EVERY action item, reminder, or "call to check" mentioned
   - ALWAYS put phone numbers in both "purpose" and "description" fields
   - Fields: "purpose" (short action), "description" (detailed with phone), "triggerDate" (YYYY-MM-DD)
   
4. **dates**: Convert relative dates (tomorrow, next week, in 2 months) to YYYY-MM-DD using today's date

Return JSON: { items: AiParsedItem[] }

EXAMPLE INPUT: "GP Appointment for Nini Azam. GP will refer her for a Blood Test at RBH. Call RBH tomorrow on 01189047900 to check if they received the referral."

EXAMPLE OUTPUT (you MUST produce all 3 items - contact, referral, AND followUp):
{
  "items": [
    {
      "type": "contact",
      "confidence": 0.95,
      "familyMemberName": "Nini Azam",
      "data": {
        "name": "RBH",
        "role": "Hospital",
        "phone": "01189047900"
      }
    },
    {
      "type": "referral",
      "confidence": 0.95,
      "familyMemberName": "Nini Azam",
      "data": {
        "referredTo": "Blood Test",
        "type": "lab",
        "status": "pending"
      }
    },
    {
      "type": "followUp",
      "confidence": 0.95,
      "familyMemberName": "Nini Azam",
      "data": {
        "purpose": "Call RBH on 01189047900 to check blood test referral",
        "triggerDate": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}",
        "description": "Call RBH on 01189047900 to verify they received the blood test referral for Nini Azam"
      }
    }
  ]
}

Remember: Be thorough. Extract ALL contacts, referrals, and follow-ups. Every phone number should appear in a contact AND in any related follow-up descriptions.`,
          },
          {
            role: "user",
            content: validated.text,
          },
        ],
        response_format: { type: "json_object" },
      });
      
      const result = JSON.parse(completion.choices[0].message.content || '{"items":[]}');
      
      // Save as pending intake
      const intake = await storage.createAiIntake({
        userId,
        sourceText: validated.text,
        parsedItems: result.items || [],
        status: "pending",
      });
      
      res.json({ intake, items: result.items || [] });
    } catch (error: any) {
      console.error("AI parse error:", error);
      res.status(500).json({ error: "Failed to parse medical text" });
    }
  });

  app.get("/api/medical/ai/intakes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      const intakes = await storage.getAiIntakes(userId, status as string);
      res.json(intakes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/ai/intakes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const intake = await storage.getAiIntake(req.params.id);
      if (!intake || intake.userId !== userId) {
        return res.status(404).json({ error: "Intake not found" });
      }
      res.json(intake);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Confirm AI intake - create actual records
  app.post("/api/medical/ai/intakes/:id/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const intake = await storage.getAiIntake(req.params.id);
      if (!intake || intake.userId !== userId) {
        return res.status(404).json({ error: "Intake not found" });
      }
      
      const { selectedItems } = req.body; // Array of items to create (may be edited)
      const createdRecords: any = {
        contacts: [],
        referrals: [],
        followUps: [],
        conditions: [],
        medications: [],
      };
      
      for (const item of selectedItems) {
        try {
          switch (item.type) {
            case 'contact':
              const contact = await storage.createMedicalContact({ ...item.data, userId });
              createdRecords.contacts.push(contact);
              break;
            case 'referral':
              const referralData = {
                ...item.data,
                type: item.data.type || 'general',
                status: item.data.status || 'pending',
                userId
              };
              const referral = await storage.createMedicalReferral(referralData);
              createdRecords.referrals.push(referral);
              break;
            case 'followUp':
              const task = await storage.createFollowUpTask({ 
                ...item.data, 
                purpose: item.data.purpose || 'Follow up',
                triggerDate: new Date(item.data.triggerDate),
                userId 
              });
              createdRecords.followUps.push(task);
              break;
            case 'condition':
              const condition = await storage.createCondition({ 
                ...item.data, 
                type: item.data.type || 'episodic',
                userId 
              });
              createdRecords.conditions.push(condition);
              break;
            case 'medication':
              const medication = await storage.createMedication({ ...item.data, userId });
              createdRecords.medications.push(medication);
              break;
          }
        } catch (itemError) {
          console.error(`Failed to create ${item.type}:`, itemError);
        }
      }
      
      // Update intake status
      await storage.updateAiIntake(req.params.id, { 
        status: "confirmed",
        confirmedAt: new Date(),
      });
      
      res.json({ success: true, created: createdRecords });
    } catch (error: any) {
      console.error("Confirm intake error:", error);
      res.status(500).json({ error: "Failed to confirm intake" });
    }
  });

  app.patch("/api/medical/ai/intakes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getAiIntake(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Intake not found" });
      }
      const updateData = insertAiIntakeSchema.partial().parse(req.body);
      const intake = await storage.updateAiIntake(req.params.id, updateData);
      res.json(intake);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/medical/ai/intakes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getAiIntake(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Intake not found" });
      }
      await storage.deleteAiIntake(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Ideas API
  app.post("/api/ideas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideaData = insertIdeaSchema.parse(req.body);
      const idea = await storage.createIdea({ ...ideaData, userId });
      res.json(idea);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/ideas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, status } = req.query;
      const ideas = await storage.getIdeas(userId, { category: category as string, status: status as string });
      res.json(ideas);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/ideas/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideas = await storage.getIdeas(userId);
      const existingIdea = ideas.find(i => i.id === req.params.id);
      if (!existingIdea) {
        return res.status(404).json({ error: "Idea not found" });
      }
      const updateData = insertIdeaSchema.partial().parse(req.body);
      const idea = await storage.updateIdea(req.params.id, updateData);
      res.json(idea);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
