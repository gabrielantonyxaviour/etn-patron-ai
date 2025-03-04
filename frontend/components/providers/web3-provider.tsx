"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  DynamicWagmiConnector,
} from "@/lib/dyanmic";
import { electroneum, electroneumTestnet } from "viem/chains";

const IS_PRODUCTION = JSON.parse(
  process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
);

const config = IS_PRODUCTION
  ? createConfig({
      chains: [electroneum],
      multiInjectedProviderDiscovery: false,
      transports: {
        [electroneum.id]: http(),
      },
    })
  : createConfig({
      chains: [electroneumTestnet],
      multiInjectedProviderDiscovery: false,
      transports: {
        [electroneumTestnet.id]: http(),
      },
    });

const queryClient = new QueryClient();
interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <DynamicContextProvider
      theme={"auto"}
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
