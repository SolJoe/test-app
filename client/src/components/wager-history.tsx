import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Wager } from "@shared/schema";
import { ShareWager } from "@/components/share-wager";
import { SUPPORTED_COINS } from "@/lib/crypto";

export function WagerHistory() {
  const { data: wagers, isLoading } = useQuery<Wager[]>({
    queryKey: ["/api/wagers/active"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Separate active and recent wagers
  const activeWagers = wagers?.filter(wager => wager.isActive) || [];
  const recentWagers = wagers?.filter(wager => !wager.isActive) || [];

  return (
    <div className="space-y-8">
      {/* Active Wagers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Wagers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWagers.map((wager) => (
              <WagerCard key={wager.id} wager={wager} />
            ))}
            {activeWagers.length === 0 && (
              <p className="text-center text-muted-foreground">
                No active wagers
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Wagers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Wagers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentWagers.map((wager) => (
              <WagerCard key={wager.id} wager={wager} />
            ))}
            {recentWagers.length === 0 && (
              <p className="text-center text-muted-foreground">
                No recent wagers
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Extracted WagerCard component for reuse
function WagerCard({ wager }: { wager: Wager }) {
  const coinName = SUPPORTED_COINS.find(coin => coin.id === wager.cryptoId)?.name || wager.cryptoId;

  return (
    <div
      className={`flex flex-col space-y-2 p-4 border rounded-lg ${
        !wager.isActive && wager.won !== null
          ? wager.won
            ? "bg-success/10 border-success"
            : "bg-destructive/10 border-destructive"
          : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-lg">{coinName}</span>
        <span className="flex items-center">
          {wager.direction === "up" ? (
            <ArrowUpCircle className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownCircle className="mr-1 h-4 w-4 text-red-500" />
          )}
          {wager.direction === "up" ? "LONG" : "SHORT"}
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
      {!wager.isActive && wager.finalPrice && (
        <div className="flex justify-between">
          <span className="font-medium">Final Price:</span>
          <span>${wager.finalPrice.toFixed(2)}</span>
        </div>
      )}
      {!wager.isActive && wager.won !== null && (
        <>
          <div className="flex justify-between font-bold">
            <span>Result:</span>
            <span className={wager.won ? "text-success" : "text-destructive"}>
              {wager.won ? "WON" : "LOST"}
            </span>
          </div>
          <ShareWager wager={wager} />
        </>
      )}
      {wager.isActive && (
        <>
          <div className="flex justify-between">
            <span className="font-medium">Time Remaining:</span>
            <TimeRemaining endTime={new Date(wager.endTime)} />
          </div>
          <div className="mt-2">
            <WagerProgress
              startTime={new Date(wager.startTime)}
              endTime={new Date(wager.endTime)}
            />
          </div>
        </>
      )}
    </div>
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

  return <span>{minutes}:{seconds.toString().padStart(2, "0")}</span>;
}

function WagerProgress({ startTime, endTime }: { startTime: Date; endTime: Date }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const total = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      setProgress(percentage);
    };

    updateProgress();
    const timer = setInterval(updateProgress, 1000);
    return () => clearInterval(timer);
  }, [startTime, endTime]);

  return (
    <div className="space-y-1.5">
      <Progress
        value={progress}
        className={`h-4 overflow-hidden rounded-full bg-secondary`}
      />
    </div>
  );
}