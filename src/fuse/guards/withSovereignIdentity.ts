/**──────────────────────────────────────────────────────────────────────┐
│  🔱 GOLDEN BRIDGE GUARDRAIL - Server Action Identity Wrapper          │
│  /src/fuse/guards/withSovereignIdentity.ts                            │
│                                                                        │
│  Wraps Server Actions to enforce sovereign identity flow.             │
│  Automatically extracts callerClerkId from FUSE session cookie.       │
│                                                                        │
│  THE LAW:                                                              │
│    Server Actions NEVER call Clerk getToken().                        │
│    Identity comes from FUSE session cookie ONLY.                      │
│    This wrapper enforces that pattern automatically.                  │
│                                                                        │
│  Usage:                                                                │
│    'use server';                                                      │
│    import { withSovereignIdentity } from '@/fuse/guards/withSovereignIdentity';  │
│                                                                        │
│    export const myAction = withSovereignIdentity(                     │
│      async (callerClerkId, arg1, arg2) => {                           │
│        // callerClerkId is guaranteed valid                           │
│        await convex.mutation(api.foo, { callerClerkId, arg1, arg2 }); │
│      }                                                                │
│    );                                                                 │
│                                                                        │
│  Ref: Clerk Knox, Golden Bridge Pattern                               │
└────────────────────────────────────────────────────────────────────────┘ */

import { readSessionCookie } from '@/fuse/hydration/session/cookie';

/**
 * Error thrown when session is invalid or missing
 */
export class SovereignIdentityError extends Error {
  constructor(message: string) {
    super(`[SOVEREIGN GUARD] ${message}`);
    this.name = 'SovereignIdentityError';
  }
}

/**
 * Result type for sovereign actions
 */
export type SovereignResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wraps a Server Action to inject callerClerkId from FUSE session cookie.
 *
 * The wrapped function receives callerClerkId as its first argument,
 * followed by any additional arguments passed when calling the action.
 *
 * @example
 * // Define action
 * export const deleteUser = withSovereignIdentity(
 *   async (callerClerkId, userId: string) => {
 *     return await convex.mutation(api.users.delete, { callerClerkId, userId });
 *   }
 * );
 *
 * // Call action (callerClerkId is auto-injected)
 * await deleteUser(userId);
 */
export function withSovereignIdentity<TArgs extends unknown[], TResult>(
  handler: (callerClerkId: string, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<SovereignResult<TResult>> {
  return async (...args: TArgs): Promise<SovereignResult<TResult>> => {
    try {
      // Read identity from FUSE session cookie (the ONLY source of truth)
      const session = await readSessionCookie();

      if (!session) {
        return {
          success: false,
          error: 'No valid session. Please log in again.',
        };
      }

      if (!session.clerkId) {
        return {
          success: false,
          error: 'Invalid session: missing identity. Please log in again.',
        };
      }

      // Execute handler with sovereign identity
      const result = await handler(session.clerkId, ...args);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('[SOVEREIGN GUARD] Action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}

/**
 * Simple helper to get callerClerkId from session cookie.
 * Use this when you need more control over the action structure.
 *
 * @example
 * export async function myAction(arg1: string) {
 *   const callerClerkId = await getSovereignIdentity();
 *   if (!callerClerkId) throw new Error('Unauthorized');
 *
 *   return await convex.mutation(api.foo, { callerClerkId, arg1 });
 * }
 */
export async function getSovereignIdentity(): Promise<string | null> {
  const session = await readSessionCookie();
  return session?.clerkId ?? null;
}

/**
 * Gets sovereign identity or throws if not authenticated.
 * Use this when you want the action to fail immediately on missing auth.
 *
 * @example
 * export async function myAction(arg1: string) {
 *   const callerClerkId = await requireSovereignIdentity();
 *   // callerClerkId is guaranteed to be a valid string here
 *
 *   return await convex.mutation(api.foo, { callerClerkId, arg1 });
 * }
 */
export async function requireSovereignIdentityFromCookie(): Promise<string> {
  const session = await readSessionCookie();

  if (!session?.clerkId) {
    throw new SovereignIdentityError('Not authenticated. Please log in.');
  }

  return session.clerkId;
}
