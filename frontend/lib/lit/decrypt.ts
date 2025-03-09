import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY, LIT_RPC } from "@lit-protocol/constants";
import { decryptToString } from "@lit-protocol/encryption";
import {
  createSiweMessage,
  generateAuthSig,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { ethers, providers } from "ethers";
import { verifyDeployment } from "../constants";

export async function decrypt(
  // signer: providers.JsonRpcSigner,
  ciphertext: string,
  dataHash: string
): Promise<{
  decryptedData: string;
  error: string;
}> {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });

  const ethersWallet = new ethers.Wallet(
    process.env.NEXT_PUBLIC_PRIVATE_KEY || "", // Replace with your private key
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  await litNodeClient.connect();
  console.log("Connected to Lit Network");

  const evmContractConditions = [
    {
      contractAddress: verifyDeployment,
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

  console.log("Generating session sigs");

  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: "sepolia",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    resourceAbilityRequests: [
      {
        resource: new LitAccessControlConditionResource(
          await LitAccessControlConditionResource.generateResourceString(
            evmContractConditions as any,
            dataHash
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

  try {
    const decryptionResult = await decryptToString(
      {
        chain: "sepolia",
        ciphertext,
        dataToEncryptHash: dataHash,
        evmContractConditions: evmContractConditions as any,
        sessionSigs,
      },
      litNodeClient
    );

    console.log(decryptionResult);

    return {
      decryptedData: decryptionResult,
      error: "",
    };
  } catch (e: any) {
    return {
      decryptedData: "",
      error: e,
    };
  }
}
