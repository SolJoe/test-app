import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { z } from "zod";

export const SUPPORTED_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
] as const;

export const wagers = pgTable("wagers", {
  id: serial("id").primaryKey(),
  cryptoId: text("crypto_id").notNull(),
  amount: real("amount").notNull(),
  multiplier: real("multiplier").notNull(),
  targetPrice: real("target_price").notNull(),
  startPrice: real("start_price").notNull(),
  direction: text("direction").notNull().default('up'),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  won: boolean("won").default(false),
  completedAt: timestamp("completed_at"),
  finalPrice: real("final_price"),
  profit: real("profit"),
  targetHit: boolean("target_hit").default(false), // New field to track if target was hit
});

export const insertWagerSchema = z.object({
  cryptoId: z.string(),
  amount: z.number().positive(),
  multiplier: z.number().positive(),
  targetPrice: z.number().positive(),
  startPrice: z.number().positive(),
  direction: z.enum(['up', 'down']),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
});

export type InsertWager = z.infer<typeof insertWagerSchema>;
export type Wager = typeof wagers.$inferSelect;