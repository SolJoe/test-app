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

export function calculatePotentialWinnings(amount: number, multiplier: number): number {
  return amount * multiplier;
}

export function calculateTargetPrice(currentPrice: number, multiplier: number): number {
  const percentage = MULTIPLIER_PERCENTAGES[multiplier as keyof typeof MULTIPLIER_PERCENTAGES];
  return currentPrice * (1 + percentage);
}
