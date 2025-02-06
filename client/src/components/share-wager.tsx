import { Share2 } from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import type { Wager } from "@shared/schema";
import { SUPPORTED_COINS } from "@/lib/crypto";

interface ShareWagerProps {
  wager: Wager;
}

export function ShareWager({ wager }: ShareWagerProps) {
  const coinName = SUPPORTED_COINS.find(coin => coin.id === wager.cryptoId)?.name || wager.cryptoId;

  const shareText = wager.won 
    ? `🎉 Just won a crypto price movement bet on ${coinName}! \nProfit: $${wager.profit?.toFixed(2)} USDC\nPlatform: Crypto Wager App`
    : `📊 Just completed a crypto price movement bet on ${coinName}!\nPlatform: Crypto Wager App`;

  const shareViaX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank');
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
        onClick={shareViaFacebook}
      >
        <SiFacebook className="h-4 w-4" />
        Share on Facebook
      </Button>
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            navigator.share({
              title: wager.won ? 'Successful Crypto Wager' : 'Crypto Wager Result',
              text: shareText,
            }).catch(err => console.error('Error sharing:', err));
          }}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}
    </div>
  );
}