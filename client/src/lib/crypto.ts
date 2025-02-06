import { SUPPORTED_COINS } from "@shared/schema";

export const MULTIPLIER_PERCENTAGES = {
  "1": 0.00001, // 0.001% change
  "2": 0.00002, // 0.002% change
  "3": 0.00003, // 0.003% change
  "5": 0.00005, // 0.005% change
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
  const change = currentPrice * percentage;
  const targetPrice = direction === 'up' 
    ? currentPrice + change
    : currentPrice - change;

  // Round to 8 decimal places for more precise comparison
  return Number(targetPrice.toFixed(8));
}