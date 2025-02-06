import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
                <span>
                  {new Date(wager.endTime) > new Date()
                    ? formatTimeRemaining(new Date(wager.endTime))
                    : "Expired"}
                </span>
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

function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
