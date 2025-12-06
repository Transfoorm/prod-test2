/**
 * 🛡️ FUSE Stack Server Actions - Admin Domain Mutations
 *
 * Server actions for admin operations that don't affect user session.
 * These wrap Convex mutations to keep domain views Convex-free (SRB-4 compliant).
 *
 * ARCHITECTURE:
 * Component → Server Action → Convex Mutation → FUSE re-hydrates via WARP
 *
 * 🔱 SOVEREIGN IDENTITY:
 * Identity flows from FUSE session cookie, NOT from Clerk getToken().
 * Clerk is quarantined at the /auth/** boundary only.
 */

'use server';

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { readSessionCookie } from '@/fuse/hydration/session/cookie';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Delete a deletion log entry (VANISH journal cleanup)
 *
 * 🔱 SOVEREIGN: Identity from FUSE session cookie, not Clerk token
 */
export async function deleteDeletionLogAction(logId: Id<"admin_users_DeletionLogs">) {
  try {
    // 🔱 SOVEREIGN: Read identity from FUSE session cookie
    const session = await readSessionCookie();
    if (!session?.clerkId) throw new Error('Unauthorized: No valid session');

    // Call Convex mutation with clerkId from session cookie
    const result = await convex.mutation(api.domains.admin.users.api.deleteDeletionLog, {
      logId,
      callerClerkId: session.clerkId,
    });

    return result;
  } catch (error) {
    console.error('deleteDeletionLogAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
