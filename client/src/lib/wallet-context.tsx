import { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicKey: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = async () => {
    setConnecting(true);
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnected(true);
    setPublicKey('SimulatedWalletAddress123');
    setConnecting(false);
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        connect,
        disconnect,
        publicKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
