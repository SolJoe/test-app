import { wagers, type Wager, type InsertWager } from "@shared/schema";

export interface IStorage {
  createWager(wager: InsertWager): Promise<Wager>;
  getActiveWagers(): Promise<Wager[]>;
  updateWagerStatus(id: number, won: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private wagers: Map<number, Wager>;
  private currentId: number;

  constructor() {
    this.wagers = new Map();
    this.currentId = 1;
  }

  async createWager(insertWager: InsertWager): Promise<Wager> {
    const id = this.currentId++;
    const wager: Wager = {
      ...insertWager,
      id,
      isActive: true,
      won: false,
    };
    this.wagers.set(id, wager);
    return wager;
  }

  async getActiveWagers(): Promise<Wager[]> {
    return Array.from(this.wagers.values()).filter(w => w.isActive);
  }

  async updateWagerStatus(id: number, won: boolean): Promise<void> {
    const wager = this.wagers.get(id);
    if (wager) {
      wager.isActive = false;
      wager.won = won;
      this.wagers.set(id, wager);
    }
  }
}

export const storage = new MemStorage();
