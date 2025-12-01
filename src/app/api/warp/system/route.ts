/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - System Data Preload API                              │
│  /src/app/api/warp/system/route.ts                                    │
│                                                                        │
│  Server-side endpoint for System domain preloading                    │
│  Called by PRISM when user opens System dropdown                      │
│                                                                        │
│  Data: users, ranks, aiConfig                                         │
│  Access: Admiral only                                                 │
│                                                                        │
│  PLUMBING: Add Convex queries here when System has real data.         │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 🔮 FUTURE: Add Convex queries when System domain has data
    // Note: This should include Admiral rank check
    // const { getToken } = await auth();
    // const token = await getToken({ template: 'convex' });
    // const [users, ranks, aiConfig] = await Promise.all([
    //   fetchQuery(api.domains.system.api.getUsers, {}, { token }),
    //   fetchQuery(api.domains.system.api.getRanks, {}, { token }),
    //   fetchQuery(api.domains.system.api.getAIConfig, {}, { token }),
    // ]);

    console.log('🚀 WARP API: System data ready (plumbing)');

    return Response.json({
      users: [],
      ranks: [],
      aiConfig: null
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch system data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
