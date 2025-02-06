import { SUPPORTED_COINS } from "@shared/schema";

export const MULTIPLIER_PERCENTAGES = {
  "1": 0.0001, // 0.01% change
  "2": 0.0002, // 0.02% change
  "3": 0.0003, // 0.03% change
  "5": 0.0005, // 0.05% change
} as const;

export { SUPPORTED_COINS };

export type CoinId = typeof SUPPORTED_COINS[number]["id"];
export type WagerMultiplier = keyof typeof MULTIPLIER_PERCENTAGES;
export type WagerDirection = 'up' | 'down';

export function calculatePotentialWinnings(amount: number, multiplier: number): number {
  return amount * multiplier;
}

export function calculateTargetPrice(currentPrice: number, multiplier: string, direction: WagerDirection): number {
  const percentage = MULTIPLIER_PERCENTAGES[multiplier as WagerMultiplier];
  return direction === 'up' 
    ? currentPrice * (1 + percentage)
    : currentPrice * (1 - percentage);
}