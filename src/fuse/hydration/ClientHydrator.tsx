/**──────────────────────────────────────────────────────────────────────┐
│  🔄 FUSE 5.0 Client Hydrator - Static Shell Optimized                 │
│  /fuse/store/ClientHydrator.tsx                                        │
│                                                                        │
│  Hydrates Zustand store from session cookie (client-side only)         │
│  + Auto-detects cookie changes via polling (500ms interval)            │
│                                                                        │
│  Flow:                                                                 │
│  1. Initial hydration from FUSE_5.0 cookie on mount                    │
│  2. Cookie polling starts (detects Server Action updates)              │
│  3. When cookie changes → auto-update store                            │
│  4. UI updates instantly without page refresh                          │
│                                                                        │
│  Performance: No server fetch = instant shell render                   │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useLayoutEffect, useRef, useCallback } from 'react';
import { useFuse } from '@/store/fuse';
import { getCookie, decodeFuseCookie } from './session/cookieClient';
// WARP is now called from FuseApp.tsx - no longer needed here

export function ClientHydrator() {
  const setUser = useFuse((state) => state.setUser);
  const hydrateThemeMode = useFuse((state) => state.hydrateThemeMode);
  const hydrateThemeName = useFuse((state) => state.hydrateThemeName);
  const hydrateDashboard = useFuse((state) => state.hydrateDashboard);
  const setAISidebarState = useFuse((state) => state.setAISidebarState);

  const hasHydrated = useRef(false);

  // 🚀 SYNCHRONOUS HYDRATION: Read cookie and hydrate store BEFORE paint
  // useLayoutEffect runs synchronously after render but before browser paint
  // This ensures store is populated BEFORE any child components see it
  useLayoutEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const cookieValue = getCookie('FUSE_5.0');
    if (!cookieValue) return;

    const decoded = decodeFuseCookie(cookieValue);
    if (!decoded) return;

    // Populate store BEFORE paint - still instant to user
    setUser({
      id: decoded._id,
      convexId: decoded._id,
      clerkId: decoded.clerkId,
      email: decoded.email || '',
      emailVerified: decoded.emailVerified,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      avatarUrl: decoded.avatarUrl,
      brandLogoUrl: decoded.brandLogoUrl,
      rank: decoded.rank as 'crew' | 'captain' | 'commodore' | 'admiral' | null | undefined,
      setupStatus: decoded.setupStatus as 'pending' | 'complete' | null | undefined,
      businessCountry: decoded.businessCountry,
      entityName: decoded.entityName,
      socialName: decoded.socialName,
      mirorAvatarProfile: decoded.mirorAvatarProfile,
      mirorEnchantmentEnabled: decoded.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: decoded.mirorEnchantmentTiming
    });

    if (decoded.themeDark !== undefined) {
      hydrateThemeMode(decoded.themeDark ? 'dark' : 'light');
    }
    if (decoded.themeName) {
      hydrateThemeName(decoded.themeName);
    }

    // 🚀 WARP: Hydrate Dashboard from cookie (baked during login)
    if (decoded.dashboardLayout || decoded.dashboardWidgets) {
      hydrateDashboard({
        layout: decoded.dashboardLayout || 'classic',
        visibleWidgets: decoded.dashboardWidgets || [],
        expandedSections: []
      }, 'COOKIE');
    }

    setAISidebarState('closed');
    console.log('⚡ FUSE: Store hydrated synchronously from cookie');
  }, [setUser, hydrateThemeMode, hydrateThemeName, hydrateDashboard, setAISidebarState]);

  // Helper function to hydrate store from decoded cookie data
  // Currently unused - reserved for future cookie polling implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hydrateFromCookie = useCallback((decoded: ReturnType<typeof decodeFuseCookie>) => {
    if (!decoded) return;

    // 🛡️ SOVEREIGNTY RESTORED: Use Convex _id as canonical identity
    const userData = {
      id: decoded._id,           // ✅ Convex _id (sovereign identity)
      convexId: decoded._id,     // Explicit alias for clarity
      clerkId: decoded.clerkId,  // Auth reference only (never use for queries)
      email: decoded.email || '',
      emailVerified: decoded.emailVerified,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      avatarUrl: decoded.avatarUrl,
      brandLogoUrl: decoded.brandLogoUrl,
      rank: decoded.rank as 'crew' | 'captain' | 'commodore' | 'admiral' | null | undefined,
      setupStatus: decoded.setupStatus as 'pending' | 'complete' | null | undefined,
      businessCountry: decoded.businessCountry,
      entityName: decoded.entityName,
      socialName: decoded.socialName,
      mirorAvatarProfile: decoded.mirorAvatarProfile,
      mirorEnchantmentEnabled: decoded.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: decoded.mirorEnchantmentTiming
    };

    setUser(userData);

    console.log('🛡️ FUSE Sovereignty: user.id=Convex(_id), clerkId retained for auth');

    // Hydrate theme
    if (decoded.themeDark !== undefined) {
      const themeMode = decoded.themeDark ? 'dark' : 'light';
      hydrateThemeMode(themeMode);
    }
    if (decoded.themeName) {
      hydrateThemeName(decoded.themeName);
    }
  }, [setUser, hydrateThemeMode, hydrateThemeName]);

  // REMOVED: Old useEffect hydration - now done synchronously above
  // The synchronous hydration ensures store is populated BEFORE components render

  // 🔄 COOKIE AUTO-REFRESH - DISABLED FOR PERFORMANCE
  // Cookie polling was causing unnecessary re-renders and race conditions
  // Server Actions should update FUSE store directly, not via cookie polling
  //
  // REPATRIATION: Removing polling as per FUSE philosophy - "Every fetch is a failure"
  // If we need updates, they should be event-driven, not polling-driven
  //
  // useEffect(() => {
  //   let lastKnownCookie: string | null = getCookie('FUSE_5.0');
  //
  //   const interval = setInterval(() => {
  //     const currentCookie = getCookie('FUSE_5.0');
  //
  //     // Cookie changed - decode and update store
  //     if (currentCookie && currentCookie !== lastKnownCookie) {
  //       const decoded = decodeFuseCookie(currentCookie);
  //       if (decoded) {
  //         console.log('🔄 FUSE: Cookie change detected, refreshing state...');
  //         hydrateFromCookie(decoded);
  //         lastKnownCookie = currentCookie;
  //       }
  //     }
  //   }, systemTiming.cookiePollingInterval); // Poll interval from PHOENIX CONFIG!
  //
  //   return () => clearInterval(interval);
  // }, [setUser, hydrateThemeMode, hydrateThemeName, hydrateFromCookie]);

  // 🚀 WARP is now called from FuseApp.tsx via requestIdleCallback
  // This centralizes all preloading in one place (the Sovereign Runtime)

  return null;
}
