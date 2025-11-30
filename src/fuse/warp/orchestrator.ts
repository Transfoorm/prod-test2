/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Background Preload Orchestrator                       │
│  /src/fuse/warp/orchestrator.ts                                       │
│                                                                        │
│  Client-side orchestration for background data preloading              │
│  - Triggers fetch when user lands on dashboard after login             │
│  - TTL revalidation (5 min) on focus/online events                     │
│  - Non-blocking (runs in requestIdleCallback)                          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

// TTL tracker (5 minutes)
let lastAdminFetchAt = 0;
const FIVE_MIN = 5 * 60 * 1000;

export type Rank = 'admiral' | 'commodore' | 'captain' | 'crew';

export interface AdminBundle {
  users: Record<string, unknown>[];
  deletionLogs: Record<string, unknown>[];
}

/**
 * Start background WARP preload
 * Runs once per session after user rank is detected
 * Non-blocking, uses requestIdleCallback for optimal performance
 * Skips if data is fresh (loaded within 5 minutes)
 */
export function startBackgroundWARP(
  rank: Rank | undefined,
  hydrateAdmin: (bundle: AdminBundle, source?: 'SSR' | 'WARP' | 'MUTATION') => void,
  getAdminState: () => AdminBundle & { status?: string; lastFetchedAt?: number; source?: string }
) {
  if (rank?.toLowerCase() !== 'admiral') return;

  const run = async () => {
    try {
      // Check if data is fresh (within 5 minutes)
      const admin = getAdminState();
      const fresh = admin.status === 'hydrated' && admin.lastFetchedAt && Date.now() - admin.lastFetchedAt < FIVE_MIN;

      if (fresh) {
        console.log(`🔄 WARP: Skipping admin preload (fresh via ${admin.source})`);
        return;
      }

      console.log('🚀 TRUE WARP: Starting background preload for Admiral');

      // eslint-disable-next-line no-restricted-globals
      const res = await fetch('/api/warp/admin', {
        credentials: 'same-origin'
      });

      if (!res.ok) {
        console.warn('⚠️ WARP: API returned', res.status);
        return;
      }

      const bundle = await res.json();
      hydrateAdmin(bundle, 'WARP');
      lastAdminFetchAt = Date.now();

      console.log('✅ TRUE WARP: Admin data preloaded', {
        users: bundle.users?.length || 0,
        deletionLogs: bundle.deletionLogs?.length || 0,
      });
    } catch (error) {
      console.error('❌ WARP: Preload failed:', error);
    }
  };

  // Run when browser is idle to avoid jank
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 0);
  }
}

/**
 * Attach TTL revalidation listeners
 * Refreshes data on window focus/online if older than 5 minutes
 * Returns cleanup function
 */
export function attachTTLRevalidation(
  rank: Rank | undefined,
  hydrateAdmin: (bundle: AdminBundle, source?: 'SSR' | 'WARP' | 'MUTATION') => void
) {
  async function maybeRevalidate() {
    if (rank?.toLowerCase() !== 'admiral') return;

    const now = Date.now();
    if (now - lastAdminFetchAt < FIVE_MIN) return;

    try {
      console.log('🔄 WARP: TTL expired, revalidating...');

      // eslint-disable-next-line no-restricted-globals
      const res = await fetch('/api/warp/admin', {
        credentials: 'same-origin'
      });

      if (!res.ok) return;

      const bundle = await res.json();
      hydrateAdmin(bundle, 'WARP');
      lastAdminFetchAt = Date.now();

      console.log('✅ WARP: Data revalidated');
    } catch (error) {
      console.warn('⚠️ WARP: Revalidation failed:', error);
    }
  }

  window.addEventListener('focus', maybeRevalidate);
  window.addEventListener('online', maybeRevalidate);

  // Return cleanup function
  return () => {
    window.removeEventListener('focus', maybeRevalidate);
    window.removeEventListener('online', maybeRevalidate);
  };
}

/**
 * Reset WARP TTL on sign-out
 * Ensures fresh fetch on next login
 */
export function resetWarpTTL() {
  lastAdminFetchAt = 0;
}
