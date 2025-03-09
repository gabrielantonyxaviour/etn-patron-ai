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

export function uintToUuid(uint: number | bigint): string {
  // Ensure we're working with a BigInt
  const bigInt = BigInt(uint);

  // Convert to hex and pad to 32 characters (128 bits)
  const hex = bigInt.toString(16).padStart(32, '0');

  // Format as UUID (8-4-4-4-12)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}


export function uuidToUint(uuid: string): bigint {
  // Remove hyphens and ensure lowercase
  const hex = uuid.replace(/-/g, '').toLowerCase();

  // Validate the hex string
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error('Invalid UUID format');
  }

  // Convert hex to BigInt
  return BigInt(`0x${hex}`);
}
