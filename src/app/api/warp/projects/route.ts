/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Projects Data Preload API                            │
│  /src/app/api/warp/projects/route.ts                                  │
│                                                                        │
│  Server-side endpoint for Projects domain preloading                  │
│  Called by PRISM when user opens Projects dropdown                    │
│                                                                        │
│  Data: charts (Gantt), locations, tracking                            │
│  Access: Captain+ (org-scoped)                                        │
│                                                                        │
│  PLUMBING: Add Convex queries here when Projects has real data.       │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 🔮 FUTURE: Add Convex queries when Projects domain has data
    // const { getToken } = await auth();
    // const token = await getToken({ template: 'convex' });
    // const [charts, locations, tracking] = await Promise.all([
    //   fetchQuery(api.domains.projects.api.getCharts, {}, { token }),
    //   fetchQuery(api.domains.projects.api.getLocations, {}, { token }),
    //   fetchQuery(api.domains.projects.api.getTracking, {}, { token }),
    // ]);

    console.log('🚀 WARP API: Projects data ready (plumbing)');

    return Response.json({
      charts: [],
      locations: [],
      tracking: []
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch projects data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
