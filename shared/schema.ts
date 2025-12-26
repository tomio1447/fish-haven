import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Players table (game progress)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  equippedRodId: text("equipped_rod_id").notNull().default("bamboo"),
  selectedBait: text("selected_bait").notNull().default("bread"),
  ownedBaits: jsonb("owned_baits").notNull().default({ bread: 20, worm: 10, lure: 1 }),
  unlockedMaps: jsonb("unlocked_maps").notNull().default(["pond", "creek", "river"]),
  gameMinutes: integer("game_minutes").notNull().default(480), // Start at 8:00 AM (8*60)
  gameDay: integer("game_day").notNull().default(1),
  timeAnchorReal: real("time_anchor_real").notNull().default(0), // Real timestamp when game time was last synced
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Catches table
export const catches = pgTable("catches", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  fishId: text("fish_id").notNull(),
  weight: real("weight").notNull(),
  length: real("length").notNull().default(0),
  rank: text("rank").notNull().default("C"),
  locationId: text("location_id").notNull().default("pond"),
  caughtAt: timestamp("caught_at").defaultNow().notNull(),
  sold: integer("sold").notNull().default(0), // 0 = in basket, 1 = sold, 2 = trophy
});

// Trophies table
export const trophies = pgTable("trophies", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  fishId: text("fish_id").notNull(),
  weight: real("weight").notNull(),
  length: real("length").notNull(),
  rank: text("rank").notNull(),
  locationId: text("location_id").notNull(),
  caughtAt: timestamp("caught_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mastery table
export const mastery = pgTable("mastery", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  fishId: text("fish_id").notNull(),
  count: integer("count").notNull().default(0),
  maxWeight: real("max_weight").notNull().default(0),
  stars: integer("stars").notNull().default(0),
});

// Zod schemas
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPlayerSchema = createSelectSchema(players);

export const insertCatchSchema = createInsertSchema(catches).omit({ id: true, caughtAt: true });
export const selectCatchSchema = createSelectSchema(catches);

export const insertMasterySchema = createInsertSchema(mastery).omit({ id: true });
export const selectMasterySchema = createSelectSchema(mastery);

export const insertTrophySchema = createInsertSchema(trophies).omit({ id: true, createdAt: true });
export const selectTrophySchema = createSelectSchema(trophies);

// Types
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertCatch = z.infer<typeof insertCatchSchema>;
export type Catch = typeof catches.$inferSelect;

export type InsertMastery = z.infer<typeof insertMasterySchema>;
export type Mastery = typeof mastery.$inferSelect;

export type InsertTrophy = z.infer<typeof insertTrophySchema>;
export type Trophy = typeof trophies.$inferSelect;
