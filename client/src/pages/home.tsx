import { useState, useEffect } from "react";
import { CryptoPrices } from "@/components/crypto-price";
import { WagerCard } from "@/components/wager-card";
import { SUPPORTED_COINS } from "@/lib/crypto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletButton } from "@/components/wallet-button";
import { useWallet } from "@/lib/wallet-context";

export default function Home() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { connected } = useWallet();

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Crypto Price Movement Betting
        </h1>
        <WalletButton />
      </div>

      {!connected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
          Please connect your wallet to place wagers
        </div>
      )}

      <CryptoPrices />

      <Tabs defaultValue={SUPPORTED_COINS[0].id} className="w-full">
        <TabsList className="w-full justify-center">
          {SUPPORTED_COINS.map((coin) => (
            <TabsTrigger key={coin.id} value={coin.id}>
              {coin.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {SUPPORTED_COINS.map((coin) => (
          <TabsContent key={coin.id} value={coin.id}>
            <WagerCard coinId={coin.id} currentPrice={prices[coin.id]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}