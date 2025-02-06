import { wagers, type Wager, type InsertWager } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWager(wager: InsertWager): Promise<Wager>;
  getActiveWagers(): Promise<Wager[]>;
  getAllWagers(): Promise<Wager[]>;
  getRecentWagers(): Promise<Wager[]>;
  updateWagerStatus(id: number, won: boolean, finalPrice: number): Promise<void>;
  updateTargetHit(id: number): Promise<void>; // New method
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
      .where(eq(wagers.isActive, true))
      .orderBy(wagers.startTime);
  }

  async getAllWagers(): Promise<Wager[]> {
    return db
      .select()
      .from(wagers)
      .orderBy(wagers.startTime);
  }

  async getRecentWagers(): Promise<Wager[]> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    return db
      .select()
      .from(wagers)
      .orderBy(wagers.startTime, "desc")
      .limit(10);
  }

  async updateTargetHit(id: number): Promise<void> {
    await db
      .update(wagers)
      .set({ targetHit: true })
      .where(eq(wagers.id, id));
  }

  async updateWagerStatus(id: number, won: boolean, finalPrice: number): Promise<void> {
    const wager = await db
      .select()
      .from(wagers)
      .where(eq(wagers.id, id))
      .then(rows => rows[0]);

    if (!wager) return;

    // Calculate profit: if won, it's amount * multiplier - amount, if lost, it's -amount
    const profit = won ? wager.amount * wager.multiplier - wager.amount : -wager.amount;

    console.log('Updating wager status:', {
      wagerId: id,
      won,
      finalPrice,
      profit,
      originalAmount: wager.amount,
      multiplier: wager.multiplier
    });

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