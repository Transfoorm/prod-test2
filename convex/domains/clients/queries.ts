/**──────────────────────────────────────────────────────────────────────┐
│  🔌 CLIENT DOMAIN QUERIES - SMAC Layer 4                               │
│  /convex/domains/clients/queries.ts                                    │
│                                                                        │
│  Rank-based data scoping for client management:                        │
│  • Crew: Assigned clients only (by_assigned index)                     │
│  • Captain: Organization-scoped clients (by_org index)                 │
│  • Commodore: Organization-scoped clients (by_org index)               │
│  • Admiral: All clients (cross-org, platform-wide)                     │
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
 * List clients with rank-based scoping
 *
 * SMAC Layer 4: Data Scoping
 * - Crew: Only assigned clients
 * - Captain/Commodore: Organization-scoped
 * - Admiral: All clients (cross-org)
 */
export const listClients = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    let clients;

    if (rank === "admiral") {
      // Admiral: See ALL clients (cross-org, platform-wide)
      clients = await ctx.db.query("clients").collect();
    } else if (rank === "captain" || rank === "commodore") {
      // Captain/Commodore: Organization-scoped
      const orgId = user.orgSlug || "";
      clients = await ctx.db
        .query("clients")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    } else {
      // Crew: Assigned clients only
      clients = await ctx.db
        .query("clients")
        .withIndex("by_assigned", (q) => q.eq("assignedTo", user._id))
        .collect();
    }

    return clients;
  },
});

/**
 * Get single client by ID with rank-based authorization
 *
 * SMAC Layer 4: Data Scoping
 * - Validates user has access to this specific client
 */
export const getClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Fetch client
    const client = await ctx.db.get(args.clientId);
    if (!client) return null;

    // Check authorization based on rank
    if (rank === "admiral") {
      // Admiral: Access all clients
      return client;
    } else if (rank === "captain" || rank === "commodore") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (client.orgId !== orgId) {
        throw new Error("Unauthorized: Client not in your organization");
      }
      return client;
    } else {
      // Crew: Must be assigned to this client
      if (client.assignedTo?.toString() !== user._id.toString()) {
        throw new Error("Unauthorized: Client not assigned to you");
      }
      return client;
    }
  },
});
