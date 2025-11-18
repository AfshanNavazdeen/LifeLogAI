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
  createdAt: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;
