import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoinId, SUPPORTED_COINS, calculatePotentialWinnings, calculateTargetPrice, type WagerMultiplier } from "@/lib/crypto";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { triggerConfetti } from "@/lib/confetti";

interface WagerCardProps {
  coinId: CoinId;
  currentPrice: number;
}

export function WagerCard({ coinId, currentPrice }: WagerCardProps) {
  const [amount, setAmount] = useState("");
  const [multiplier, setMultiplier] = useState<WagerMultiplier | "">("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [startPrice, setStartPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const potentialWinnings = amount && multiplier
    ? calculatePotentialWinnings(Number(amount), Number(multiplier))
    : null;

  const coinName = SUPPORTED_COINS.find(coin => coin.id === coinId)?.name || coinId;

  const { mutate: placeWager, isPending } = useMutation({
    mutationFn: async () => {
      if (!multiplier) throw new Error("No multiplier selected");
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid wager amount");
      }
      if (!currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
        throw new Error("Cannot place wager: waiting for valid price data");
      }

      const target = calculateTargetPrice(currentPrice, multiplier);
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

      const wagerData = {
        cryptoId: coinId,
        amount: Number(amount),
        multiplier: Number(multiplier),
        targetPrice: target,
        startPrice: currentPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      return apiRequest("POST", "/api/wagers", wagerData);
    },
    onSuccess: () => {
      setCountdown(3600); // 1 hour in seconds
      if (multiplier) {
        const target = calculateTargetPrice(currentPrice, multiplier);
        setTargetPrice(target);
        setStartPrice(currentPrice);
      }
      triggerConfetti(coinId);
      toast({
        title: "Wager placed successfully! 🎉",
        description: "Your wager has been placed and the countdown has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error placing wager",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (countdown === null) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour from now

    const wagerData = {
      cryptoId: coinId,
      amount: Number(amount),
      multiplier: Number(multiplier),
      targetPrice: calculateTargetPrice(currentPrice, multiplier as WagerMultiplier),
      startPrice: currentPrice,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    placeWager(undefined);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold text-center">
        Place Wager
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current {coinName} Price</label>
          <div className="text-lg font-semibold">
            ${currentPrice?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "Loading..."}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wager Amount</label>
          <Input
            type="number"
            placeholder="Enter amount in USDC"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wager Multiplier</label>
          <Select
            value={multiplier}
            onValueChange={(value: WagerMultiplier) => setMultiplier(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select multiplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="3">3x</SelectItem>
              <SelectItem value="5">5x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Potential Winnings</label>
          <div className="text-xl font-bold">
            ${potentialWinnings?.toFixed(2) || "0.00"} USDC
          </div>
        </div>

        {countdown !== null && targetPrice !== null && startPrice !== null && (
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-xl font-bold">
                Time Remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
              </div>
              <div className="flex justify-between text-sm">
                <span>Start Price: ${startPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
                <span>Target Price: ${targetPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!amount || !multiplier || isPending || countdown !== null || !currentPrice}
        >
          {isPending ? "Placing Wager..." : !currentPrice ? "Waiting for price data..." : "Place Wager"}
        </Button>
      </CardContent>
    </Card>
  );
}