import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Wager } from "@shared/schema";

export function WagerHistory() {
  const { data: wagers, isLoading } = useQuery<Wager[]>({
    queryKey: ["/api/wagers/active"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Sort wagers by startTime in descending order (most recent first)
  const sortedWagers = wagers?.sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Active Wagers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedWagers?.map((wager) => (
            <div
              key={wager.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Direction:</span>
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
            </div>
          ))}
          {(!sortedWagers || sortedWagers.length === 0) && (
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

  // Color transitions based on progress
  const getProgressColor = (value: number) => {
    if (value >= 75) return "destructive";
    if (value >= 50) return "warning";
    return "success";
  };

  return (
    <div className="space-y-1.5">
      <Progress
        value={progress}
        className={`h-4 overflow-hidden rounded-full bg-secondary`}
        style={{
          ["--progress-color" as any]: `hsl(var(--${getProgressColor(progress)}))`,
        }}
      />
    </div>
  );
}