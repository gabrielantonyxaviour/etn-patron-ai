import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();

const connectToLit = async () => {
  try {
    // More information about the available Lit Networks: https://developer.litprotocol.com/category/networks
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });

    await litNodeClient.connect();
    console.log("Connected to Lit Network");
    return litNodeClient;
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};

async function main() {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });

  await litNodeClient.connect();
  console.log("Connected to Lit Network");

  const ethersWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || "", // Replace with your private key
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: ethersWallet.address, // <--- The address of the wallet that can decrypt the data
      },
    },
  ];
}
