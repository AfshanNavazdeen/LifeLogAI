import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, integer, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// FAMILY MEMBERS - Foundation for all medical data
// ============================================
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // self, spouse, child, parent, sibling, other
  dateOfBirth: timestamp("date_of_birth"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.coerce.date().optional().nullable(),
});

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

// ============================================
// CONDITIONS & HEALTH RECORDS - Master category
// ============================================
export const conditions = pgTable("conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // chronic, episodic, diagnosis, preventive
  status: text("status").notNull().default("active"), // active, resolved, monitoring
  diagnosisDate: timestamp("diagnosis_date"),
  resolvedDate: timestamp("resolved_date"),
  severity: text("severity"), // mild, moderate, severe
  notes: text("notes"),
  symptoms: text("symptoms").array().default(sql`ARRAY[]::text[]`),
  triggers: text("triggers").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConditionSchema = createInsertSchema(conditions).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  diagnosisDate: z.coerce.date().optional().nullable(),
  resolvedDate: z.coerce.date().optional().nullable(),
  symptoms: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
});

export type InsertCondition = z.infer<typeof insertConditionSchema>;
export type Condition = typeof conditions.$inferSelect;

// ============================================
// MEDICATIONS & TREATMENTS - Linked to conditions
// ============================================
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id, { onDelete: "cascade" }),
  conditionId: varchar("condition_id").references(() => conditions.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"), // once daily, twice daily, as needed, etc.
  route: text("route"), // oral, topical, injection, etc.
  prescribedBy: varchar("prescribed_by").references(() => medicalContacts.id, { onDelete: "set null" }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"), // active, completed, discontinued
  sideEffects: text("side_effects"),
  notes: text("notes"),
  refillReminder: timestamp("refill_reminder"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  refillReminder: z.coerce.date().optional().nullable(),
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// ============================================
// AI INTAKE - For pending AI-parsed entries
// ============================================
export const aiIntakes = pgTable("ai_intakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceText: text("source_text").notNull(),
  parsedItems: jsonb("parsed_items").notNull().default(sql`'[]'::jsonb`), // Array of extracted items
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertAiIntakeSchema = createInsertSchema(aiIntakes).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  parsedItems: z.array(z.any()).optional(),
  confirmedAt: z.coerce.date().optional().nullable(),
});

export type InsertAiIntake = z.infer<typeof insertAiIntakeSchema>;
export type AiIntake = typeof aiIntakes.$inferSelect;

// Type for parsed AI items
export interface AiParsedItem {
  type: 'contact' | 'referral' | 'followUp' | 'condition' | 'medication';
  confidence: number;
  data: Record<string, any>;
  familyMemberName?: string;
}

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
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  specialty: text("specialty"), // cardiology, pediatrics, general practice, etc.
  clinic: text("clinic"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  isPrimary: text("is_primary").default("false"), // Primary care provider flag
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicalContactSchema = createInsertSchema(medicalContacts).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMedicalContact = z.infer<typeof insertMedicalContactSchema>;
export type MedicalContact = typeof medicalContacts.$inferSelect;

// Medical Referrals (now part of Appointments & Follow-Ups)
export const medicalReferrals = pgTable("medical_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id, { onDelete: "cascade" }),
  conditionId: varchar("condition_id").references(() => conditions.id, { onDelete: "set null" }),
  type: text("type").notNull(), // specialist, imaging, lab, therapy, etc.
  referredTo: text("referred_to"), // Name of the referred clinic/doctor
  referredToContactId: varchar("referred_to_contact_id").references(() => medicalContacts.id, { onDelete: "set null" }),
  dateSent: timestamp("date_sent"),
  senderContactId: varchar("sender_contact_id").references(() => medicalContacts.id),
  status: text("status").notNull().default("pending"), // pending, received, scheduled, completed, cancelled
  urgency: text("urgency").default("routine"), // routine, urgent, emergency
  appointmentDate: timestamp("appointment_date"),
  notes: text("notes"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicalReferralSchema = createInsertSchema(medicalReferrals).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateSent: z.coerce.date().optional().nullable(),
  appointmentDate: z.coerce.date().optional().nullable(),
});

export type InsertMedicalReferral = z.infer<typeof insertMedicalReferralSchema>;
export type MedicalReferral = typeof medicalReferrals.$inferSelect;

// Follow-Up Tasks (now part of Appointments & Follow-Ups)
export const followUpTasks = pgTable("follow_up_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id, { onDelete: "cascade" }),
  conditionId: varchar("condition_id").references(() => conditions.id, { onDelete: "set null" }),
  referralId: varchar("referral_id").references(() => medicalReferrals.id, { onDelete: "cascade" }),
  parentTaskId: varchar("parent_task_id"), // Self-reference for task chains (can't use FK to same table easily)
  triggerDate: timestamp("trigger_date").notNull(),
  triggerTime: text("trigger_time"), // HH:mm format for the reminder time
  contactId: varchar("contact_id").references(() => medicalContacts.id),
  purpose: text("purpose").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled, waiting
  priority: text("priority").default("normal"), // low, normal, high, urgent
  outcome: text("outcome"), // Result of the follow-up
  outcomeNotes: text("outcome_notes"), // Additional notes about the outcome
  reminderSent: timestamp("reminder_sent"),
  completedAt: timestamp("completed_at"),
  notificationsEnabled: text("notifications_enabled").default("false"), // "true" or "false" as text
  nextStepCondition: jsonb("next_step_condition"), // Conditions for creating next follow-up
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFollowUpTaskSchema = createInsertSchema(followUpTasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  triggerDate: z.coerce.date(),
  reminderSent: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  nextStepCondition: z.any().optional(),
});

export type InsertFollowUpTask = z.infer<typeof insertFollowUpTaskSchema>;
export type FollowUpTask = typeof followUpTasks.$inferSelect;

// Type for next step conditions
export interface NextStepCondition {
  onOutcome: string; // completed, failed, custom value
  action: 'create_followup';
  template: Partial<InsertFollowUpTask>;
  daysFromCompletion?: number;
}

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
