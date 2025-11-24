/**──────────────────────────────────────────────────────────────────────┐
│  🎯 DOMAIN LAYOUT - SMAC Domain Routes with Full Appshell             │
│  /src/app/domain/layout.tsx                                           │
│                                                                        │
│  Layout for all SMAC domain routes.                                   │
│  Includes Topbar, left Sidebar, and right AI Sidebar.                 │
│  Content wrapped in PageArch for curved frame effect.                 │
│                                                                        │
│  FUSE 5.0: SMAC Architecture - Static Shell, Client Hydration         │
│  • Static layout (no server fetch) for instant render                 │
│  • Client-side hydration from session cookie                          │
│  • Auth redirect handled by middleware (SMAC Layer 3)                 │
│  • Rank-based routing enforced by Edge Gate (middleware)              │
│  • Data scoping enforced by Convex queries (SMAC Layer 4)             │
│                                                                        │
│  Enterprise Pattern: Layout owns header slot positioning              │
│  • PageHeader renders in nano-precise position for all pages          │
│  • Pages set title/subtitle via useSetPageHeader hook                 │
│  • Identical positioning across every route automatically             │
│                                                                        │
│  SMAC Routes: /domain/client, /domain/admin, /domain/work, etc.       │
└────────────────────────────────────────────────────────────────────────┘ */

import { ClientHydrator } from '@/fuse/hydration/ClientHydrator';
import Topbar from '@/shell/Topbar';
import Sidebar from '@/shell/Sidebar/Sidebar';
import AISidebar from '@/shell/AISidebar';
import PageArch from '@/shell/PageArch';
import PageHeader from '@/shell/PageHeader/PageHeader';
import Footer from '@/shell/Footer';
// TODO: Re-enable after rebuilding setup flow with VRP prebuilts
// import FlyingEngine from '@/app/(modes)/(shared)/home/@captain/complete-setup/FlyingEngine';
import { FinanceProvider } from '@/providers/FinanceProvider';
import { ClientsProvider } from '@/providers/ClientsProvider';
import { ProductivityProvider } from '@/providers/ProductivityProvider';
import { ProjectsProvider } from '@/providers/ProjectsProvider';
import { UserSyncProvider } from '@/providers/UserSyncProvider';
import '@/app/(domains)/domains-layout.css';

/**┌────────────────────────────────────────────────────────────────────────┐
  │  🎚️  CURVES TOGGLE - Hey You!                                           │
  │       To disable the curved frame:                                      │
  │       Change USE_CURVES = true; to -> USE_CURVES = false;             │
  │   It will remove PageArch wrapper entirely.                             │
  │  true  = Curved top border with max-width container                     │
  │  false = Content renders directly (square edges, no wrapper)            │
  └─────────────────────────────────────────────────────────────────────────┘ */
const USE_CURVES = true;

export default function DomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FUSE 5.0: Static shell - auth handled by middleware
  // ClientHydrator reads session cookie and hydrates store client-side

  return (
    <>
      {/* FUSE: Hydrate client store from session cookie */}
      <ClientHydrator />
      <UserSyncProvider />

      {/* TODO: Re-enable after rebuilding setup flow with VRP prebuilts */}
      {/* <FlyingEngine /> */}

      {/* 🌐 GREAT PROVIDER ECOSYSTEM - Domain-based state management
          Providers nest to create unified data layer
          Each provider hydrates when section is visited or background WARP completes
          Following Progressive Intelligent WARP strategy */}
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
                          {children}
                        </PageArch>
                      ) : (
                        <>
                          <PageHeader />
                          {children}
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
