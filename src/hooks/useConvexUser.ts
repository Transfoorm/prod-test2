/**─────────────────────────────────────────────────────────────────────────┐
│  🔥 VANISH PROTOCOL 2.0 - SINGLE SOURCE OF IDENTITY                      │
│  /src/hooks/useConvexUser.ts                                             │
│                                                                            │
│  The ONLY valid way to access user identity in React components.         │
│                                                                            │
│  VANISH LAW:                                                               │
│  "There is only one identity: the Convex user._id.                        │
│   Clerk authenticates — Convex governs.                                   │
│   No component shall accept userId as prop."                              │
│                                                                            │
│  ENFORCEMENT:                                                              │
│  - All components must use this hook                                      │
│  - No userId prop drilling permitted                                      │
│  - Server-side identity derivation from ctx.auth                          │
│  - Client-side identity from this hook only                               │
│                                                                            │
│  USAGE:                                                                    │
│  const user = useConvexUser();                                            │
│  if (!user) return <Loading />;                                           │
│  return <div>{user.email}</div>;                                          │
│                                                                            │
│  TTT CERTIFIED: Single source prevents identity confusion at scale        │
└──────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from '@/convex/_generated/api';
import type { Doc } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * USE CONVEX USER
 *
 * Hook that provides the authenticated user's Convex document.
 * This is the ONLY valid way to access user identity in components.
 *
 * VANISH LAW COMPLIANCE:
 * - No userId props accepted
 * - No identity confusion
 * - Single source of truth
 * - Clerk auth → Convex identity
 *
 * @returns Convex user document or null/undefined
 *
 * STATES:
 * - undefined: Loading (Clerk auth or Convex query in progress)
 * - null: Not authenticated OR user not found in Convex
 * - Doc<"admin_users">: Authenticated user document
 *
 * PATTERN:
 * ```tsx
 * const user = useConvexUser();
 *
 * if (user === undefined) {
 *   return <LoadingSpinner />; // Still loading
 * }
 *
 * if (user === null) {
 *   return <LoginPrompt />; // Not authenticated
 * }
 *
 * // User is authenticated and loaded
 * return <div>Welcome {user.firstName}!</div>;
 * ```
 */
export function useConvexUser(): Doc<"admin_users"> | null | undefined {
  const { userId: clerkId, isLoaded: clerkLoaded } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);

  const userDoc = useQuery(
    api.domains.admin.users.api.getUserByClerkId,
    clerkLoaded && clerkId ? { clerkId } : "skip"
  );

  // ORPHAN DETECTION: Redirect if Clerk auth exists but no Convex user
  useEffect(() => {
    if (clerkLoaded && clerkId && userDoc === null && !redirectedRef.current) {
      redirectedRef.current = true;
      console.error(`[VANISH] Orphaned Clerk account detected: ${clerkId} - redirecting to signup`);
      router.push('/signup');
    }
  }, [clerkLoaded, clerkId, userDoc, router]);

  if (!clerkLoaded) return undefined;
  if (!clerkId) return null;
  if (!userDoc) return null;

  // Convert avatarUrl from null to undefined to match schema
  return {
    ...userDoc,
    avatarUrl: userDoc.avatarUrl ?? undefined
  };
}

/**
 * USE CONVEX USER (REQUIRED)
 *
 * Variant that throws if user is not authenticated.
 * Use in components that require authentication.
 *
 * @returns Convex user document (never null)
 * @throws Error if not authenticated or user not found
 *
 * USAGE:
 * ```tsx
 * const user = useConvexUserRequired();
 * // TypeScript knows user is never null here
 * return <div>{user.email}</div>;
 * ```
 */
export function useConvexUserRequired(): Doc<"admin_users"> {
  const user = useConvexUser();

  if (user === undefined) {
    throw new Error(
      "[VANISH] Authentication state loading - wrap component in Suspense"
    );
  }

  if (user === null) {
    throw new Error(
      "[VANISH] User not authenticated or not found in Convex database"
    );
  }

  return user;
}

/**
 * USE USER ID
 *
 * Convenience hook for when you only need the user ID.
 * Still enforces single source of identity.
 *
 * @returns Convex user._id or null/undefined
 *
 * USAGE:
 * ```tsx
 * const userId = useUserId();
 * if (!userId) return null;
 *
 * const myProjects = useQuery(
 *   api.projects.getMyProjects,
 *   userId ? { userId } : "skip"
 * );
 * ```
 *
 * NOTE: This is acceptable for query parameters,
 * but mutations should still derive identity server-side from ctx.auth
 */
export function useUserId() {
  const user = useConvexUser();
  return user?._id;
}

/**
 * USE USER RANK
 *
 * Convenience hook for rank-based UI gating.
 * Returns user's naval rank or null.
 *
 * @returns User rank or null/undefined
 *
 * USAGE:
 * ```tsx
 * const rank = useUserRank();
 * if (rank === 'admiral') {
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useUserRankFromConvex() {
  const user = useConvexUser();
  return user?.rank ?? null;
}

/**
 * IS USER RANK
 *
 * Check if user has specific rank(s).
 * Useful for conditional rendering and access control.
 *
 * @param ranks - Single rank or array of acceptable ranks
 * @returns true if user has one of the specified ranks
 *
 * USAGE:
 * ```tsx
 * const isAdmin = useIsUserRank(['admiral', 'commodore']);
 * if (isAdmin) {
 *   return <AdminControls />;
 * }
 * ```
 */
export function useIsUserRank(
  ranks: string | string[]
): boolean {
  const user = useConvexUser();
  if (!user?.rank) return false;

  const allowedRanks = Array.isArray(ranks) ? ranks : [ranks];
  return allowedRanks.includes(user.rank);
}
