/**──────────────────────────────────────────────────────────────────────┐
│  🔌 PROJECT DOMAIN MUTATIONS - SMAC Layer 4                            │
│  /convex/domains/projects/mutations.ts                                 │
│                                                                        │
│  Project CRUD with rank-based authorization:                           │
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
 * Create new project
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Creates project in their organization
 * - Admiral: Can create project in any organization
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    orgId: v.optional(v.string()), // Admiral can specify orgId
    assignedTo: v.optional(v.id("admin_users")), // Optional: assign to specific user
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      orgId,
      assignedTo: args.assignedTo,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, projectId };
  },
});

/**
 * Update existing project
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only update projects in their organization
 * - Admiral: Can update any project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("admin_users")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (project.orgId !== orgId) {
        throw new Error("Unauthorized: Project not in your organization");
      }
    }

    // Build updates
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;
    if (args.status !== undefined) updates.status = args.status;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;

    await ctx.db.patch(args.projectId, updates);

    return { success: true };
  },
});

/**
 * Delete project
 *
 * Authorization: Captain/Commodore/Admiral only
 * - Captain/Commodore: Can only delete projects in their organization
 * - Admiral: Can delete any project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Require Captain or higher
    requireCaptainOrHigher(rank);

    // Fetch project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check authorization
    if (rank !== "admiral") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (project.orgId !== orgId) {
        throw new Error("Unauthorized: Project not in your organization");
      }
    }

    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});
