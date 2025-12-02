/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Background Preload Orchestrator                       │
│  /src/fuse/warp/orchestrator.ts                                       │
│                                                                        │
│  FUSE 6.0: Preload ALL domain data on mount via requestIdleCallback   │
│  - Rank-aware: Admiral gets admin, all ranks get their domains        │
│  - TTL revalidation (5 min) on focus/online events                    │
│  - Non-blocking: runs during browser idle time                        │
│  - Sequential to avoid network congestion                             │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export type Rank = 'admiral' | 'commodore' | 'captain' | 'crew';

type ADPSource = 'SSR' | 'WARP' | 'MUTATION';

// ═══════════════════════════════════════════════════════════════════════
// TTL TRACKING
// ═══════════════════════════════════════════════════════════════════════

const FIVE_MIN = 5 * 60 * 1000;

// Per-domain TTL tracking
const lastFetchAt: Record<string, number> = {
  admin: 0,
  clients: 0,
  finance: 0,
  productivity: 0,
  projects: 0,
};

// ═══════════════════════════════════════════════════════════════════════
// CORE WARP FUNCTION - Preload all domains based on rank
// ═══════════════════════════════════════════════════════════════════════

/**
 * Run WARP preload for all domains
 * Called once on FuseApp mount via requestIdleCallback
 * Non-blocking, sequential to avoid network congestion
 */
export async function runWarpPreload() {
  const state = useFuse.getState();
  const rank = state.rank?.toLowerCase() as Rank | undefined;

  if (!rank) {
    console.log('🔱 WARP-O: No rank detected, skipping preload');
    return;
  }

  console.log(`🔱 WARP-O: Starting preload for rank="${rank}"`);
  const startTime = performance.now();

  // Preload based on rank
  // All ranks get: clients, finance, productivity, projects
  // Admiral also gets: admin

  try {
    // 1. Clients (all ranks)
    await preloadDomain('clients', state.hydrateClients);

    // 2. Finance (captain+)
    if (['captain', 'commodore', 'admiral'].includes(rank)) {
      await preloadDomain('finance', state.hydrateFinance);
    }

    // 3. Productivity (all ranks)
    await preloadDomain('productivity', state.hydrateProductivity);

    // 4. Projects (captain+)
    if (['captain', 'commodore', 'admiral'].includes(rank)) {
      await preloadDomain('projects', state.hydrateProjects);
    }

    // 5. Admin (admiral only)
    if (rank === 'admiral') {
      await preloadDomain('admin', state.hydrateAdmin);
    }

    const duration = Math.round(performance.now() - startTime);
    console.log(`✅ WARP-O: Preload complete in ${duration}ms`);
  } catch (error) {
    console.error('❌ WARP-O: Preload failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DOMAIN PRELOAD HELPER
// ═══════════════════════════════════════════════════════════════════════

type HydrateFn = (data: Record<string, unknown>, source?: ADPSource) => void;

async function preloadDomain(
  domain: string,
  hydrateFn: HydrateFn
): Promise<void> {
  // Check freshness via module-level TTL tracking
  const lastFetch = lastFetchAt[domain] || 0;
  if (Date.now() - lastFetch < FIVE_MIN) {
    console.log(`🔄 WARP-O: Skipping ${domain} (fresh, ${Math.round((Date.now() - lastFetch) / 1000)}s old)`);
    return;
  }

  try {
    console.log(`🚀 WARP-O: Preloading ${domain}...`);
    const start = performance.now();

    // eslint-disable-next-line no-restricted-globals
    const res = await fetch(`/api/warp/${domain}`, {
      credentials: 'same-origin',
    });

    if (!res.ok) {
      console.warn(`⚠️ WARP-O: ${domain} API returned ${res.status}`);
      return;
    }

    const bundle = await res.json();
    hydrateFn(bundle, 'WARP');
    lastFetchAt[domain] = Date.now();

    const duration = Math.round(performance.now() - start);
    console.log(`✅ WARP-O: ${domain} preloaded in ${duration}ms`);
  } catch (error) {
    console.warn(`⚠️ WARP-O: ${domain} preload failed:`, error);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TTL REVALIDATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Attach TTL revalidation listeners
 * Refreshes stale domains on window focus/online
 * Returns cleanup function
 */
export function attachTTLRevalidation(): () => void {
  async function maybeRevalidate() {
    const state = useFuse.getState();
    const rank = state.rank?.toLowerCase() as Rank | undefined;

    if (!rank) return;

    console.log('🔄 WARP-O: Checking TTL on focus/online...');

    // Check each domain's freshness and revalidate if stale
    const domains = ['clients', 'productivity'];

    if (['captain', 'commodore', 'admiral'].includes(rank)) {
      domains.push('finance', 'projects');
    }

    if (rank === 'admiral') {
      domains.push('admin');
    }

    for (const domain of domains) {
      const lastFetch = lastFetchAt[domain] || 0;
      if (Date.now() - lastFetch > FIVE_MIN) {
        // Get hydrate function by domain name
        const hydrateKey = `hydrate${domain.charAt(0).toUpperCase() + domain.slice(1)}` as keyof typeof state;
        const hydrateFn = state[hydrateKey] as HydrateFn | undefined;
        if (hydrateFn) {
          await preloadDomain(domain, hydrateFn);
        }
      }
    }
  }

  window.addEventListener('focus', maybeRevalidate);
  window.addEventListener('online', maybeRevalidate);

  return () => {
    window.removeEventListener('focus', maybeRevalidate);
    window.removeEventListener('online', maybeRevalidate);
  };
}

// ═══════════════════════════════════════════════════════════════════════
// RESET TTL (for sign-out)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Reset all WARP TTLs on sign-out
 * Ensures fresh fetch on next login
 */
export function resetWarpTTL(): void {
  Object.keys(lastFetchAt).forEach((key) => {
    lastFetchAt[key] = 0;
  });
  console.log('🔱 WARP-O: TTL reset');
}
