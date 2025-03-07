import { Hex, encodeFunctionData } from "viem";
import { etnPatronAbi } from "./abi";
import { deployments } from "./constants";
import { sepolia } from "viem/chains";

// Convert functions to return raw transaction data

export function getRawRegisterCreator(): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "registerCreator",
    args: [],
  });
}

export function getRawUpdatePlatformFee(newFeePercentage: bigint): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "updatePlatformFee",
    args: [newFeePercentage],
  });
}

export function getRawWithdraw(): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "withdraw",
  });
}

export function getRawSubscribe(creatorAddress: Hex): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "subscribe",
    args: [creatorAddress],
  });
}

export function getRawTipCreator(contentId: bigint): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "tipCreator",
    args: [contentId],
  });
}

export function getRawPurchaseContent(contentId: bigint): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "purchaseContent",
    args: [contentId],
  });
}

export function getRawPublishContent(
  content: string,
  price: bigint,
  isPremium: boolean
): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName: "publishContent",
    args: [content, price, isPremium],
  });
}

// For completeness, also include a helper function to create a full transaction object
export function createRawTransaction(
  functionData: string,
  chainId: number = sepolia.id,
  value: bigint = BigInt(0)
): {
  to: Hex;
  data: string;
  value: string;
} {
  const contractAddress = deployments[chainId] || deployments[sepolia.id];

  return {
    to: contractAddress,
    data: functionData,
    value: value.toString(),
  };
}

// Generic function for any contract call
export function getRawTransactionData(
  functionName: string,
  args: any[]
): string {
  return encodeFunctionData({
    abi: etnPatronAbi,
    functionName,
    args,
  });
}
