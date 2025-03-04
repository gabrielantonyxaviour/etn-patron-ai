"use client";

import { useState, useEffect } from "react";
import { 
  createClient, 
  http, 
  createConfig, 
  getAccount,
  watchAccount,
  getBalance
} from "viem";
import { electroneumChain } from "@/lib/chains";
import { dynamicWagmiConnectors } from "@dynamic-labs/wagmi-connector";
import { formatEther } from "@/lib/utils";

// Initialize Dynamic client
const dynamicConnectors = dynamicWagmiConnectors({
  projectId: process.env.NEXT_PUBLIC_DYNAMIC_PROJECT_ID || "",
});

// Viem client
const client = createClient({
  chain: electroneumChain,
  transport: http()
});

export function useWeb3Modal() {
  const [address, setAddress] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const config = createConfig({
      connectors: dynamicConnectors,
      chains: [electroneumChain],
      client
    });

    const unwatchAccount = watchAccount(config, {
      onChange: (account) => {
        setAddress(account?.address);
        setIsConnected(!!account?.address);
        
        if (account?.address) {
          fetchBalance(account.address);
        }
      }
    });

    // Initial account check
    const currentAccount = getAccount(config);
    setAddress(currentAccount?.address);
    setIsConnected(!!currentAccount?.address);
    
    if (currentAccount?.address) {
      fetchBalance(currentAccount.address);
    }

    return () => {
      unwatchAccount();
    };
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      const result = await getBalance(client, {
        address
      });
      setBalance(formatEther(result));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0");
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      // This will trigger Dynamic XYZ's connect modal
      window.dynamic?.connect();
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await window.dynamic?.disconnect();
      setAddress(undefined);
      setIsConnected(false);
      setBalance("0");
    } catch (error) {
      console.error("Disconnect error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    address,
    isConnected,
    balance,
    isLoading,
    connect,
    disconnect
  };
}