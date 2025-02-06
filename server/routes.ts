import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertWagerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SUPPORTED_COINS } from "@shared/schema";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
let lastKnownPrices: Record<string, number> | null = null;

async function fetchCryptoPrices(): Promise<Record<string, number> | null> {
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
      return lastKnownPrices;
    }

    const data = await response.json() as Record<string, { usd: number }>;

    // Verify that we have all the required prices
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

    if (!hasAllPrices && lastKnownPrices) {
      return lastKnownPrices;
    }

    if (hasAllPrices) {
      lastKnownPrices = prices;
      return prices;
    }

    return lastKnownPrices;
  } catch (error) {
    console.error('Error fetching prices:', error);
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
    const wagers = await storage.getActiveWagers();
    res.json(wagers);
  });

  app.get("/api/wagers/history", async (_req, res) => {
    const wagers = await storage.getAllWagers();
    res.json(wagers);
  });

  // WebSocket connection for real-time price updates
  wss.on("connection", async (ws) => {
    // Send initial prices immediately on connection
    const initialPrices = await fetchCryptoPrices();
    if (initialPrices) {
      ws.send(JSON.stringify(initialPrices));
    }

    const interval = setInterval(async () => {
      if (ws.readyState === ws.OPEN) {
        const prices = await fetchCryptoPrices();
        if (prices) {
          ws.send(JSON.stringify(prices));

          // Check and update active wagers
          const activeWagers = await storage.getActiveWagers();
          for (const wager of activeWagers) {
            const currentPrice = prices[wager.cryptoId];
            const now = new Date();

            if (now >= new Date(wager.endTime)) {
              // Wager has expired
              const won = wager.direction === 'up'
                ? currentPrice >= wager.targetPrice
                : currentPrice <= wager.targetPrice;

              await storage.updateWagerStatus(wager.id, won, currentPrice);
            }
          }
        }
      }
    }, 10000); // Update every 10 seconds to respect API rate limits

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return httpServer;
}