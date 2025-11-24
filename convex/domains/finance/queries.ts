/**──────────────────────────────────────────────────────────────────────┐
│  🔌 FINANCE DOMAIN QUERIES - SMAC Layer 4                              │
│  /convex/domains/finance/queries.ts                                    │
│                                                                        │
│  Rank-based data scoping for financial management:                     │
│  • Crew: Read-only, organization-scoped                                │
│  • Captain: Full access, organization-scoped                           │
│  • Commodore: Full access, organization-scoped                         │
│  • Admiral: All finance (cross-org, platform-wide)                     │
│                                                                        │
│  SMAC Commandment #4: Data scoping via Convex query filters            │
└────────────────────────────────────────────────────────────────────────┘ */

import { query } from "@/convex/_generated/server";
import type { QueryCtx } from "@/convex/_generated/server";
import { v } from "convex/values";

/**
 * Get current user with rank for authorization
 */
async function getCurrentUserWithRank(ctx: QueryCtx) {
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
 * List financial transactions with rank-based scoping
 *
 * SMAC Layer 4: Data Scoping
 * - Crew: Read-only, organization-scoped
 * - Captain/Commodore: Organization-scoped
 * - Admiral: All finance (cross-org)
 */
export const listTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    let transactions;

    if (rank === "admiral") {
      // Admiral: See ALL transactions (cross-org, platform-wide)
      transactions = await ctx.db.query("finance").collect();
    } else {
      // Crew/Captain/Commodore: Organization-scoped
      const orgId = user.orgSlug || "";
      transactions = await ctx.db
        .query("finance")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    }

    return transactions;
  },
});

/**
 * Get single transaction by ID with rank-based authorization
 *
 * SMAC Layer 4: Data Scoping
 * - Validates user has access to this specific transaction
 */
export const getTransaction = query({
  args: { transactionId: v.id("finance") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Fetch transaction
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) return null;

    // Check authorization based on rank
    if (rank === "admiral") {
      // Admiral: Access all transactions
      return transaction;
    } else {
      // Crew/Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (transaction.orgId !== orgId) {
        throw new Error("Unauthorized: Transaction not in your organization");
      }
      return transaction;
    }
  },
});
