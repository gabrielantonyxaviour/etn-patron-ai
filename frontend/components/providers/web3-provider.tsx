"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  DynamicWagmiConnector,
  EthereumWalletConnectorsWithConfig,
} from "@/lib/dyanmic";
import { electroneum, sepolia } from "viem/chains";
import { useTheme } from "next-themes";

const IS_PRODUCTION = JSON.parse(
  process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
);

const config = IS_PRODUCTION
  ? createConfig({
      chains: [electroneum],
      multiInjectedProviderDiscovery: false,
      transports: {
        [electroneum.id]: http(
          "https://rpc.ankr.com/electroneum/" +
            process.env.NEXT_PUBLIC_ANKR_API_KEY
        ),
      },
    })
  : createConfig({
      chains: [sepolia],
      multiInjectedProviderDiscovery: false,
      transports: {
        [sepolia.id]: http(
          "https://eth-sepolia.g.alchemy.com/v2/" +
            process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ),
      },
    });

const queryClient = new QueryClient();
interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { theme } = useTheme();
  return (
    <>
      <DynamicContextProvider
        theme={theme == "light" ? "light" : "dark"}
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
          walletConnectors: [
            EthereumWalletConnectorsWithConfig({
              publicClientHttpTransportConfig: {
                fetchOptions: {
                  headers: {
                    "X-Requested-With": "XMLHttpRequest",
                  },
                },
                retryCount: 0,
              },
            }),
          ],
          overrides: {
            evmNetworks: [
              IS_PRODUCTION
                ? {
                    key: electroneum.id.toString(),
                    blockExplorerUrls: [electroneum.blockExplorers.default.url],
                    chainId: electroneum.id,
                    chainName: electroneum.name,
                    iconUrls: ["https://etn-patron-ai.vercel.app/chain.png"],
                    name: electroneum.name,
                    nativeCurrency: {
                      ...electroneum.nativeCurrency,
                      iconUrl: "https://etn-patron-ai.vercel.app/chain.png",
                    },
                    networkId: electroneum.id,
                    rpcUrls: [
                      "https://rpc.ankr.com/electroneum/" +
                        process.env.NEXT_PUBLIC_ANKR_API_KEY,
                    ],
                    vanityName: electroneum.name,
                    isTestnet: electroneum.testnet,
                  }
                : {
                    key: sepolia.id.toString(),
                    blockExplorerUrls: [sepolia.blockExplorers.default.url],
                    chainId: sepolia.id,
                    chainName: sepolia.name,
                    iconUrls: [
                      "https://app.dynamic.xyz/assets/networks/eth.svg",
                    ],
                    name: sepolia.name,
                    nativeCurrency: {
                      ...sepolia.nativeCurrency,
                      iconUrl:
                        "https://app.dynamic.xyz/assets/networks/eth.svg",
                    },
                    networkId: sepolia.id,
                    rpcUrls: [
                      "https://eth-sepolia.g.alchemy.com/v2/" +
                        process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
                    ],
                    vanityName: sepolia.name,
                    isTestnet: sepolia.testnet,
                  },
            ],
          },
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </>
  );
}
