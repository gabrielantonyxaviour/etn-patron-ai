import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { encryptString } from "@lit-protocol/encryption";
import { deployments, verifyDeployment } from "../constants";
import { electroneum, sepolia } from "viem/chains";

export async function encrypt(dataToEncrypt: string): Promise<{
  ciphertext: string;
  dataToEncryptHash: string;
}> {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });

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

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      evmContractConditions: evmContractConditions as any,
      dataToEncrypt,
    },
    litNodeClient
  );

  console.log("Ciphertext:", ciphertext);
  console.log("Data to encrypt hash:", dataToEncryptHash);
  return { ciphertext, dataToEncryptHash };
}
