/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Settings Data Preload API                            │
│  /src/app/api/warp/settings/route.ts                                  │
│                                                                        │
│  Server-side endpoint for Settings domain preloading                  │
│  Called by PRISM when user opens Settings dropdown                    │
│                                                                        │
│  Data: userProfile, preferences, notifications, genome                │
│  Access: All ranks (SELF-scoped)                                      │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const token = await getToken({ template: 'convex' });

    // Fetch genome data for Professional Genome tab
    const genome = await fetchQuery(
      api.domains.settings.queries.getUserGenome,
      {},
      { token: token ?? undefined }
    );

    console.log('🚀 WARP API: Settings data ready (genome preloaded)');

    return Response.json({
      userProfile: null,
      preferences: [],
      notifications: [],
      genome,
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch settings data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
