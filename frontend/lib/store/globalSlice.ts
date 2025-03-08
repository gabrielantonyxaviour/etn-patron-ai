import { PublicClient, WalletClient } from "viem";
import { StateCreator } from "zustand";

interface GlobalState {
}

interface GlobalActions {
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
});
