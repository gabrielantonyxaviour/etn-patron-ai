import { Hex } from "viem";
import { electroneum, sepolia } from "viem/chains";

const deployments: Record<number, Hex> = {
  [sepolia.id]: "0x5c81e6A136A19EDD6e3cfD25f4FA21b265B1d394",
  [electroneum.id]: "0x2ba4d9E4a588987EbafE9d864C498Cd109D901E7",
};

const verifyDeployment: string = "0x7625666d8897B00248572cFC0E17429b53Be5685"


export { deployments, verifyDeployment };
