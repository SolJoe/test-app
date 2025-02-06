import { SiX, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import type { Wager } from "@shared/schema";
import { SUPPORTED_COINS } from "@/lib/crypto";

interface ShareWagerProps {
  wager: Wager;
}

export function ShareWager({ wager }: ShareWagerProps) {
  // Only proceed if the wager was won
  if (!wager.won) return null;

  const coinName = SUPPORTED_COINS.find(coin => coin.id === wager.cryptoId)?.name || wager.cryptoId;

  const shareText = `🎉 Just won a crypto price movement bet on ${coinName}! \nProfit: $${wager.profit?.toFixed(2)} USDC\nPlatform: Crypto Wager App`;

  const shareViaX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaInstagram = () => {
    // Instagram doesn't have a direct web sharing API, 
    // but we can open Instagram in a new tab
    window.open('https://instagram.com', '_blank');
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={shareViaX}
      >
        <SiX className="h-4 w-4" />
        Share on X
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={shareViaInstagram}
      >
        <SiInstagram className="h-4 w-4" />
        Share on Instagram
      </Button>
    </div>
  );
}