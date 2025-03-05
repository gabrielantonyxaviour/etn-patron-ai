"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ProfileCreationModal } from "./create-profile-modal";
import { useEnvironmentStore } from "./context";
import { toast } from "sonner";

export function WalletProfileCheck() {
  const { primaryWallet, user } = useDynamicContext();
  const {
    setUserProfile,
    setIsProfileLoading,
    isProfileModalOpen,
    setIsProfileModalOpen,
    userProfile,
  } = useEnvironmentStore((store) => store);

  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Only run once per wallet address
  useEffect(() => {
    if (!primaryWallet?.address || hasCheckedProfile) return;

    const checkUserProfile = async () => {
      if (userProfile?.eth_wallet_address === primaryWallet.address) {
        return; // Already have profile for this wallet
      }

      try {
        setIsProfileLoading(true);
        const response = await fetch(
          `/api/users?wallet=${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setUserProfile(data);
          } else {
            setUserProfile(null);
            setIsProfileModalOpen(true);
          }
        } else {
          setUserProfile(null);
          setIsProfileModalOpen(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      } finally {
        setIsProfileLoading(false);
        setHasCheckedProfile(true);
      }
    };

    if (user && primaryWallet?.address) {
      checkUserProfile();
    }
  }, [primaryWallet?.address, user]);

  // Reset check state when wallet changes
  useEffect(() => {
    setHasCheckedProfile(false);
  }, [primaryWallet?.address]);

  // Don't render anything if not authenticated
  if (!user || !primaryWallet?.address) {
    return null;
  }

  return <ProfileCreationModal />;
}
