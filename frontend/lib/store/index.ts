// lib/store/index.ts
import { createStore } from "zustand";
import { createGlobalSlice, GlobalSlice } from "./globalSlice";
import { createUserProfileSlice, UserProfileSlice } from "./userProfileSlice";

export type EnvironmentStore = GlobalSlice & UserProfileSlice;

export const createEnvironmentStore = () =>
  createStore<EnvironmentStore>()((...a) => ({
    ...createGlobalSlice(...a),
    ...createUserProfileSlice(...a),
  }));
