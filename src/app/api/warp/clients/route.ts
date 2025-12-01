/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Clients Data Preload API                             │
│  /src/app/api/warp/clients/route.ts                                   │
│                                                                        │
│  Server-side endpoint for Clients domain preloading                   │
│  Called by PRISM when user opens Clients dropdown                     │
│                                                                        │
│  Data: people, teams, sessions, reports                               │
│  Access: All ranks (scoped by rank)                                   │
│                                                                        │
│  PLUMBING: Add Convex queries here when Clients has real data.        │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 🔮 FUTURE: Add Convex queries when Clients domain has data
    // const { getToken } = await auth();
    // const token = await getToken({ template: 'convex' });
    // const [people, teams, sessions, reports] = await Promise.all([
    //   fetchQuery(api.domains.clients.api.getPeople, {}, { token }),
    //   fetchQuery(api.domains.clients.api.getTeams, {}, { token }),
    //   fetchQuery(api.domains.clients.api.getSessions, {}, { token }),
    //   fetchQuery(api.domains.clients.api.getReports, {}, { token }),
    // ]);

    console.log('🚀 WARP API: Clients data ready (plumbing)');

    return Response.json({
      people: [],
      teams: [],
      sessions: [],
      reports: []
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch clients data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
