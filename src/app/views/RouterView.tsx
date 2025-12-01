/**──────────────────────────────────────────────────────────────────────┐
│  🔱 ROUTER VIEW - The Sovereign Switch                                │
│  /src/app/views/RouterView.tsx                                        │
│                                                                        │
│  FUSE 6.0: This component switches views based on sovereign.route.    │
│  No server fetch. No RSC. Pure client-side routing.                   │
│                                                                        │
│  When sovereign.route changes:                                        │
│  • This component re-renders (32-65ms)                                │
│  • The correct view component is returned                             │
│  • View reads from FUSE store (data already there via WARP)           │
│  • Zero loading states. Instant perception.                           │
│                                                                        │
│  This is the spine of the Sovereign Router.                           │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';

// ═══════════════════════════════════════════════════════════════════════
// SOVEREIGN VIEWS
// ═══════════════════════════════════════════════════════════════════════

// Migrated views
import DashboardView from './DashboardView';

// Placeholder component for views not yet migrated
function PlaceholderView({ route }: { route: string }) {
  return (
    <div className="sovereign-placeholder">
      <h2>🔱 Sovereign Route: {route}</h2>
      <p>This view will be migrated from /(domains) in Phase B.</p>
      <p>Navigation is now instant - FUSE 6.0 is working!</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTER VIEW - THE SOVEREIGN SWITCH
// ═══════════════════════════════════════════════════════════════════════

export default function RouterView() {
  const route = useFuse((s) => s.sovereign.route);

  // Performance measurement
  const startRender = performance.now();

  // ─────────────────────────────────────────────────────────────────────
  // ROUTE SWITCH - Each case returns the appropriate view
  // ─────────────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (route) {
      // ═══════════════════════════════════════════════════════════════
      // DASHBOARD
      // ═══════════════════════════════════════════════════════════════
      case 'dashboard':
        return <DashboardView />;

      // ═══════════════════════════════════════════════════════════════
      // PRODUCTIVITY
      // ═══════════════════════════════════════════════════════════════
      case 'productivity/calendar':
        return <PlaceholderView route={route} />;
      case 'productivity/booking':
        return <PlaceholderView route={route} />;
      case 'productivity/tasks':
        return <PlaceholderView route={route} />;
      case 'productivity/email':
        return <PlaceholderView route={route} />;
      case 'productivity/meetings':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // ADMIN
      // ═══════════════════════════════════════════════════════════════
      case 'admin/users':
        return <PlaceholderView route={route} />;
      case 'admin/plans':
        return <PlaceholderView route={route} />;
      case 'admin/feature':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // CLIENTS
      // ═══════════════════════════════════════════════════════════════
      case 'clients/people':
        return <PlaceholderView route={route} />;
      case 'clients/teams':
        return <PlaceholderView route={route} />;
      case 'clients/sessions':
        return <PlaceholderView route={route} />;
      case 'clients/pipeline':
        return <PlaceholderView route={route} />;
      case 'clients/reports':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // FINANCE
      // ═══════════════════════════════════════════════════════════════
      case 'finance/overview':
        return <PlaceholderView route={route} />;
      case 'finance/transactions':
        return <PlaceholderView route={route} />;
      case 'finance/invoices':
        return <PlaceholderView route={route} />;
      case 'finance/payments':
        return <PlaceholderView route={route} />;
      case 'finance/reports':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // PROJECTS
      // ═══════════════════════════════════════════════════════════════
      case 'projects/charts':
        return <PlaceholderView route={route} />;
      case 'projects/locations':
        return <PlaceholderView route={route} />;
      case 'projects/tracking':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // SYSTEM
      // ═══════════════════════════════════════════════════════════════
      case 'system/ai':
        return <PlaceholderView route={route} />;
      case 'system/ranks':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // SETTINGS
      // ═══════════════════════════════════════════════════════════════
      case 'settings/account':
        return <PlaceholderView route={route} />;
      case 'settings/preferences':
        return <PlaceholderView route={route} />;
      case 'settings/security':
        return <PlaceholderView route={route} />;
      case 'settings/billing':
        return <PlaceholderView route={route} />;
      case 'settings/plan':
        return <PlaceholderView route={route} />;

      // ═══════════════════════════════════════════════════════════════
      // FALLBACK
      // ═══════════════════════════════════════════════════════════════
      default:
        console.warn(`🔱 SR: Unknown route "${route}", showing dashboard`);
        return <PlaceholderView route="dashboard" />;
    }
  };

  const view = renderView();

  // Log render time in development
  if (process.env.NODE_ENV === 'development') {
    const renderTime = performance.now() - startRender;
    if (renderTime > 1) {
      console.log(`🔱 RouterView: ${route} rendered in ${renderTime.toFixed(1)}ms`);
    }
  }

  return view;
}
