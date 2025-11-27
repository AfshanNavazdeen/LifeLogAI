import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrySchema, insertCarDataSchema, insertInsightSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import { z } from "zod";
import { insertMedicalContactSchema, insertMedicalReferralSchema, insertFollowUpTaskSchema, insertIdeaSchema } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
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

  // Medical Contacts API
  app.post("/api/medical/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertMedicalContactSchema.parse(req.body);
      const contact = await storage.createMedicalContact({ ...contactData, userId });
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getMedicalContacts(userId);
      res.json(contacts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Medical Referrals API
  app.post("/api/medical/referrals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referralData = insertMedicalReferralSchema.parse(req.body);
      const referral = await storage.createMedicalReferral({ ...referralData, userId });
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/referrals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getMedicalReferrals(userId);
      res.json(referrals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/referrals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertMedicalReferralSchema.partial().parse(req.body);
      const referral = await storage.updateMedicalReferral(req.params.id, updateData);
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Follow-Up Tasks API
  app.post("/api/medical/follow-ups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertFollowUpTaskSchema.parse(req.body);
      const task = await storage.createFollowUpTask({ ...taskData, userId });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/medical/follow-ups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const daysAhead = req.query.daysAhead ? parseInt(req.query.daysAhead) : 30;
      const tasks = await storage.getFollowUpTasks(userId, daysAhead);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/medical/follow-ups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertFollowUpTaskSchema.partial().parse(req.body);
      const task = await storage.updateFollowUpTask(req.params.id, updateData);
      res.json(task);
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
