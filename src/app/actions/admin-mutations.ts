/**
 * 🛡️ FUSE Stack Server Actions - Admin Domain Mutations
 *
 * Server actions for admin operations that don't affect user session.
 * These wrap Convex mutations to keep domain views Convex-free (SRB-4 compliant).
 *
 * ARCHITECTURE:
 * Component → Server Action → Convex Mutation → FUSE re-hydrates via WARP
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Delete a deletion log entry (VANISH journal cleanup)
 */
export async function deleteDeletionLogAction(logId: Id<"admin_users_DeletionLogs">) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Call Convex mutation
    const result = await convex.mutation(api.domains.admin.users.api.deleteDeletionLog, {
      logId,
    });

    return result;
  } catch (error) {
    console.error('deleteDeletionLogAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
