// components/wallet-profile-check.tsx
"use client";

import { useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ProfileCreationModal } from "./create-profile-modal";
import { useEnvironmentStore } from "./context";

export function WalletProfileCheck() {
  const { primaryWallet } = useDynamicContext();
  const { fetchUserProfile, isProfileModalOpen, setIsProfileModalOpen } =
    useEnvironmentStore((state) => ({
      fetchUserProfile: state.fetchUserProfile,
      isProfileModalOpen: state.isProfileModalOpen,
      setIsProfileModalOpen: state.setIsProfileModalOpen,
    }));

  // Check for user profile when wallet connects
  useEffect(() => {
    if (!primaryWallet?.address) return;

    const checkUserProfile = async () => {
      const hasProfile = await fetchUserProfile(primaryWallet.address);
      if (!hasProfile) {
        setIsProfileModalOpen(true);
      }
    };

    checkUserProfile();
  }, [primaryWallet?.address, fetchUserProfile, setIsProfileModalOpen]);

  return <ProfileCreationModal />;
}
