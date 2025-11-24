/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ FUSE Stack Domain - Admin                                         │
│  /src/app/domain/admin/layout.tsx                                      │
│                                                                        │
│  TRUE WARP: Background preload handles data (no SSR blocking)          │
│  WRAP: useAdminData() hook for components                              │
│  Golden Bridge: TRUE WARP → FUSE state → instant access                │
└────────────────────────────────────────────────────────────────────────┘ */

import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminProvider } from '@/providers/AdminProvider';
import { VanishProvider, VanishPortal } from '@/vanish/Drawer';

/**
 * Admin Domain Layout
 *
 * TRUE WARP Pattern:
 * 1. Authenticate user (server-side)
 * 2. Wrap children with AdminProvider (no SSR fetch)
 * 3. TRUE WARP background preload provides data
 * 4. Children render with instant data access from FUSE store
 *
 * Performance:
 * - No blocking SSR fetch → instant navigation
 * - TRUE WARP runs in background after login → ~1300ms
 * - By the time user clicks Users, data already in store
 * - Components pull from FUSE → instant (0ms)
 * - BOOM CHAGALAGA!
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔐 Authenticate user (Admiral-only access handled by Convex)
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // No SSR fetch - rely on TRUE WARP background preload
  // Data already in FUSE store by the time user navigates here
  return (
    <VanishProvider>
      <AdminProvider>
        {children}
        {/* VANISH Drawer Portal - Admiral-only (SMAC quarantine) */}
        <VanishPortal />
        {/* Portal target for VANISH drawer */}
        <div id="vanish-drawer-portal" />
      </AdminProvider>
    </VanishProvider>
  );
}
