import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(wei: bigint | string | undefined): string {
  if (!wei) return "0";
  const value = typeof wei === "string" ? BigInt(wei) : wei;
  return (Number(value) / 1e18).toFixed(6);
}
