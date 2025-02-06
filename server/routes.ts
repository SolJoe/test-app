import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWagerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SUPPORTED_COINS } from "@shared/schema";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
let lastKnownPrices: Record<string, number> | null = null;
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10000; // Minimum 10 seconds between API calls

// Simulated price updates between API calls
function simulatePrice(basePrice: number): number {
  const variation = basePrice * 0.0001; // 0.01% variation
  return basePrice + (Math.random() * variation * 2 - variation);
}

async function fetchCryptoPrices(): Promise<Record<string, number> | null> {
  const now = Date.now();

  // If we have prices and it's too soon to fetch again, simulate price movement
  if (lastKnownPrices && now - lastFetchTime < MIN_FETCH_INTERVAL) {
    const simulatedPrices: Record<string, number> = {};
    for (const coin of SUPPORTED_COINS) {
      if (lastKnownPrices[coin.id]) {
        simulatedPrices[coin.id] = simulatePrice(lastKnownPrices[coin.id]);
      }
    }
    return simulatedPrices;
  }

  try {
    const ids = SUPPORTED_COINS.map(coin => coin.id).join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoWagerApp/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      // On error, if we have lastKnownPrices, simulate movements
      if (lastKnownPrices) {
        const simulatedPrices: Record<string, number> = {};
        for (const coin of SUPPORTED_COINS) {
          if (lastKnownPrices[coin.id]) {
            simulatedPrices[coin.id] = simulatePrice(lastKnownPrices[coin.id]);
          }
        }
        return simulatedPrices;
      }
      return lastKnownPrices;
    }

    const data = await response.json() as Record<string, { usd: number }>;
    const prices: Record<string, number> = {};
    let hasAllPrices = true;

    for (const coin of SUPPORTED_COINS) {
      if (data[coin.id]?.usd) {
        prices[coin.id] = data[coin.id].usd;
      } else {
        hasAllPrices = false;
        console.error(`Missing price data for ${coin.id}`);
      }
    }

    if (hasAllPrices) {
      lastKnownPrices = prices;
      lastFetchTime = now;
      console.log('Updated prices from API:', prices);
      return prices;
    }

    return lastKnownPrices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // On error, if we have lastKnownPrices, simulate movements
    if (lastKnownPrices) {
      const simulatedPrices: Record<string, number> = {};
      for (const coin of SUPPORTED_COINS) {
        if (lastKnownPrices[coin.id]) {
          simulatedPrices[coin.id] = simulatePrice(lastKnownPrices[coin.id]);
        }
      }
      return simulatedPrices;
    }
    return lastKnownPrices;
  }
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  app.post("/api/wagers", async (req, res) => {
    try {
      const result = insertWagerSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const created = await storage.createWager(result.data);
      res.json(created);
    } catch (error) {
      console.error('Error creating wager:', error);
      res.status(500).json({ error: "Failed to create wager" });
    }
  });

  app.get("/api/wagers/active", async (_req, res) => {
    try {
      const [active, recent] = await Promise.all([
        storage.getActiveWagers(),
        storage.getRecentWagers()
      ]);

      const combinedWagers = [...active];
      for (const wager of recent) {
        if (!combinedWagers.some(w => w.id === wager.id)) {
          combinedWagers.push(wager);
        }
      }

      res.json(combinedWagers);
    } catch (error) {
      console.error('Error fetching wagers:', error);
      res.status(500).json({ error: "Failed to fetch wagers" });
    }
  });

  app.get("/api/wagers/history", async (_req, res) => {
    const wagers = await storage.getAllWagers();
    res.json(wagers);
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    let updateInterval: NodeJS.Timeout;

    const sendPrices = async () => {
      if (ws.readyState === WebSocket.OPEN) {
        const prices = await fetchCryptoPrices();
        if (prices) {
          // Only send if prices have changed
          if (lastKnownPrices) {
            let hasChanged = false;
            for (const coin of SUPPORTED_COINS) {
              const oldPrice = lastKnownPrices[coin.id];
              const newPrice = prices[coin.id];
              if (oldPrice !== newPrice) {
                console.log(`Price update for ${coin.id}: ${oldPrice} -> ${newPrice}`);
                hasChanged = true;
              }
            }
            if (hasChanged) {
              ws.send(JSON.stringify(prices));
            }
          } else {
            ws.send(JSON.stringify(prices));
          }

          const activeWagers = await storage.getActiveWagers();
          for (const wager of activeWagers) {
            const currentPrice = prices[wager.cryptoId];
            const now = new Date();

            if (now >= new Date(wager.endTime)) {
              console.log('Checking wager:', {
                id: wager.id,
                cryptoId: wager.cryptoId,
                direction: wager.direction,
                currentPrice,
                targetPrice: wager.targetPrice,
                startPrice: wager.startPrice
              });

              // Fix winning condition logic
              const priceMovedUp = currentPrice > wager.startPrice;
              const priceMovedDown = currentPrice < wager.startPrice;

              const won = (wager.direction === 'up' && priceMovedUp) || 
                         (wager.direction === 'down' && priceMovedDown);

              await storage.updateWagerStatus(wager.id, won, currentPrice);
            }
          }
        }
      }
    };

    // Send initial prices immediately
    sendPrices();

    // Update more frequently with simulated prices between real API calls
    updateInterval = setInterval(sendPrices, 1000);

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("close", () => {
      console.log('WebSocket connection closed');
      clearInterval(updateInterval);
      clearInterval(pingInterval);
    });

    ws.on("error", (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}