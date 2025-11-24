/**──────────────────────────────────────────────────────────────────────┐
│  ⚙️ SETTINGS PROVIDER - Domain Provider Pattern                       │
│  /src/providers/SettingsProvider.tsx                                   │
│                                                                        │
│  Part of the Great Provider Ecosystem                                  │
│  Hydrates settings domain slice with WARP-preloaded data               │
│  Following proven _T2 pattern                                          │
│                                                                        │
│  Fallback: Loads client-side via Convex when SSR preload disabled     │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { ReactNode, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { SettingsSlice } from '@/store/types';

interface SettingsProviderProps {
  children: ReactNode;
  initialData?: Partial<SettingsSlice>;
}

/**
 * SettingsProvider - Hydrates settings domain with WARP-preloaded data
 *
 * Architecture:
 * - Receives initialData from section layout's WARP preload function
 * - Hydrates FUSE store settings slice on mount
 * - Fallback: If no SSR data, loads client-side via Convex live query
 * - Zero UI - pure state hydration
 * - Children render with instant data access
 */
export function SettingsProvider({ children, initialData }: SettingsProviderProps) {
  const hydrateSettings = useFuse((state) => state.hydrateSettings);

  // CLIENT-SIDE FALLBACK: Load settings via Convex when SSR disabled
  const settingsData = useQuery(api.domains.settings.api.getUserSettings);

  useEffect(() => {
    // SSR hydration (if WARP preload provided data)
    if (initialData?.userProfile) {
      console.log('⚙️ SettingsProvider: Hydrating from SSR data');
      hydrateSettings(initialData);
    }
    // CLIENT-SIDE FALLBACK: Hydrate when Convex query loads
    else if (settingsData) {
      console.log('⚙️ SettingsProvider: Hydrating from Convex live query');
      hydrateSettings({
        userProfile: settingsData.userProfile,
        preferences: settingsData.preferences || [],
        notifications: settingsData.notifications || [],
      });
    }

  }, [settingsData, hydrateSettings, initialData]); // Re-run when query data arrives

  // Zero UI - just wrap children
  // All domain data now available via useFuse() hooks
  return <>{children}</>;
}
