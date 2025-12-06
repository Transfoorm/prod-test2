'use client';

/**──────────────────────────────────────────────────────────────────────────┐
 │  👑 SHADOW KING - Sovereign Setup Enforcement                            │
 │  /src/features/UserSetup/ShadowKing/index.tsx                            │
 │                                                                          │
 │  The Shadow King is a sovereign global modal, permanently mounted at     │
 │  the FuseApp shell level. It only activates when user intentionally      │
 │  enters identity territory (Account, Profile links).                     │
 │                                                                          │
 │  Rules:                                                                  │
 │  - Dormant by default (shadowKingActive = false)                         │
 │  - Awakens when user clicks identity-related actions                     │
 │  - Blocks entire app with backdrop until setup completes                 │
 │  - No "Skip for now" - user must complete to proceed                     │
 └────────────────────────────────────────────────────────────────────────────*/

import { useFuse } from '@/store/fuse';
import { completeSetupAction } from '@/app/actions/user-mutations';
import SetupModal from '@/features/UserSetup/SetupModal';
import { Backdrop } from '@/prebuilts';

export default function ShadowKing() {
  const shadowKingActive = useFuse((s) => s.shadowKingActive);
  const setShadowKingActive = useFuse((s) => s.setShadowKingActive);
  const setModalSkipped = useFuse((s) => s.setModalSkipped);
  const user = useFuse((s) => s.user);
  const updateUser = useFuse((s) => s.updateUser);

  // Only show if Shadow King is active AND setup is actually pending
  const shouldShow = shadowKingActive && user?.setupStatus === 'pending';

  if (!shouldShow) return null;

  const handleSetupComplete = async (data: {
    firstName: string;
    lastName: string;
    entityName: string;
    socialName: string;
    orgSlug: string;
    businessCountry: string;
  }) => {
    try {
      // Update FUSE store optimistically
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        businessCountry: data.businessCountry,
        setupStatus: 'complete',
        emailVerified: true,
      });

      // Call server action to persist to database and update session cookie
      const result = await completeSetupAction({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        orgSlug: data.orgSlug,
        businessCountry: data.businessCountry,
        emailVerified: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      // Update store with fresh data from server
      if (result.user) {
        updateUser({
          emailVerified: result.user.emailVerified,
          setupStatus: result.user.setupStatus as 'pending' | 'complete',
          firstName: result.user.firstName || undefined,
          lastName: result.user.lastName || undefined,
          entityName: result.user.entityName || undefined,
          socialName: result.user.socialName || undefined,
          businessCountry: result.user.businessCountry || undefined,
        });
      }

      // Deactivate Shadow King - setup is complete
      setShadowKingActive(false);

      console.log('👑 Shadow King: Setup completed, returning to app');
    } catch (error) {
      console.error('Shadow King: Setup failed:', error);
      // Revert optimistic update
      updateUser({ setupStatus: 'pending' });
      throw error;
    }
  };

  // Skip closes Shadow King AND sets modalSkipped so Dashboard modal won't show
  const handleSkip = () => {
    setShadowKingActive(false);
    setModalSkipped(true);  // Sync with Dashboard modal skip state
  };

  const handleBackdropClick = () => {
    // Outside click = same as skip
    setShadowKingActive(false);
    setModalSkipped(true);  // Sync with Dashboard modal skip state
  };

  return (
    <>
      <Backdrop onClick={handleBackdropClick} />
      <div className="ft-shadow-king">
        <SetupModal
          onComplete={handleSetupComplete}
          onSkip={handleSkip}
        />
      </div>
    </>
  );
}
