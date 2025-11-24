/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ GOLDEN BRIDGE HOOK - Admin Domain                                │
│  /src/hooks/useAdminData.ts                                            │
│                                                                        │
│  Clean API for accessing admin domain data                             │
│  Abstracts FUSE store complexity from components                       │
│  Following proven _T2 Golden Bridge pattern                            │
│                                                                        │
│  ARCHITECTURE:                                                         │
│  - WARP preload: Fast initial data (one-time background fetch)         │
│  - Convex live query: Real-time updates (WebSocket subscription)       │
│  - Auto-sync: Convex → FUSE store (seamless reactivity)               │
│  - Result: Instant initial load + live updates across tabs            │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFuse } from '@/store/fuse';

/**
 * Golden Bridge Hook - Admin Domain
 *
 * Provides clean, domain-specific API for components
 * Hides FUSE store structure and complexity
 * Following WRAP pattern: { data, computed, actions, flags }
 *
 * HYBRID DATA FLOW:
 * 1. Initial load: Reads from FUSE (instant - preloaded via WARP)
 * 2. Real-time: Subscribes to Convex (live updates via WebSocket)
 * 3. Auto-sync: Convex updates → FUSE store → Component re-renders
 * 4. Cross-tab sync: All tabs share same Convex subscription
 *
 * Usage:
 * ```tsx
 * const { data, computed, flags } = useAdminData();
 * const { users, deletionLogs } = data;
 * const { usersCount, deletionLogsCount } = computed;
 * const { isHydrated } = flags;
 * ```
 */
export function useAdminData() {
  const admin = useFuse((state) => state.admin);
  const isHydrated = useFuse((state) => state.isAdminHydrated);
  const hydrateAdmin = useFuse((state) => state.hydrateAdmin);

  // 🔴 LIVE QUERY: Convex WebSocket subscription for real-time updates
  const liveUsers = useQuery(api.domains.admin.users.api.getAllUsers);
  const liveDeletionLogs = useQuery(api.domains.admin.users.api.getAllDeletionLogs);

  // 🔄 AUTO-SYNC: When Convex data updates, sync to FUSE store
  // This keeps FUSE in sync with Convex for seamless reactivity
  // Components read from FUSE, Convex keeps it fresh
  useEffect(() => {
    if (liveUsers && liveDeletionLogs) {
      hydrateAdmin({
        users: liveUsers,
        deletionLogs: liveDeletionLogs
      }, 'CONVEX_LIVE');
    }
  }, [liveUsers, liveDeletionLogs, hydrateAdmin]);

  // Memoize computed object to prevent new reference on every render
  const computed = useMemo(() => ({
    usersCount: admin.users.length,
    deletionLogsCount: admin.deletionLogs.length,
    hasUsers: admin.users.length > 0,
    hasDeletionLogs: admin.deletionLogs.length > 0,
  }), [admin.users.length, admin.deletionLogs.length]);

  return {
    // DATA: Raw domain data
    data: {
      users: admin.users,
      deletionLogs: admin.deletionLogs,
    },

    // COMPUTED: Calculated values from data
    computed,

    // ACTIONS: Mutations and operations (add as needed)
    actions: {
      // Future: Add mutations here
      // deleteUser: (id) => store.deleteUser(id),
      // restoreUser: (id) => store.restoreUser(id),
    },

    // FLAGS: Hydration and state flags
    flags: {
      isHydrated,
      isLoading: false, // Always false with WARP preloading
    },
  };
}
