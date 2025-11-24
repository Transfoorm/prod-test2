/**──────────────────────────────────────────────────────────────────────┐
│  🔌 PROJECT DOMAIN QUERIES - SMAC Layer 4                              │
│  /convex/domains/projects/queries.ts                                   │
│                                                                        │
│  Rank-based data scoping for project management:                       │
│  • Crew: Assigned projects only                                        │
│  • Captain: Organization-scoped projects                               │
│  • Commodore: Organization-scoped projects                             │
│  • Admiral: All projects (cross-org, platform-wide)                    │
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
 * List projects with rank-based scoping
 *
 * SMAC Layer 4: Data Scoping
 * - Crew: Only assigned projects
 * - Captain/Commodore: Organization-scoped
 * - Admiral: All projects (cross-org)
 */
export const listProjects = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    let projects;

    if (rank === "admiral") {
      // Admiral: See ALL projects (cross-org, platform-wide)
      projects = await ctx.db.query("projects").collect();
    } else if (rank === "captain" || rank === "commodore") {
      // Captain/Commodore: Organization-scoped
      const orgId = user.orgSlug || "";
      projects = await ctx.db
        .query("projects")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    } else {
      // Crew: Assigned projects only
      projects = await ctx.db
        .query("projects")
        .withIndex("by_assigned", (q) => q.eq("assignedTo", user._id))
        .collect();
    }

    return projects;
  },
});

/**
 * Get single project by ID with rank-based authorization
 *
 * SMAC Layer 4: Data Scoping
 * - Validates user has access to this specific project
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    // Fetch project
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Check authorization based on rank
    if (rank === "admiral") {
      // Admiral: Access all projects
      return project;
    } else if (rank === "captain" || rank === "commodore") {
      // Captain/Commodore: Must match organization
      const orgId = user.orgSlug || "";
      if (project.orgId !== orgId) {
        throw new Error("Unauthorized: Project not in your organization");
      }
      return project;
    } else {
      // Crew: Must be assigned to this project
      if (project.assignedTo?.toString() !== user._id.toString()) {
        throw new Error("Unauthorized: Project not assigned to you");
      }
      return project;
    }
  },
});
