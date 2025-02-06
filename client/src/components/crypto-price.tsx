import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORTED_COINS } from "@/lib/crypto";

export function CryptoPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      setPrices(JSON.parse(event.data));
    };

    return () => socket.close();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {SUPPORTED_COINS.map((coin) => (
        <Card key={coin.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">{coin.name}</div>
              <div className="text-2xl font-bold">
                ${prices[coin.id]?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "..."}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
