// lib/store/userProfileSlice.ts
import { StateCreator } from "zustand";
import { toast } from "sonner";

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
  fetchUserProfile: (walletAddress: string) => Promise<boolean>;
  refreshUserProfile: (walletAddress: string) => Promise<void>;
  updateUserProfile: (
    data: Partial<UserProfile>,
    walletAddress: string
  ) => Promise<boolean>;
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
> = (set, get) => ({
  ...initialUserProfileState,

  setUserProfile: (profile) => set({ userProfile: profile }),
  setIsProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

  fetchUserProfile: async (walletAddress) => {
    try {
      set({ isProfileLoading: true });
      const response = await fetch(`/api/users?wallet=${walletAddress}`);

      if (response.ok) {
        const data = await response.json();
        if (data) {
          set({ userProfile: data });
          return true;
        } else {
          set({ userProfile: null });
          return false;
        }
      } else {
        set({ userProfile: null });
        return false;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({ userProfile: null });
      return false;
    } finally {
      set({ isProfileLoading: false });
    }
  },

  refreshUserProfile: async (walletAddress) => {
    if (walletAddress) {
      await get().fetchUserProfile(walletAddress);
    }
  },

  updateUserProfile: async (data, walletAddress) => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      set({ isProfileLoading: true });
      const userProfile = get().userProfile;

      const response = await fetch("/api/users", {
        method: userProfile ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          eth_wallet_address: walletAddress,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        set({ userProfile: updatedProfile });
        toast.success(
          userProfile
            ? "Profile updated successfully"
            : "Profile created successfully"
        );
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
        return false;
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("An error occurred while updating your profile");
      return false;
    } finally {
      set({ isProfileLoading: false });
    }
  },
});
