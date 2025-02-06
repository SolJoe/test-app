import { wagers, type Wager, type InsertWager } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWager(wager: InsertWager): Promise<Wager>;
  getActiveWagers(): Promise<Wager[]>;
  getAllWagers(): Promise<Wager[]>;
  updateWagerStatus(id: number, won: boolean, finalPrice: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createWager(insertWager: InsertWager): Promise<Wager> {
    const [wager] = await db
      .insert(wagers)
      .values(insertWager)
      .returning();
    return wager;
  }

  async getActiveWagers(): Promise<Wager[]> {
    return db
      .select()
      .from(wagers)
      .where(eq(wagers.isActive, true));
  }

  async getAllWagers(): Promise<Wager[]> {
    return db
      .select()
      .from(wagers)
      .orderBy(wagers.startTime);
  }

  async updateWagerStatus(id: number, won: boolean, finalPrice: number): Promise<void> {
    const wager = await db
      .select()
      .from(wagers)
      .where(eq(wagers.id, id))
      .then(rows => rows[0]);

    if (!wager) return;

    const profit = won ? wager.amount * wager.multiplier : 0;

    await db
      .update(wagers)
      .set({
        isActive: false,
        won,
        finalPrice,
        profit,
        completedAt: new Date(),
      })
      .where(eq(wagers.id, id));
  }
}

export const storage = new DatabaseStorage();