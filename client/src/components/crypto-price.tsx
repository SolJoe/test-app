import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORTED_COINS } from "@/lib/crypto";
import { Loader2 } from "lucide-react";

export function CryptoPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      setConnecting(true);
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnecting(false);
      };

      socket.onmessage = (event) => {
        const newPrices = JSON.parse(event.data);
        setPrices(prev => {
          // Only update if prices have changed
          const hasChanged = Object.entries(newPrices).some(
            ([key, value]) => prev[key] !== value
          );
          return hasChanged ? newPrices : prev;
        });
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setConnecting(true);
        // Attempt to reconnect after 1 second
        reconnectTimer = setTimeout(connect, 1000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {SUPPORTED_COINS.map((coin) => (
        <Card key={coin.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">{coin.name}</div>
              <div className="text-2xl font-bold">
                {connecting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  prices[coin.id] ? 
                  `$${prices[coin.id].toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}` : 
                  "..."
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}