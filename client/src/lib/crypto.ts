import { SUPPORTED_COINS } from "@shared/schema";

export const MULTIPLIER_PERCENTAGES = {
  "1": 0.0001, // Changed from 0.001 to 0.0001 (0.01%) for easier testing
  "2": 0.020,
  "3": 0.025,
  "5": 0.030,
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