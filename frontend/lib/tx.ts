import { Hex, PublicClient, WalletClient } from "viem";
import { etnPatronAbi } from "./abi";
import { deployments } from "./constants";
import { sepolia } from "viem/chains";

// Read Functions

export async function canDecryptContent(
  publicClient: PublicClient,
  address: Hex,
  contentId: bigint
): Promise<{ canDecrypt: boolean; error: string }> {
  try {
    const data = await publicClient.readContract({
      address: deployments[publicClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "canDecryptContent",
      args: [address, contentId],
    });

    return { canDecrypt: data as boolean, error: "" };
  } catch (e) {
    return {
      canDecrypt: false,
      error: JSON.stringify(e),
    };
  }
}

// Write Functions

export async function updatePlatformFee(
  publicClient: PublicClient,
  walletClient: WalletClient,
  newFeePercentage: bigint
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "updatePlatformFee",
      args: [newFeePercentage],
      account: walletClient.account,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}

export async function withdraw(
  publicClient: PublicClient,
  walletClient: WalletClient
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "withdraw",
      account: walletClient.account,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}

export async function subscribe(
  publicClient: PublicClient,
  walletClient: WalletClient,
  creatorAddress: Hex,
  amount: bigint
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "subscribe",
      args: [creatorAddress],
      account: walletClient.account,
      value: amount,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}

export async function tipCreator(
  publicClient: PublicClient,
  walletClient: WalletClient,
  contentId: bigint,
  amount: bigint
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "tipCreator",
      args: [contentId],
      account: walletClient.account,
      value: amount,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}

export async function purchaseContent(
  publicClient: PublicClient,
  walletClient: WalletClient,
  contentId: bigint,
  amount: bigint
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "purchaseContent",
      args: [contentId],
      account: walletClient.account,
      value: amount,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}

export async function publishContent(
  publicClient: PublicClient,
  walletClient: WalletClient,
  content: string,
  price: bigint,
  isPremium: boolean
): Promise<{ hash: string; error: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      address: deployments[walletClient.chain?.id || sepolia.id],
      abi: etnPatronAbi,
      functionName: "publishContent",
      args: [content, price, isPremium],
      account: walletClient.account,
    });

    const hash = await walletClient.sendTransaction({
      ...request,
      to: request.address,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return { hash, error: "" };
  } catch (e) {
    return {
      hash: "",
      error: JSON.stringify(e),
    };
  }
}
