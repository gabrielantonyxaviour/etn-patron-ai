import { PublicClient, WalletClient } from "viem";
import { StateCreator } from "zustand";

interface GlobalState {
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
}

interface GlobalActions {
  setWalletClient: (w: WalletClient) => void;
  setPublicClient: (p: PublicClient) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  walletClient: null,
  publicClient: null,
};

export const createGlobalSlice: StateCreator<
  GlobalSlice,
  [],
  [],
  GlobalSlice
> = (set) => ({
  ...initialGlobalState,
  setPublicClient: () => set((state) => ({ publicClient: state.publicClient })),
  setWalletClient: () => set((state) => ({ walletClient: state.walletClient })),
});
