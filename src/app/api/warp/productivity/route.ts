/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Productivity Data Preload API                        │
│  /src/app/api/warp/productivity/route.ts                              │
│                                                                        │
│  Server-side endpoint for background productivity data preloading     │
│  Called by PRISM when user opens Productivity dropdown                │
│  Uses Clerk auth + Convex token (rank-scoped)                         │
│                                                                        │
│  PRISM Strategy 1: Load entire domain on dropdown open                │
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
    // ⚡ Fetch productivity data in parallel (rank-scoped via Convex auth)
    const [emails, calendar, bookings, meetings] = await Promise.all([
      fetchQuery(api.domains.productivity.api.listEmails, {}, { token }),
      fetchQuery(api.domains.productivity.api.listCalendarEvents, {}, { token }),
      fetchQuery(api.domains.productivity.api.listBookings, {}, { token }),
      fetchQuery(api.domains.productivity.api.listMeetings, {}, { token }),
    ]);

    console.log('🚀 WARP API: Productivity data fetched', {
      emails: emails?.length || 0,
      calendar: calendar?.length || 0,
      bookings: bookings?.length || 0,
      meetings: meetings?.length || 0,
    });

    return Response.json({
      emails: emails || [],
      calendar: calendar || [],
      bookings: bookings || [],
      meetings: meetings || [],
      // ADP coordination metadata
      status: 'hydrated',
      lastFetchedAt: Date.now(),
      source: 'WARP',
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch productivity data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
