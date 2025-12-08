// FUSE 4.0 SESSION REFRESH API
// Updates session cookie with fresh Convex data (e.g., after avatar upload)

import { NextResponse } from 'next/server';
import { readSessionCookie, mintSession, setSessionCookie } from '@/fuse/hydration/session/cookie';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// POST /api/session/refresh — Refresh session cookie with fresh Convex data
export async function POST() {
  try {
    // Read current session to get clerkId
    const session = await readSessionCookie();

    if (!session || !session.clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch fresh user data from Convex
    const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const freshUser = await convexClient.query(api.domains.admin.users.api.getCurrentUser, {
      clerkId: session.clerkId
    });

    if (!freshUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Mint new session cookie with fresh data
    const token = await mintSession({
      _id: String(freshUser._id),
      clerkId: freshUser.clerkId,
      email: freshUser.email || session.email,
      secondaryEmail: freshUser.secondaryEmail || undefined,
      firstName: freshUser.firstName || session.firstName,
      lastName: freshUser.lastName || session.lastName,
      avatarUrl: freshUser.avatarUrl || undefined, // Convert null to undefined
      brandLogoUrl: freshUser.brandLogoUrl || undefined,
      rank: freshUser.rank as string,
      setupStatus: freshUser.setupStatus as string,
      businessCountry: freshUser.businessCountry as string,
      entityName: freshUser.entityName as string,
      socialName: freshUser.socialName as string,
      themeMode: freshUser.themeDark ? 'dark' : 'light',
      mirorAvatarProfile: freshUser.mirorAvatarProfile as 'male' | 'female' | 'inclusive' | undefined,
      mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming as 'subtle' | 'magical' | 'playful' | undefined
    });

    // Set the refreshed cookie
    const res = new NextResponse(null, { status: 200 });
    setSessionCookie(res, token);

    console.log(`FUSE Session: Cookie refreshed - avatarUrl: ${freshUser.avatarUrl?.substring(0, 60)}...`);
    return res;

  } catch (error) {
    console.error('ERROR Session refresh failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
