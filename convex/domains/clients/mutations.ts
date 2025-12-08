/**──────────────────────────────────────────────────────────────────────┐
│  🔌 CLIENT DOMAIN MUTATIONS - SRS Layer 4                             │
│  /convex/domains/clients/mutations.ts                                  │
│                                                                        │
│  Client CRUD operations with rank-based authorization:                 │
│  • Create: Captain/Commodore/Admiral only                              │
│  • Update: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Delete: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Crew: Cannot create/update/delete (read-only access)                │
│                                                                        │
│  SRS Commandment #4: Data scoping via Convex mutations                │
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
 * Create new client
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Creates client in their organization
 * - Admiral: Can create client in any organization
 */
export const createClient = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    orgId: v.optional(v.string()), // Admiral can specify orgId, others use their own
    assignedTo: v.optional(v.id("admin_users")), // Optional: assign to specific user
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("prospect"),
        v.literal("archived")
      )
    ),
    notes: v.optional(v.string()),
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

    const clientId = await ctx.db.insert("clients_contacts_Users", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      company: args.company,
      jobTitle: args.jobTitle,
      phoneNumber: args.phoneNumber,
      orgId,
      assignedTo: args.assignedTo,
      status: args.status || "active",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, clientId };
  },
});

/**
 * Update existing client
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only update clients in their organization
 * - Admiral: Can update any client
 */
export const updateClient = mutation({
  args: {
    clientId: v.id("clients_contacts_Users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    assignedTo: v.optional(v.id("admin_users")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("prospect"),
        v.literal("archived")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch client
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (client.orgId !== orgId) {
        throw new Error("Unauthorized: Client not in your organization");
      }
    }

    // Build updates
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.email !== undefined) updates.email = args.email;
    if (args.company !== undefined) updates.company = args.company;
    if (args.jobTitle !== undefined) updates.jobTitle = args.jobTitle;
    if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;
    if (args.status !== undefined) updates.status = args.status;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.clientId, updates);

    return { success: true };
  },
});

/**
 * Delete client
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only delete clients in their organization
 * - Admiral: Can delete any client
 */
export const deleteClient = mutation({
  args: {
    clientId: v.id("clients_contacts_Users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch client
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (client.orgId !== orgId) {
        throw new Error("Unauthorized: Client not in your organization");
      }
    }

    await ctx.db.delete(args.clientId);

    return { success: true };
  },
});
