export const MULTIPLIER_PERCENTAGES = {
  "1": 0.015,
  "2": 0.020,
  "3": 0.025,
  "5": 0.030,
} as const;

export const SUPPORTED_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
] as const;

export type CoinId = typeof SUPPORTED_COINS[number]["id"];
export type WagerMultiplier = keyof typeof MULTIPLIER_PERCENTAGES;

export function calculatePotentialWinnings(amount: number, multiplier: number): number {
  return amount * multiplier;
}

export function calculateTargetPrice(currentPrice: number, multiplier: string): number {
  const percentage = MULTIPLIER_PERCENTAGES[multiplier as WagerMultiplier];
  return currentPrice * (1 + percentage);
}