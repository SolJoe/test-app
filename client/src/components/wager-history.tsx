import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { Wager } from "@shared/schema";

export function WagerHistory() {
  const { data: wagers, isLoading } = useQuery<Wager[]>({
    queryKey: ["/api/wagers/active"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Active Wagers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wagers?.map((wager) => (
            <div
              key={wager.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Direction:</span>
                <span className="flex items-center">
                  {wager.direction === 'up' ? (
                    <ArrowUpCircle className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  {wager.direction === 'up' ? 'LONG' : 'SHORT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Wager Amount:</span>
                <span>${wager.amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Multiplier:</span>
                <span>{wager.multiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Target Price:</span>
                <span>${wager.targetPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Start Price:</span>
                <span>${wager.startPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Remaining:</span>
                <TimeRemaining endTime={new Date(wager.endTime)} />
              </div>
            </div>
          ))}
          {(!wagers || wagers.length === 0) && (
            <p className="text-center text-muted-foreground">
              No active wagers found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TimeRemaining({ endTime }: { endTime: Date }) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate({});
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return <span>Expired</span>;

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>;
}
