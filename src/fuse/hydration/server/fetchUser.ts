/**
 * 🛡️ S.I.D. COMPLIANT - FUSE 6.0 Server-Side User Fetch
 * Reads session cookie and fetches fresh data from Convex for SSR
 *
 * SID-5.3: Uses session._id (sovereign) for Convex lookups
 */

import { readSessionCookie } from '@/fuse/hydration/session/cookie';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export type ServerUser = {
  _id: string;           // ✅ Sovereign Convex _id
  clerkId: string;       // Reference only (for SID-12.1 Clerk API calls)
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  rank?: string;
  setupStatus?: string;
  businessCountry?: string;
  entityName?: string;
  socialName?: string;
  themeDark?: boolean;
  mirorAvatarProfile?: 'f_1' | 'f_2' | 'f_3' | 'm_1' | 'm_2' | 'm_3' | 'i_1' | 'i_2' | 'i_3';
  mirorEnchantmentEnabled?: boolean;
  mirorEnchantmentTiming?: 'subtle' | 'magical' | 'playful';
};

export async function fetchUserServer(): Promise<ServerUser | null> {
  try {
    const session = await readSessionCookie();

    // 🛡️ SID-9.1: Identity from session._id (sovereign)
    if (!session || !session._id) {
      return null;
    }

    // 🛡️ SID-5.3: Validate Convex user exists using sovereign _id
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
      userId: session._id as Id<"admin_users">
    });

    if (!convexUser) {
      return null; // User deleted - will trigger redirect to /sign-in
    }

    // FUSE 6.0 Doctrine: Convex is the single source of truth
    // Use fresh data from Convex, not stale cookie
    // 🛡️ S.I.D. Phase 15: clerkId comes from session, not Convex query
    const userData: ServerUser = {
      _id: String(convexUser._id),        // ✅ Sovereign identity
      clerkId: session.clerkId,           // Preserve from session
      email: convexUser.email,
      firstName: convexUser.firstName,
      lastName: convexUser.lastName,
      avatarUrl: convexUser.avatarUrl ?? undefined,
      rank: convexUser.rank,
      setupStatus: convexUser.setupStatus,
      businessCountry: convexUser.businessCountry,
      entityName: convexUser.entityName,
      socialName: convexUser.socialName,
      themeDark: convexUser.themeDark,
      mirorAvatarProfile: convexUser.mirorAvatarProfile,
      mirorEnchantmentEnabled: convexUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: convexUser.mirorEnchantmentTiming,
    };

    console.log(`FUSE fetchUserServer: Using fresh Convex data (rank: ${convexUser.rank})`);
    return userData;
  } catch (error) {
    console.error('FUSE: Failed to fetch user server-side:', error);
    return null;
  }
}
