/**──────────────────────────────────────────────────────────────────────┐
│  🧬 GOD LAYOUT - FUSE 5.0 FOUNDATION                                   │
│  /src/app/layout.tsx                                                   │
│                                                                        │
│  The Root of Everything.                                               │
│  This layout wraps every route, every page, every interaction.         │
│  Built to serve 100,000 users with zero loading states.                │
│                                                                        │
│  FUSE Doctrine: TTT (100K users / 10K req/sec / 1K ms response)        │
│  Pure CSS Dashboard: Single source of truth, zero duplication          │
│  Server-Side Theming: Zero FOUC, instant perception                    │
└────────────────────────────────────────────────────────────────────────┘ */

import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import { SideDrawerProvider, SideDrawerPortal } from '@/prebuilts/modal';
import { PageHeaderProvider } from '@/shell/PageHeader/PageHeaderContext';
import { headers } from 'next/headers';
import '@/app/root-layout.css';

// ═══════════════════════════════════════════════════════════════════════
// STYLING FOUNDATION - Single source of truth in globals.css
// ═══════════════════════════════════════════════════════════════════════
import '@/styles/globals.css';

// ═══════════════════════════════════════════════════════════════════════
// METADATA - SEO & SHARING
// ═══════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: {
    default: 'Transfoorm - Make Your Difference',
    template: '%s | FUSE 4.0'
  },
  description: 'Instant everything. Zero loading states. The future of web applications.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'FUSE 4.0 - Instant Everything',
    description: 'The web application architecture that proves instant is possible.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

// Force dynamic rendering - we need cookies() for server-side theme reading (Zero FOUC)
export const dynamic = 'force-dynamic';

// ═══════════════════════════════════════════════════════════════════════
// GOD LAYOUT - The Foundation That Serves 100K  {/* ⚠️ Change data-page-align="center" to "left" or "right" */}
// ═══════════════════════════════════════════════════════════════════════
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // FUSE OPTIMIZATION: Read theme from middleware headers (already read session cookie once)
  // Eliminates redundant JWT verification on every page load
  const headersList = await headers();
  const themeName = headersList.get('x-theme-name') || 'transtheme';
  const themeMode = headersList.get('x-theme-mode') || 'light';

  return (
    <ClerkProvider>
      <html lang="en" data-theme={themeName} data-theme-mode={themeMode} data-page-align="right">
        <body className="root-layout-body">
          <ConvexClientProvider>
            <SideDrawerProvider>
              <PageHeaderProvider>
                {children}
              </PageHeaderProvider>
              {/* Global SideDrawer - only renders when drawer is open */}
              <SideDrawerPortal />
              {/* Global portal target for SideDrawer */}
              <div id="side-drawer-portal" />
            </SideDrawerProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

/**──────────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE NOTES                                                    │
│                                                                        │
│  Why this works at scale:                                              │
│  • Server-side theme attribute = Zero FOUC for all 100K users          │
│  • CSS variables = Instant theme switching (when we add it)            │
│  • Pure CSS Dashboard = No build step, no duplication, no complexity   │
│  • Overview.css = Single source of truth for all dimensions            │
│  • Transtheme.css = Complete color system, ready for any theme         │
│                                                                        │
│  This is FUSE 4.0. (Now 5.0)                                           │
│  This is the foundation that never breaks.                             │
│  This is built with love for the 100,000.                              │
└────────────────────────────────────────────────────────────────────────┘ */
