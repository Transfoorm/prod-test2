/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Dashboard Data Preload API                           │
│  /src/app/api/warp/dashboard/route.ts                                 │
│                                                                        │
│  Server-side endpoint for Dashboard data preloading                   │
│  Called during login (/api/session) to bake into cookie              │
│                                                                        │
│  Currently returns: UI preferences (layout, widgets by rank)          │
│  Future: Will include widget data from other domains                  │
│                                                                        │
│  PLUMBING: This route is wired and ready. When Dashboard needs        │
│  real data (finance summaries, client counts, etc.), add the          │
│  Convex queries here and they'll flow through the existing pipe.      │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';
import { DEFAULT_WIDGETS_BY_RANK } from '@/store/domains/dashboard';

export async function GET() {
  // 🔐 Authenticate
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // For now, Dashboard owns zero data - just UI preferences
    // The rank-based widget defaults are handled client-side
    //
    // 🔮 FUTURE: When widgets need real data, add queries here:
    // const [financeOverview, clientCount, projectStats] = await Promise.all([
    //   fetchQuery(api.domains.finance.api.getDashboardSummary, {}, { token }),
    //   fetchQuery(api.domains.clients.api.getActiveCount, {}, { token }),
    //   fetchQuery(api.domains.projects.api.getStatusSummary, {}, { token }),
    // ]);

    console.log('🚀 WARP API: Dashboard preferences ready (zero data ownership)');

    return Response.json({
      layout: 'classic',
      visibleWidgets: [], // Will be populated by rank in ClientHydrator
      expandedSections: [],
      // 🔮 FUTURE: Add widget data here
      // financeOverview,
      // clientCount,
      // projectStats,
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to prepare dashboard data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Export widget defaults for use in /api/session
export { DEFAULT_WIDGETS_BY_RANK };
