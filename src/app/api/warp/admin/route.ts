/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Admin Data Preload API                                │
│  /src/app/api/warp/admin/route.ts                                      │
│                                                                        │
│  Server-side endpoint for background admin data preloading             │
│  Called by client orchestrator after login                             │
│  Uses Clerk auth + Convex token (Admiral-only)                         │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET() {
  // 🔐 Authenticate and get Convex token
  const { getToken } = await auth();
  const token = await getToken({ template: 'convex' });

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // ⚡ Fetch admin data in parallel (Admiral-only via Convex auth)
    const [users, deletionLogs] = await Promise.all([
      fetchQuery(api.domains.admin.users.api.getAllUsers, {}, { token }),
      fetchQuery(api.domains.admin.users.api.getAllDeletionLogs, {}, { token }),
    ]);

    console.log('🚀 WARP API: Admin data fetched', {
      users: users?.length || 0,
      deletionLogs: deletionLogs?.length || 0,
    });

    return Response.json({
      users: users || [],
      deletionLogs: deletionLogs || []
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch admin data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
