/**──────────────────────────────────────────────────────────────────────┐
│  🔌 PRODUCTIVITY DOMAIN QUERIES - SRS Layer 4                         │
│  /convex/domains/productivity/queries.ts                               │
│                                                                        │
│  Rank-based data scoping for productivity tools:                       │
│  • Crew: Organization-scoped (read/write their org's data)             │
│  • Captain/Commodore: Organization-scoped (full access)                │
│  • Admiral: All data (cross-org, platform-wide)                        │
│                                                                        │
│  SRS Commandment #4: Data scoping via Convex query filters            │
└────────────────────────────────────────────────────────────────────────┘ */

import { query } from "@/convex/_generated/server";
import type { QueryCtx } from "@/convex/_generated/server";

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
 * List email messages with rank-based scoping
 */
export const listEmails = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    if (rank === "admiral") {
      return await ctx.db.query("productivity_email_Messages").collect();
    } else {
      const orgId = user.orgSlug || "";
      return await ctx.db
        .query("productivity_email_Messages")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    }
  },
});

/**
 * List calendar events with rank-based scoping
 */
export const listCalendarEvents = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    if (rank === "admiral") {
      return await ctx.db.query("productivity_calendar_Events").collect();
    } else {
      const orgId = user.orgSlug || "";
      return await ctx.db
        .query("productivity_calendar_Events")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    }
  },
});

/**
 * List bookings with rank-based scoping
 */
export const listBookings = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    if (rank === "admiral") {
      return await ctx.db.query("productivity_bookings_Form").collect();
    } else {
      const orgId = user.orgSlug || "";
      return await ctx.db
        .query("productivity_bookings_Form")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    }
  },
});

/**
 * List meetings with rank-based scoping
 */
export const listMeetings = query({
  handler: async (ctx) => {
    const user = await getCurrentUserWithRank(ctx);
    const rank = user.rank || "crew";

    if (rank === "admiral") {
      return await ctx.db.query("productivity_pipeline_Prospects").collect();
    } else {
      const orgId = user.orgSlug || "";
      return await ctx.db
        .query("productivity_pipeline_Prospects")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
    }
  },
});
