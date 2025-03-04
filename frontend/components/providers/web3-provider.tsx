"use client";

import { ReactNode } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ViemWagmiWeb3Adapter } from "@dynamic-labs/wagmi-connector";

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_PROJECT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
        web3Adapters: [ViemWagmiWeb3Adapter],
        evmNetworks: [
          {
            id: 5201420, // Electroneum mainnet
            name: "Electroneum",
            chainId: "0x4F63BC", // hex format
            displayName: "Electroneum",
            rpcUrls: ["https://rpc.electroneum.com"],
            blockExplorerUrls: ["https://explorer.electroneum.com"],
            nativeCurrency: {
              name: "Electroneum",
              symbol: "ETN",
              decimals: 18,
            },
          },
          {
            id: 5201421, // Electroneum testnet
            name: "Electroneum Testnet",
            chainId: "0x4F63BD", // hex format
            displayName: "Electroneum Testnet",
            rpcUrls: ["https://testnet-rpc.electroneum.com"],
            blockExplorerUrls: ["https://testnet-explorer.electroneum.com"],
            nativeCurrency: {
              name: "Electroneum",
              symbol: "ETN",
              decimals: 18,
            },
          },
        ],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
