/**──────────────────────────────────────────────────────────────────────┐
│  🔌 PRODUCTIVITY DOMAIN MUTATIONS - SMAC Layer 4                       │
│  /convex/domains/productivity/mutations.ts                             │
│                                                                        │
│  Productivity domain CRUD with rank-based authorization:               │
│  • Create: Captain/Commodore/Admiral only                              │
│  • Update: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Delete: Captain/Commodore/Admiral only (org-scoped)                 │
│  • Crew: Organization-scoped access (can create/update their org)      │
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

// ═══════════════════════════════════════════════════════════════════════
// EMAIL MUTATIONS
// ═══════════════════════════════════════════════════════════════════════

export const createEmail = mutation({
  args: {
    subject: v.string(),
    body: v.string(),
    from: v.string(),
    to: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const orgId = user.orgSlug || "";
    const now = Date.now();

    const emailId = await ctx.db.insert("prod_email_Messages", {
      ...args,
      orgId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, emailId };
  },
});

export const updateEmail = mutation({
  args: {
    emailId: v.id("prod_email_Messages"),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("sent"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const email = await ctx.db.get(args.emailId);
    if (!email) throw new Error("Email not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (email.orgId !== orgId) {
        throw new Error("Unauthorized: Email not in your organization");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.subject !== undefined) updates.subject = args.subject;
    if (args.body !== undefined) updates.body = args.body;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.emailId, updates);
    return { success: true };
  },
});

export const deleteEmail = mutation({
  args: { emailId: v.id("prod_email_Messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const email = await ctx.db.get(args.emailId);
    if (!email) throw new Error("Email not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (email.orgId !== orgId) {
        throw new Error("Unauthorized: Email not in your organization");
      }
    }

    await ctx.db.delete(args.emailId);
    return { success: true };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// CALENDAR MUTATIONS
// ═══════════════════════════════════════════════════════════════════════

export const createCalendarEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    attendees: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const orgId = user.orgSlug || "";
    const now = Date.now();

    const eventId = await ctx.db.insert("prod_cal_Events", {
      ...args,
      orgId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, eventId };
  },
});

export const updateCalendarEvent = mutation({
  args: {
    eventId: v.id("prod_cal_Events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    attendees: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (event.orgId !== orgId) {
        throw new Error("Unauthorized: Event not in your organization");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.attendees !== undefined) updates.attendees = args.attendees;

    await ctx.db.patch(args.eventId, updates);
    return { success: true };
  },
});

export const deleteCalendarEvent = mutation({
  args: { eventId: v.id("prod_cal_Events") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (event.orgId !== orgId) {
        throw new Error("Unauthorized: Event not in your organization");
      }
    }

    await ctx.db.delete(args.eventId);
    return { success: true };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// BOOKING MUTATIONS
// ═══════════════════════════════════════════════════════════════════════

export const createBooking = mutation({
  args: {
    clientName: v.string(),
    serviceType: v.string(),
    scheduledTime: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const orgId = user.orgSlug || "";
    const now = Date.now();

    const bookingId = await ctx.db.insert("prod_book_Bookings", {
      ...args,
      orgId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, bookingId };
  },
});

export const updateBooking = mutation({
  args: {
    bookingId: v.id("prod_book_Bookings"),
    clientName: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    scheduledTime: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (booking.orgId !== orgId) {
        throw new Error("Unauthorized: Booking not in your organization");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.clientName !== undefined) updates.clientName = args.clientName;
    if (args.serviceType !== undefined) updates.serviceType = args.serviceType;
    if (args.scheduledTime !== undefined) updates.scheduledTime = args.scheduledTime;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.bookingId, updates);
    return { success: true };
  },
});

export const deleteBooking = mutation({
  args: { bookingId: v.id("prod_book_Bookings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (booking.orgId !== orgId) {
        throw new Error("Unauthorized: Booking not in your organization");
      }
    }

    await ctx.db.delete(args.bookingId);
    return { success: true };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// MEETING MUTATIONS
// ═══════════════════════════════════════════════════════════════════════

export const createMeeting = mutation({
  args: {
    title: v.string(),
    participants: v.array(v.string()),
    scheduledTime: v.number(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const orgId = user.orgSlug || "";
    const now = Date.now();

    const meetingId = await ctx.db.insert("prod_pipe_Meetings", {
      ...args,
      orgId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { success: true, meetingId };
  },
});

export const updateMeeting = mutation({
  args: {
    meetingId: v.id("prod_pipe_Meetings"),
    title: v.optional(v.string()),
    participants: v.optional(v.array(v.string())),
    scheduledTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (meeting.orgId !== orgId) {
        throw new Error("Unauthorized: Meeting not in your organization");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.participants !== undefined) updates.participants = args.participants;
    if (args.scheduledTime !== undefined) updates.scheduledTime = args.scheduledTime;
    if (args.duration !== undefined) updates.duration = args.duration;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.meetingId, updates);
    return { success: true };
  },
});

export const deleteMeeting = mutation({
  args: { meetingId: v.id("prod_pipe_Meetings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithRank(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");

    const rank = user.rank || "crew";
    if (rank !== "admiral") {
      const orgId = user.orgSlug || "";
      if (meeting.orgId !== orgId) {
        throw new Error("Unauthorized: Meeting not in your organization");
      }
    }

    await ctx.db.delete(args.meetingId);
    return { success: true };
  },
});
