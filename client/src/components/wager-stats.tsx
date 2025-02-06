import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Wager } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WagerStats {
  totalWagers: number;
  winningWagers: number;
  losingWagers: number;
  totalProfit: number;
  winRate: number;
}

export function WagerStats() {
  const { data: wagers, isLoading } = useQuery<Wager[]>({
    queryKey: ["/api/wagers/history"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!wagers || wagers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wager Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No wager history available yet. Place some wagers to see your statistics!
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats: WagerStats = wagers.reduce(
    (acc, wager) => {
      if (!wager.isActive && wager.completedAt) {
        acc.totalWagers++;
        if (wager.won) {
          acc.winningWagers++;
          acc.totalProfit += (wager.profit || 0);
        } else {
          acc.losingWagers++;
          acc.totalProfit -= wager.amount;
        }
      }
      return acc;
    },
    {
      totalWagers: 0,
      winningWagers: 0,
      losingWagers: 0,
      totalProfit: 0,
      winRate: 0,
    }
  );

  stats.winRate = stats.totalWagers > 0 
    ? (stats.winningWagers / stats.totalWagers) * 100 
    : 0;

  // Prepare chart data - group by day
  const chartData = wagers
    .filter(wager => !wager.isActive && wager.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
    .reduce((acc: any[], wager) => {
      const date = new Date(wager.completedAt!).toLocaleDateString();
      const profit = wager.won ? (wager.profit || 0) : -wager.amount;
      
      const last = acc[acc.length - 1] || { profit: 0 };
      acc.push({
        date,
        profit: profit,
        cumulative: last.cumulative ? last.cumulative + profit : profit,
      });
      
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Wagers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWagers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Win/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.winningWagers}/{stats.losingWagers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Profit"]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
