/**──────────────────────────────────────────────────────────────────────┐
│  🔮 PRISM - Predictive Reactions and Intelligent Store Management    │
│  /src/fuse/hooks/usePrism.ts                                          │
│                                                                        │
│  Frontend intent detection that triggers WARP preloading.             │
│  Strategy 1: Load entire domain on dropdown open.                     │
│                                                                        │
│  Usage in Sidebar:                                                    │
│  const prism = usePrism();                                            │
│  onClick={() => { toggleSection('productivity'); prism.preloadDomain('productivity'); }}
│                                                                        │
│  ADP Compliant: Coordinates with WARP routes and FUSE store.          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useCallback, useRef } from 'react';
import { useFuse } from '@/store/fuse';

// Domain to WARP route mapping
const DOMAIN_ROUTES: Record<string, string> = {
  productivity: '/api/warp/productivity',
  admin: '/api/warp/admin',
  // Add more domains as WARP routes are created
  // clients: '/api/warp/clients',
  // finance: '/api/warp/finance',
  // projects: '/api/warp/projects',
};

// Domain to FUSE hydration function mapping
type DomainKey = 'productivity' | 'admin';

export function usePrism() {
  // Track in-flight requests to prevent duplicate calls
  const inFlightRef = useRef<Set<string>>(new Set());

  // Get hydration functions from FUSE store
  const hydrateProductivity = useFuse((s) => s.hydrateProductivity);
  const hydrateAdmin = useFuse((s) => s.hydrateAdmin);

  // TTTS-1 compliant: status === 'hydrated' means data is ready (ONE source of truth)
  const productivityStatus = useFuse((s) => s.productivity.status);
  const adminStatus = useFuse((s) => s.admin.status);

  const preloadDomain = useCallback(async (domain: DomainKey) => {
    // Skip if already hydrated (TTTS-1: status === 'hydrated')
    if (domain === 'productivity' && productivityStatus === 'hydrated') {
      console.log(`🔮 PRISM: ${domain} already hydrated, skipping`);
      return;
    }
    if (domain === 'admin' && adminStatus === 'hydrated') {
      console.log(`🔮 PRISM: ${domain} already hydrated, skipping`);
      return;
    }

    // Skip if request already in flight
    if (inFlightRef.current.has(domain)) {
      console.log(`🔮 PRISM: ${domain} request already in flight`);
      return;
    }

    const route = DOMAIN_ROUTES[domain];
    if (!route) {
      console.warn(`🔮 PRISM: No WARP route for domain "${domain}"`);
      return;
    }

    // Mark as in-flight
    inFlightRef.current.add(domain);
    console.log(`🔮 PRISM: Preloading ${domain} domain...`);

    try {
      const start = performance.now();
      // eslint-disable-next-line no-restricted-globals
      const response = await fetch(route);

      if (!response.ok) {
        throw new Error(`WARP failed: ${response.status}`);
      }

      const data = await response.json();
      const duration = performance.now() - start;

      // Hydrate the appropriate slice
      if (domain === 'productivity') {
        hydrateProductivity(data, 'WARP');
      } else if (domain === 'admin') {
        hydrateAdmin(data, 'WARP');
      }

      console.log(`🔮 PRISM: ${domain} loaded in ${duration.toFixed(2)}ms`, data);
    } catch (error) {
      console.error(`🔮 PRISM: Failed to preload ${domain}:`, error);
    } finally {
      // Remove from in-flight
      inFlightRef.current.delete(domain);
    }
  }, [hydrateProductivity, hydrateAdmin, productivityStatus, adminStatus]);

  return { preloadDomain };
}
