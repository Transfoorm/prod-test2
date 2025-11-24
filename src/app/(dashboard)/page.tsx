'use client';

import { useState, useEffect } from 'react';
import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useFuse } from '@/store/fuse';
import SetupModal from '@/features/UserSetup/SetupModal';
import FlyingButton from '@/features/UserSetup/FlyingButton';
import { skipFlow, reverseFlow } from '@/features/UserSetup/FlyingButton/config';
import { completeSetupAction } from '@/app/actions/user-mutations';
import { Card } from '@/prebuilts/card';
import { Grid } from '@/prebuilts/grid';

export default function DashboardPage() {
  const user = useFuse((s) => s.user);
  const updateUser = useFuse((s) => s.updateUser);
  const modalSkipped = useFuse((s) => s.modalSkipped);
  const setModalSkipped = useFuse((s) => s.setModalSkipped);
  const [isModalFadingOut, setIsModalFadingOut] = useState(false);
  const [isModalFadingIn, setIsModalFadingIn] = useState(false);

  useSetPageHeader(undefined, 'Coming soon');

  // Listen for bring modal back event
  useEffect(() => {
    const handleBringModalBack = () => {
      // Wait for modalShowDelay from config before showing modal
      setTimeout(() => {
        // Reset skip state in FUSE store and trigger modal to fade in
        setModalSkipped(false);
        setIsModalFadingIn(true);

        // After fade-in animation completes, set to normal state
        setTimeout(() => {
          setIsModalFadingIn(false);
        }, reverseFlow.modalFadeInDuration);
      }, reverseFlow.modalShowDelay);
    };

    window.addEventListener('bringModalBack', handleBringModalBack);
    return () => {
      window.removeEventListener('bringModalBack', handleBringModalBack);
    };
  }, [setModalSkipped]);

  // Show setup modal for Captain/Pending users (only if not in skip mode)
  const shouldShowSetup = user?.rank === 'captain' && user?.setupStatus === 'pending' && !modalSkipped;

  const handleSetupComplete = async (data: {
    firstName: string;
    lastName: string;
    entityName: string;
    socialName: string;
    orgSlug: string;
    businessCountry: string;
  }) => {
    try {
      // Reset skip state since setup is being completed
      setModalSkipped(false);

      // Update FUSE store optimistically
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        businessCountry: data.businessCountry,
        setupStatus: 'complete',
      });

      // Call server action to persist to database and update session cookie
      const result = await completeSetupAction({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        orgSlug: data.orgSlug,
        businessCountry: data.businessCountry,
      });

      if (!result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      console.log('✅ Setup completed successfully');
    } catch (error) {
      console.error('Setup failed:', error);
      // Revert optimistic update
      updateUser({ setupStatus: 'pending' });
      throw error; // Re-throw to let modal handle error display
    }
  };

  const handleSetupSkip = () => {
    // Set skip state in FUSE store to persist across navigation
    setModalSkipped(true);

    // Start the fade-out animation
    setIsModalFadingOut(true);

    // Wait for animation to complete, then unmount
    setTimeout(() => {
      setIsModalFadingOut(false);
    }, skipFlow.modalUnmountDelay);

    console.log('⏭️ Setup skipped by user');
  };

  return (
    <Grid.verticalBig>
      {/* Show setup modal overlay when user needs onboarding */}
      <SetupModal
        onComplete={handleSetupComplete}
        onSkip={handleSetupSkip}
        isFadingOut={isModalFadingOut}
        isFadingIn={isModalFadingIn}
        isHidden={!shouldShowSetup && !isModalFadingOut && !isModalFadingIn}
      />

      {/* Flying button for Phoenix animation */}
      <FlyingButton />

      {/* Dashboard content with smooth transitions */}
      <div className="dashboard-content-wrapper">
      <Grid.cards>
        <Card.metric
          title="Your Account"
          value={user?.email || 'No email'}
          context="Logged in"
        />
      </Grid.cards>
      </div>
    </Grid.verticalBig>
  );
}
