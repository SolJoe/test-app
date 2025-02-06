import { FC } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const WalletButton: FC = () => {
  const { connecting, connected, connect, disconnect, publicKey } = useWallet();

  if (connecting) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (connected) {
    return (
      <Button onClick={disconnect} variant="outline">
        {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={connect}>
      Connect Wallet
    </Button>
  );
};