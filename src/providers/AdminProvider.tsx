/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ ADMIN PROVIDER - Domain Provider Pattern                         │
│  /src/providers/AdminProvider.tsx                                      │
│                                                                        │
│  Part of the Great Provider Ecosystem                                  │
│  Hydrates admin domain slice with WARP-preloaded data                  │
│  Following proven _T2 pattern                                          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { ReactNode, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import type { AdminSlice } from '@/store/types';

interface AdminProviderProps {
  children: ReactNode;
  initialData?: Partial<AdminSlice>;
}

/**
 * AdminProvider - Hydrates admin domain with WARP-preloaded data
 *
 * Architecture:
 * - Receives initialData from domain layout's WARP preload function
 * - Hydrates FUSE store admin slice on mount
 * - Zero UI - pure state hydration
 * - Children render with instant data access
 */
export function AdminProvider({ children, initialData }: AdminProviderProps) {
  const hydrateAdmin = useFuse((state) => state.hydrateAdmin);

  useEffect(() => {
    // SSR hydration (legacy - mostly unused now, TRUE WARP handles it)
    if (initialData && (initialData.users?.length || initialData.deletionLogs?.length)) {
      console.log('🛡️ AdminProvider: Hydrating admin domain from SSR');
      hydrateAdmin(initialData, 'SSR');
    } else {
      console.log('🛡️ AdminProvider: No SSR data - relying on TRUE WARP');
    }
  }, [hydrateAdmin, initialData]); // Only run on mount - initialData comes from server preload

  // Zero UI - just wrap children
  // All domain data now available via useFuse() hooks
  return <>{children}</>;
}
