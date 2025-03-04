import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import { decryptToString, encryptString } from "@lit-protocol/encryption";
import {
  createSiweMessage,
  generateAuthSig,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();

const connectToLit = async () => {
  try {
    // More information about the available Lit Networks: https://developer.litprotocol.com/category/networks
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: true,
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
  const evmContractConditions = [
    {
      contractAddress: "0x9387322F5342e36615Aae2e6E85FdE695d0D4dfc",
      chain: "sepolia",
      functionName: "canDecryptContent",
      functionParams: [":userAddress", "1"],
      functionAbi: {
        stateMutability: "view",
        type: "function",
        outputs: [
          {
            type: "bool",
            name: "",
          },
        ],
        name: "canDecryptContent",
        inputs: [
          {
            type: "address",
            name: "caller",
          },
          {
            type: "uint256",
            name: "contentId",
          },
        ],
      },
      returnValueTest: {
        key: "",
        comparator: "=",
        value: "true",
      },
    },
  ];

  const dataToEncrypt = "The answer to the universe is 42.";

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      evmContractConditions,
      dataToEncrypt,
    },
    litNodeClient
  );

  console.log("Ciphertext:", ciphertext);
  console.log("Data to encrypt hash:", dataToEncryptHash);

  console.log("Generating session sigs");

  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: "sepolia",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    resourceAbilityRequests: [
      {
        resource: new LitAccessControlConditionResource(
          await LitAccessControlConditionResource.generateResourceString(
            evmContractConditions,
            dataToEncryptHash
          )
        ),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }) => {
      const toSign = await createSiweMessage({
        uri,
        expiration,
        resources: resourceAbilityRequests,
        walletAddress: ethersWallet.address,
        nonce: await litNodeClient.getLatestBlockhash(),
        litNodeClient,
      });

      return await generateAuthSig({
        signer: ethersWallet,
        toSign,
      });
    },
  });

  const decryptionResult = await decryptToString(
    {
      chain: "sepolia",
      ciphertext,
      dataToEncryptHash,
      evmContractConditions,
      sessionSigs,
    },
    litNodeClient
  );

  console.log(decryptionResult);
}

main();
