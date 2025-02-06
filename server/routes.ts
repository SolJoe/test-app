import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertWagerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SUPPORTED_COINS } from "@shared/schema";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

async function fetchCryptoPrices() {
  try {
    const ids = SUPPORTED_COINS.map(coin => coin.id).join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`
    );
    const data = await response.json();

    return {
      bitcoin: data.bitcoin?.usd || 0,
      ethereum: data.ethereum?.usd || 0,
      binancecoin: data.binancecoin?.usd || 0,
    };
  } catch (error) {
    console.error('Error fetching prices:', error);
    return null;
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

  // WebSocket connection for real-time price updates
  wss.on("connection", (ws) => {
    const interval = setInterval(async () => {
      if (ws.readyState === ws.OPEN) {
        const prices = await fetchCryptoPrices();
        if (prices) {
          ws.send(JSON.stringify(prices));
        }
      }
    }, 10000); // Update every 10 seconds to respect API rate limits

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return httpServer;
}