import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wagers = pgTable("wagers", {
  id: serial("id").primaryKey(),
  cryptoId: text("crypto_id").notNull(),
  amount: real("amount").notNull(),
  multiplier: real("multiplier").notNull(),
  targetPrice: real("target_price").notNull(),
  startPrice: real("start_price").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  won: boolean("won").default(false),
});

export const insertWagerSchema = createInsertSchema(wagers).omit({
  id: true,
  isActive: true,
  won: true,
});

export type InsertWager = z.infer<typeof insertWagerSchema>;
export type Wager = typeof wagers.$inferSelect;
