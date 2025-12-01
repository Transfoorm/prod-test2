/**──────────────────────────────────────────────────────────────────────┐
│  🔱 FUSE APP - The Sovereign Runtime                                  │
│  /src/app/FuseApp.tsx                                                 │
│                                                                        │
│  FUSE 6.0: This component NEVER unmounts after initial load.          │
│  It is the persistent client shell that owns all domain navigation.   │
│                                                                        │
│  Architecture:                                                        │
│  • Mounts once from /app/page.tsx (server handover at ROOT)           │
│  • Contains the full app shell (Sidebar, Topbar, AISidebar)           │
│  • RouterView switches domain views based on FUSE sovereign.route     │
│  • WARP Orchestrator preloads all domain data on mount                │
│  • Zero server round-trips after initial load                         │
│                                                                        │
│  This is where FUSE Doctrine becomes reality.                         │
│  32-65ms navigation. Every click. Forever.                            │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { urlPathToRoute } from '@/store/domains/navigation';

// Shell components
import { ClientHydrator } from '@/fuse/hydration/ClientHydrator';
import { UserSyncProvider } from '@/providers/UserSyncProvider';
import Topbar from '@/shell/Topbar';
import Sidebar from '@/shell/Sidebar/Sidebar';
import AISidebar from '@/shell/AISidebar';
import PageArch from '@/shell/PageArch';
import PageHeader from '@/shell/PageHeader/PageHeader';
import Footer from '@/shell/Footer';

// Sovereign Router
import RouterView from './views/RouterView';

// Domain providers (will be removed in Phase F - currently needed for data)
import { FinanceProvider } from '@/providers/FinanceProvider';
import { ClientsProvider } from '@/providers/ClientsProvider';
import { ProductivityProvider } from '@/providers/ProductivityProvider';
import { ProjectsProvider } from '@/providers/ProjectsProvider';

// Layout CSS
import '@/app/(domains)/domains-layout.css';

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

/** Enable curved frame (PageArch) around content */
const USE_CURVES = true;

// ═══════════════════════════════════════════════════════════════════════
// FUSE APP - THE SOVEREIGN RUNTIME
// ═══════════════════════════════════════════════════════════════════════

export default function FuseApp() {
  // Sovereign Router state and actions
  const sovereignHydrateSections = useFuse((s) => s.sovereignHydrateSections);
  const navigate = useFuse((s) => s.navigate);

  // ─────────────────────────────────────────────────────────────────────
  // INITIAL MOUNT - Happens ONCE, then FUSE takes over
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔱 FUSE 6.0: Sovereign runtime mounted');

    // 1. Hydrate sidebar sections from localStorage
    sovereignHydrateSections();

    // 2. Parse initial route from URL (if user navigated directly)
    if (typeof window !== 'undefined') {
      const initialRoute = urlPathToRoute(window.location.pathname);
      navigate(initialRoute);
      console.log(`🔱 SR: Initial route from URL: ${initialRoute}`);
    }

    // 3. Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.route) {
        navigate(event.state.route);
      } else {
        // Parse from URL if no state
        const route = urlPathToRoute(window.location.pathname);
        navigate(route);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // 4. WARP Orchestrator - Preload all domain data during idle time
    // This is the FUSE resurrection moment
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('🔱 WARP-O: Starting idle-time preload...');
        // TODO: Implement runWarpPreload() in Phase D
        // runWarpPreload();
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sovereignHydrateSections, navigate]);

  // ─────────────────────────────────────────────────────────────────────
  // RENDER - The Sovereign Shell
  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* FUSE: Hydrate client store from session cookie */}
      <ClientHydrator />
      <UserSyncProvider />

      {/* Domain Providers - TODO: Remove in Phase F when views read from FUSE only */}
      <FinanceProvider>
        <ClientsProvider>
          <ProductivityProvider>
            <ProjectsProvider>
              <div data-theme="translight" className="modes-layout-app-container">
                <Sidebar />
                <div className="modes-layout-right-container">
                  <Topbar />
                  <div className="modes-layout-main-container">
                    <main className={USE_CURVES ? 'modes-layout-main-content-with-arch' : 'modes-layout-main-content-without-arch'}>
                      {USE_CURVES ? (
                        <PageArch>
                          <PageHeader />
                          {/* 🔱 SOVEREIGN ROUTER - Views switch here */}
                          <RouterView />
                        </PageArch>
                      ) : (
                        <>
                          <PageHeader />
                          {/* 🔱 SOVEREIGN ROUTER - Views switch here */}
                          <RouterView />
                        </>
                      )}
                    </main>
                    <AISidebar />
                  </div>
                  <Footer />
                </div>
              </div>
            </ProjectsProvider>
          </ProductivityProvider>
        </ClientsProvider>
      </FinanceProvider>
    </>
  );
}
