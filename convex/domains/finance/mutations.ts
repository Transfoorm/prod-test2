/**──────────────────────────────────────────────────────────────────────┐
│  🔌 FINANCE DOMAIN MUTATIONS - SMAC Layer 4                            │
│  /convex/domains/finance/mutations.ts                                  │
│                                                                        │
│  Financial transaction CRUD with rank-based authorization:             │
│  • Create: Captain/Commodore/Admiral only                              │
│  • Update: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Delete: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Crew: Read-only access (cannot create/update/delete)                │
│                                                                        │
│  SMAC Commandment #4: Data scoping via Convex mutations                │
└────────────────────────────────────────────────────────────────────────┘ */

import { mutation } from "@/convex/_generated/server";
import type { MutationCtx } from "@/convex/_generated/server";
import { v } from "convex/values";

/**
 * Get current user with rank for authorization
 */
async function getCurrentUserWithRank(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("admin_users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User not found");

  return user;
}

/**
 * Require minimum rank for mutations (Captain or higher)
 */
function requireCaptainOrHigher(rank: string | undefined) {
  if (rank === "crew") {
    throw new Error("Unauthorized: Captain rank or higher required");
  }
}

/**
 * Create new financial transaction
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Creates transaction in their organization
 * - Admiral: Can create transaction in any organization
 */
export const createTransaction = mutation({
  args: {
    type: v.union(
      v.literal("invoice"),
      v.literal("payment"),
      v.literal("expense")
    ),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    orgId: v.optional(v.string()), // Admiral can specify orgId
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("overdue")
      )
    ),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Determine orgId
    let orgId: string;
    if (rank === "admiral" && args.orgId) {
      // Admiral can create in any org
      orgId = args.orgId;
    } else {
      // Captain/Commodore create in their own org
      orgId = user.orgSlug || "";
    }

    const now = Date.now();

    const transactionId = await ctx.db.insert("finance", {
      type: args.type,
      amount: args.amount,
      currency: args.currency,
      description: args.description,
      orgId,
      status: args.status || "pending",
      date: args.date,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, transactionId };
  },
});

/**
 * Update existing financial transaction
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only update transactions in their organization
 * - Admiral: Can update any transaction
 */
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("finance"),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("overdue")
      )
    ),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch transaction
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (transaction.orgId !== orgId) {
        throw new Error("Unauthorized: Transaction not in your organization");
      }
    }

    // Build updates
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.date !== undefined) updates.date = args.date;

    await ctx.db.patch(args.transactionId, updates);

    return { success: true };
  },
});

/**
 * Delete financial transaction
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only delete transactions in their organization
 * - Admiral: Can delete any transaction
 */
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("finance"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch transaction
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (transaction.orgId !== orgId) {
        throw new Error("Unauthorized: Transaction not in your organization");
      }
    }

    await ctx.db.delete(args.transactionId);

    return { success: true };
  },
});
