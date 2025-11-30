/**─────────────────────────────────────────────────────────────────────────┐
│  🔥 VANISH PROTOCOL 2.0 - SINGLE SOURCE OF IDENTITY                      │
│  /src/hooks/useConvexUser.ts                                             │
│                                                                            │
│  GOLDEN BRIDGE COMPLIANT (TTTS-2):                                        │
│  - useQuery ONLY hydrates FUSE                                            │
│  - Components read from FUSE only                                         │
│  - NO direct Convex data returns                                          │
│                                                                            │
│  VANISH LAW:                                                               │
│  "There is only one identity: the Convex user._id.                        │
│   Clerk authenticates — Convex governs.                                   │
│   No component shall accept userId as prop."                              │
│                                                                            │
│  TTT CERTIFIED: Single source prevents identity confusion at scale        │
└──────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from '@/convex/_generated/api';
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFuse } from "@/store/fuse";
import type { FuseUser } from "@/store/types";

/**
 * CONVEX → FUSE SYNC HOOK (Internal)
 *
 * This hook syncs Convex user data INTO FUSE.
 * It NEVER returns Convex data directly.
 *
 * GOLDEN BRIDGE PATTERN:
 * - Convex query runs
 * - Data hydrates FUSE via setUser()
 * - Components read from FUSE only
 */
export function useConvexUserSync(): void {
  const { userId: clerkId, isLoaded: clerkLoaded } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const setUser = useFuse((state) => state.setUser);

  // Query Convex for user data
  const userDoc = useQuery(
    api.domains.admin.users.api.getUserByClerkId,
    clerkLoaded && clerkId ? { clerkId } : "skip"
  );

  // SYNC TO FUSE: When Convex data arrives, hydrate FUSE store
  useEffect(() => {
    if (userDoc) {
      // Convert Convex Doc to FuseUser format and hydrate FUSE
      // FuseUser uses 'id' and 'convexId' instead of '_id' (SOVEREIGNTY DOCTRINE)
      const fuseUser: FuseUser = {
        id: userDoc._id,
        convexId: userDoc._id,
        clerkId: userDoc.clerkId,
        email: userDoc.email,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        avatarUrl: userDoc.avatarUrl ?? undefined,
        rank: userDoc.rank,
        setupStatus: userDoc.setupStatus,
        subscriptionStatus: userDoc.subscriptionStatus,
        brandLogoUrl: userDoc.brandLogoUrl ?? undefined,
        businessCountry: userDoc.businessCountry ?? undefined,
        entityName: userDoc.entityName ?? undefined,
        socialName: userDoc.socialName ?? undefined,
        createdAt: userDoc._creationTime,
      };
      setUser(fuseUser);
      console.log('🔥 VANISH: User synced to FUSE via CONVEX_LIVE');
    }
  }, [userDoc, setUser]);

  // ORPHAN DETECTION: Redirect if Clerk auth exists but no Convex user
  useEffect(() => {
    if (clerkLoaded && clerkId && userDoc === null && !redirectedRef.current) {
      redirectedRef.current = true;
      console.error(`[VANISH] Orphaned Clerk account detected: ${clerkId} - redirecting to signup`);
      router.push('/signup');
    }
  }, [clerkLoaded, clerkId, userDoc, router]);

  // Clear user from FUSE when logged out
  useEffect(() => {
    if (clerkLoaded && !clerkId) {
      setUser(null);
    }
  }, [clerkLoaded, clerkId, setUser]);
}

/**
 * USE CONVEX USER - GOLDEN BRIDGE COMPLIANT
 *
 * Reads user from FUSE store (not Convex directly).
 * Use useConvexUserSync() in a provider to keep FUSE hydrated.
 *
 * @returns FUSE user or null
 *
 * USAGE:
 * ```tsx
 * const user = useConvexUser();
 * if (!user) return <Loading />;
 * return <div>{user.email}</div>;
 * ```
 */
export function useConvexUser(): FuseUser {
  return useFuse((state) => state.user);
}

/**
 * USE CONVEX USER (REQUIRED)
 *
 * Variant that throws if user is not in FUSE.
 * Use in components that require authentication.
 *
 * @returns FUSE user document (never null)
 * @throws Error if not authenticated or user not found
 */
export function useConvexUserRequired(): NonNullable<FuseUser> {
  const user = useConvexUser();

  if (!user) {
    throw new Error(
      "[VANISH] User not in FUSE store - ensure useConvexUserSync() is running in a provider"
    );
  }

  return user;
}

/**
 * USE USER ID
 *
 * Convenience hook for when you only need the user ID.
 * Reads from FUSE (Golden Bridge compliant).
 *
 * @returns FUSE user._id or undefined
 */
export function useUserId() {
  const user = useConvexUser();
  return user?.id;
}

/**
 * USE USER RANK
 *
 * Convenience hook for rank-based UI gating.
 * Reads from FUSE (Golden Bridge compliant).
 *
 * @returns User rank or null
 */
export function useUserRankFromConvex() {
  const user = useConvexUser();
  return user?.rank ?? null;
}

/**
 * IS USER RANK
 *
 * Check if user has specific rank(s).
 * Reads from FUSE (Golden Bridge compliant).
 *
 * @param ranks - Single rank or array of acceptable ranks
 * @returns true if user has one of the specified ranks
 */
export function useIsUserRank(ranks: string | string[]): boolean {
  const user = useConvexUser();
  if (!user?.rank) return false;

  const allowedRanks = Array.isArray(ranks) ? ranks : [ranks];
  return allowedRanks.includes(user.rank);
}
