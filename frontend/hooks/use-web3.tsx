"use client";

import { useState, useEffect } from "react";
import { createClient, createPublicClient, getAddress, http } from "viem";
import { formatEther } from "@/lib/utils";
import { electroneum, sepolia } from "viem/chains";
import { useAccount } from "wagmi";

const IS_PRODUCTION = JSON.parse(
  process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
);
const chain = IS_PRODUCTION ? electroneum : sepolia;
// Viem client
const client = createClient({
  chain,
  transport: http(),
});

export function useWeb3Modal() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>("0");
  const [publicClient, setPublicClient] = useState(client);

  useEffect(() => {
    const client = createPublicClient({
      chain: IS_PRODUCTION ? electroneum : sepolia,
      transport: http(),
    });
    setPublicClient(client);

    let previousBalance: bigint | null = null;
    let unwatchAccount = () => {};
    if (address) {
      unwatchAccount = client.watchBlocks({
        onBlock: async () => {
          try {
            const balance = await client.getBalance({ address });

            if (previousBalance !== null && balance !== previousBalance) {
              console.log(`Balance changed! New balance: ${balance}`);
              setBalance(formatEther(balance));
            }
          } catch (e) {
            console.log(e);
          }
        },
      });
    }

    return () => {
      if (address) unwatchAccount();
    };
  }, [address]);

  return {
    address,
    isConnected,
    balance,
    publicClient,
  };
}
