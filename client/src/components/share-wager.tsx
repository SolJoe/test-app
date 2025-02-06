import { Twitter, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Wager } from "@shared/schema";
import { SUPPORTED_COINS } from "@/lib/crypto";

interface ShareWagerProps {
  wager: Wager;
}

export function ShareWager({ wager }: ShareWagerProps) {
  if (!wager.won) return null;

  const coinName = SUPPORTED_COINS.find(coin => coin.id === wager.cryptoId)?.name || wager.cryptoId;
  
  const shareText = `🎉 Just won a crypto price movement bet on ${coinName}! 
Profit: $${wager.profit?.toFixed(2)} USDC
Platform: Crypto Wager App`;

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaNavigator = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Successful Crypto Wager',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={shareViaTwitter}
      >
        <Twitter className="h-4 w-4" />
        Share on Twitter
      </Button>
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={shareViaNavigator}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}
    </div>
  );
}
