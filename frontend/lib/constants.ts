import { Hex } from "viem";
import { electroneum, sepolia } from "viem/chains";

const deployments: Record<number, Hex> = {
  [sepolia.id]: "0x9387322F5342e36615Aae2e6E85FdE695d0D4dfc",
  [electroneum.id]: "0x",
};

export { deployments };
