// FUSE 5.0 Server-Side User Fetch
// Reads session cookie and fetches fresh data from Convex for SSR

import { readSessionCookie } from '@/fuse/hydration/session/cookie';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export type ServerUser = {
  clerkId: string;
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
  mirorAvatarProfile?: 'male' | 'female' | 'inclusive';
  mirorEnchantmentEnabled?: boolean;
  mirorEnchantmentTiming?: 'subtle' | 'magical' | 'playful';
  // Note: Professional Genome is now in settings_account_Genome table
  // and fetched separately via getUserGenome query
};

export async function fetchUserServer(): Promise<ServerUser | null> {
  try {
    const session = await readSessionCookie();

    if (!session || !session.clerkId) {
      return null;
    }

    // VALIDATE: Ensure Convex user exists (prevents orphaned cookie data)
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexUser = await convex.query(api.domains.admin.users.api.getUserByClerkId, {
      clerkId: session.clerkId
    });

    if (!convexUser) {
      return null; // User deleted - will trigger redirect to /sign-in
    }

    // FUSE 5.0 Doctrine: Convex is the single source of truth
    // Use fresh data from Convex, not stale cookie
    // Note: Professional Genome is now in settings_account_Genome table
    const userData: ServerUser = {
      clerkId: convexUser.clerkId,
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
