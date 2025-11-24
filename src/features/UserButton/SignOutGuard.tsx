/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ SignOut Guard - Backup Security Clear                             │
│  /src/components/features/UserButton/SignOutGuard.tsx                  │
│                                                                        │
│  BACKUP CLEANUP: Listens for Clerk sign-out events as safety net      │
│  Primary cleanup happens in UserButton handleSignOut (FUSE Doctrine)   │
│  Security: Prevents cached data leaking to next user                   │
│  Also resets WARP TTL tracker                                          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useFuse } from '@/store/fuse';
import { resetWarpTTL } from '@/fuse/warp/orchestrator';

export function SignOutGuard() {
  const { addListener } = useClerk();

  // Get all clear methods from FUSE store
  const clearAdmin = useFuse((state) => state.clearAdmin);
  const clearUser = useFuse((state) => state.clearUser);
  const setAISidebarState = useFuse((state) => state.setAISidebarState);
  const setModalSkipped = useFuse((state) => state.setModalSkipped);

  useEffect(() => {
    // Listen for Clerk sign-out events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsub = addListener((event: any) => {
      if (event.type === 'signedOut' || event.type === 'sessionEnded') {
        console.log('🛡️ SignOutGuard: Clearing all cached data (backup cleanup)');

        // Clear all domain slices
        clearAdmin?.();
        // TODO: Add other domain clears when implemented:
        // clearFinances?.();
        // clearClients?.();
        // clearWork?.();
        // clearProjects?.();
        // clearSettings?.();

        // Clear user session
        clearUser?.();

        // Reset AI sidebar to closed
        setAISidebarState?.('closed');

        // Reset setup modal state - user must go through onboarding again
        setModalSkipped?.(false);

        // Reset WARP TTL tracker
        resetWarpTTL();

        console.log('✅ SignOutGuard: Backup cleanup complete');
      }
    });

    return () => unsub();
  }, [addListener, clearAdmin, clearUser, setAISidebarState, setModalSkipped]);

  return null; // Zero UI
}
