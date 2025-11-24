// FUSE Rank Authentication Utilities
// Following User Rank system: Developer-only feature gating
//
// Hierarchy: Admiral > Commodore > Captain > Crew
//
// NOTE: This file duplicates UserRank and RANK_HIERARCHY from /src/rank/types.ts
// This is intentional for Convex isolation - Convex cannot import from src/
// The canonical source is /src/rank/ - keep these in sync manually

import { DatabaseReader } from "@/convex/_generated/server";

export type UserRank = "crew" | "captain" | "commodore" | "admiral";

// Rank hierarchy for comparison
const RANK_HIERARCHY: Record<UserRank, number> = {
  crew: 0,
  captain: 1,
  commodore: 2,
  admiral: 3
};

/**
 * Verify user has Admiral rank for Fleet Control operations
 */
export async function requireAdmiralRank(ctx: { db: DatabaseReader }, clerkId: string) {
  const user = await ctx.db
    .query("admin_users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.rank || user.rank !== "admiral") {
    throw new Error("Unauthorized: Admiral rank required for Fleet Control");
  }

  return user;
}

/**
 * Verify user has minimum required rank
 */
export async function requireMinimumRank(
  ctx: { db: DatabaseReader },
  clerkId: string,
  minimumRank: UserRank
) {
  const user = await ctx.db
    .query("admin_users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.rank) {
    throw new Error("User rank not assigned");
  }

  const userRankLevel = RANK_HIERARCHY[user.rank as UserRank];
  const requiredRankLevel = RANK_HIERARCHY[minimumRank];

  if (userRankLevel < requiredRankLevel) {
    throw new Error(`Unauthorized: ${minimumRank} rank or higher required`);
  }

  return user;
}

/**
 * Check if user has Admiral rank (returns boolean)
 */
export async function isAdmiral(ctx: { db: DatabaseReader }, clerkId: string): Promise<boolean> {
  try {
    await requireAdmiralRank(ctx, clerkId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user rank safely
 */
export async function getUserRank(ctx: { db: DatabaseReader }, clerkId: string): Promise<UserRank | null> {
  const user = await ctx.db
    .query("admin_users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  return (user?.rank as UserRank) || null;
}

/**
 * Get all admin_users with specific rank
 */
export async function getUsersByRank(ctx: { db: DatabaseReader }, rank: UserRank) {
  return await ctx.db
    .query("admin_users")
    .withIndex("by_rank", (q) => q.eq("rank", rank))
    .collect();
}
