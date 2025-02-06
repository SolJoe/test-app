import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertWagerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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
        // Mock price updates for testing
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