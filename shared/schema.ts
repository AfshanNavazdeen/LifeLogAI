import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const entries = pgTable("entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: text("currency").default("GBP"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  attachments: text("attachments").array().default(sql`ARRAY[]::text[]`),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  aiGenerated: text("ai_generated"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  timestamp: z.coerce.date().optional(),
  amount: z.string().or(z.number()).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;

export const carData = pgTable("car_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  odometerReading: integer("odometer_reading").notNull(),
  fuelAmount: decimal("fuel_amount", { precision: 10, scale: 2 }),
  fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCarDataSchema = createInsertSchema(carData).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  timestamp: z.coerce.date().optional(),
  fuelAmount: z.string().or(z.number()).optional(),
  fuelCost: z.string().or(z.number()).optional(),
});

export type InsertCarData = z.infer<typeof insertCarDataSchema>;
export type CarData = typeof carData.$inferSelect;

export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  details: text("details").notNull(),
  severity: text("severity").notNull().default("info"),
  relatedEntries: text("related_entries").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

// Medical Contacts
export const medicalContacts = pgTable("medical_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  clinic: text("clinic"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicalContactSchema = createInsertSchema(medicalContacts).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertMedicalContact = z.infer<typeof insertMedicalContactSchema>;
export type MedicalContact = typeof medicalContacts.$inferSelect;

// Medical Referrals
export const medicalReferrals = pgTable("medical_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  dateSent: timestamp("date_sent"),
  senderContactId: varchar("sender_contact_id").references(() => medicalContacts.id),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicalReferralSchema = createInsertSchema(medicalReferrals).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  dateSent: z.coerce.date().optional(),
});

export type InsertMedicalReferral = z.infer<typeof insertMedicalReferralSchema>;
export type MedicalReferral = typeof medicalReferrals.$inferSelect;

// Follow-Up Tasks
export const followUpTasks = pgTable("follow_up_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referralId: varchar("referral_id").references(() => medicalReferrals.id, { onDelete: "cascade" }),
  triggerDate: timestamp("trigger_date").notNull(),
  contactId: varchar("contact_id").references(() => medicalContacts.id),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("pending"),
  reminderSent: timestamp("reminder_sent"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFollowUpTaskSchema = createInsertSchema(followUpTasks).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  triggerDate: z.coerce.date(),
  reminderSent: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export type InsertFollowUpTask = z.infer<typeof insertFollowUpTaskSchema>;
export type FollowUpTask = typeof followUpTasks.$inferSelect;

// Ideas
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  context: jsonb("context").default(sql`'{}'::jsonb`),
  status: text("status").notNull().default("concept"),
  priority: integer("priority").default(0),
  linkedEntryId: varchar("linked_entry_id").references(() => entries.id, { onDelete: "set null" }),
  notes: text("notes"),
  viewCount: integer("view_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  lastViewedAt: true,
}).extend({
  tags: z.array(z.string()).optional(),
  context: z.record(z.any()).optional(),
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;
