"use client";

import { ReactNode } from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { electroneum, electroneumTestnet } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

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
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <DynamicWidget />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
