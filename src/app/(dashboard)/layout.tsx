/**──────────────────────────────────────────────────────────────────────┐
│  🎯 DASHBOARD LAYOUT - Full Appshell for Root Dashboard               │
│  /src/app/(dashboard)/layout.tsx                                       │
│                                                                        │
│  Same structure as (domain)/layout.tsx                                 │
│  Includes Topbar, Sidebar, AISidebar, PageArch, PageHeader            │
│  Provides domain providers for future dashboard widgets               │
└────────────────────────────────────────────────────────────────────────┘ */

import { ReactNode } from 'react';
import { ClientHydrator } from '@/fuse/hydration/ClientHydrator';
import Topbar from '@/shell/Topbar';
import Sidebar from '@/shell/Sidebar/Sidebar';
import AISidebar from '@/shell/AISidebar';
import PageArch from '@/shell/PageArch';
import PageHeader from '@/shell/PageHeader/PageHeader';
import Footer from '@/shell/Footer';
import { UserSyncProvider } from '@/providers/UserSyncProvider';
import '@/app/(domains)/domains-layout.css';

const USE_CURVES = true;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientHydrator />
      <UserSyncProvider />

      {/* Removed unnecessary domain providers - dashboard doesn't need them */}
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
    </>
  );
}
