import { Chain } from "viem";

export const electroneumChain: Chain = {
  id: 5_201_420,
  name: "Electroneum",
  nativeCurrency: {
    name: "Electroneum",
    symbol: "ETN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.electroneum.com"],
    },
    public: {
      http: ["https://rpc.electroneum.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Electroneum Explorer",
      url: "https://explorer.electroneum.com",
    },
  },
};

export const electroneumTestnet: Chain = {
  id: 5_201_421,
  name: "Electroneum Testnet",
  nativeCurrency: {
    name: "Electroneum",
    symbol: "ETN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.electroneum.com"],
    },
    public: {
      http: ["https://testnet-rpc.electroneum.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Electroneum Testnet Explorer",
      url: "https://testnet-explorer.electroneum.com",
    },
  },
  testnet: true,
};
