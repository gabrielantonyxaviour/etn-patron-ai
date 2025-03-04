import { StateCreator } from "zustand";

interface GlobalState {
  count: number;
}

interface GlobalActions {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  count: 0,
};

export const createGlobalSlice: StateCreator<
  GlobalSlice,
  [],
  [],
  GlobalSlice
> = (set) => ({
  ...initialGlobalState,
  increment: () => set((state) => ({ count: (state.count || 0) + 1 })),
  decrement: () => set((state) => ({ count: (state.count || 0) - 1 })),
  reset: () => set(initialGlobalState),
});
