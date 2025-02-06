import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertWagerSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  app.post("/api/wagers", async (req, res) => {
    try {
      const wager = insertWagerSchema.parse(req.body);
      const created = await storage.createWager(wager);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid wager data" });
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
        // Fetch latest prices from CoinGecko
        const prices = {
          bitcoin: Math.random() * 50000 + 40000,
          ethereum: Math.random() * 3000 + 2000,
          binancecoin: Math.random() * 300 + 200,
        };
        ws.send(JSON.stringify(prices));
      }
    }, 1000);

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return httpServer;
}
