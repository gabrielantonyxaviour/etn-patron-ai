require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// Zircuit Testnet
const ELECTRONEUM_RPC_URL =
  "https://rpc.ankr.com/electroneum/" + process.env.ANKR_API_KEY;
const ELECTRONEUM_TESTNET_RPC_URL =
  "https://rpc.ankr.com/electroneum_testnet/" + process.env.ANKR_API_KEY;

const SEPOLIA_RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    electroneumTestnet: {
      url: ELECTRONEUM_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5201420,
    },
    electroneum: {
      url: ELECTRONEUM_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 52014,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      electroneumTestnet: "empty",
      electroneum: "empty",
      sepolia: "empty",
    },
    customChains: [
      {
        network: "electroneum",
        chainId: 52014,
        urls: {
          apiURL: "https://blockexplorer.electroneum.com/api", // Replace with actual API URL
          browserURL: "https://blockexplorer.electroneum.com", // Replace with actual explorer URL
        },
      },
      {
        network: "electroneumTestnet",
        chainId: 5201420,
        urls: {
          apiURL: "https://blockexplorer.thesecurityteam.rocks/api", // Replace with actual API URL
          browserURL: "https://blockexplorer.thesecurityteam.rocks", // Replace with actual explorer URL
        },
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://eth-sepolia.blockscout.com/api", // Replace with actual API URL
          browserURL: "https://eth-sepolia.blockscout.com/", // Replace with actual explorer URL
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
