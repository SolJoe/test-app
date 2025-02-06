import { wagers, type Wager, type InsertWager } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWager(wager: InsertWager): Promise<Wager>;
  getActiveWagers(): Promise<Wager[]>;
  updateWagerStatus(id: number, won: boolean): Promise<void>;
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

  async updateWagerStatus(id: number, won: boolean): Promise<void> {
    await db
      .update(wagers)
      .set({ isActive: false, won })
      .where(eq(wagers.id, id));
  }
}

export const storage = new DatabaseStorage();