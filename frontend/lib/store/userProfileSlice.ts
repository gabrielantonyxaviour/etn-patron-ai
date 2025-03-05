import { StateCreator } from "zustand";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  eth_wallet_address: string;
  is_creator: boolean;
  last_login: string;
  created_at: string;
}

interface UserProfileState {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  isProfileModalOpen: boolean;
}

interface UserProfileActions {
  setUserProfile: (profile: UserProfile | null) => void;
  setIsProfileLoading: (loading: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
}

export type UserProfileSlice = UserProfileState & UserProfileActions;

export const initialUserProfileState: UserProfileState = {
  userProfile: null,
  isProfileLoading: false,
  isProfileModalOpen: false,
};

export const createUserProfileSlice: StateCreator<
  UserProfileSlice,
  [],
  [],
  UserProfileSlice
> = (set) => ({
  ...initialUserProfileState,
  setUserProfile: (profile) => set({ userProfile: profile }),
  setIsProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
});
