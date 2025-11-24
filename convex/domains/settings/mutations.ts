/**──────────────────────────────────────────────────────────────────────┐
│  ⚙️ SETTINGS DOMAIN MUTATIONS - SMAC Layer 3                           │
│  /convex/domains/settings/mutations.ts                                 │
│                                                                        │
│  All-rank self-scoped mutations for user settings                      │
│  Users can only update their own settings (enforced by auth check)     │
└────────────────────────────────────────────────────────────────────────┘ */

import { mutation } from "@/convex/_generated/server";
import type { MutationCtx } from "@/convex/_generated/server";
import { v } from "convex/values";

/**
 * Update user profile settings
 *
 * SMAC Layer 3: Self-Scoped Mutations
 * - All ranks can update their own profile
 * - Cannot update other admin_users' profiles
 */
export const updateUserSettings = mutation({
  args: {
    // Profile fields
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    businessCountry: v.optional(v.string()),
    // Professional Genome
    jobTitle: v.optional(v.string()),
    department: v.optional(v.string()),
    seniority: v.optional(v.union(
      v.literal("staff"),
      v.literal("admin"),
      v.literal("consultant"),
      v.literal("contractor"),
      v.literal("coach"),
      v.literal("advisor"),
      v.literal("manager"),
      v.literal("director"),
      v.literal("executive"),
      v.literal("founder")
    )),
    industry: v.optional(v.string()),
    companySize: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-1000"),
      v.literal("1001-5000"),
      v.literal("5001+")
    )),
    companyWebsite: v.optional(v.string()),
    // Transformation Journey
    transformationGoal: v.optional(v.string()),
    transformationStage: v.optional(v.union(
      v.literal("exploring"),
      v.literal("planning"),
      v.literal("executing"),
      v.literal("scaling")
    )),
    transformationType: v.optional(v.union(
      v.literal("digital"),
      v.literal("operational"),
      v.literal("cultural"),
      v.literal("product"),
      v.literal("go_to_market")
    )),
    timelineUrgency: v.optional(v.union(
      v.literal("exploratory"),
      v.literal("3_6_months"),
      v.literal("immediate")
    )),
    howDidYouHearAboutUs: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    annualRevenue: v.optional(v.string()),
    successMetric: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Update user with provided fields
    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update theme preferences
 *
 * SMAC Layer 3: Self-Scoped Mutations
 * - All ranks can update their own theme preferences
 */
export const updateThemeSettings = mutation({
  args: {
    themeDark: v.optional(v.boolean()),
    themeName: v.optional(v.literal("transtheme")),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update Miror AI preferences
 *
 * SMAC Layer 3: Self-Scoped Mutations
 * - All ranks can update their own Miror AI preferences
 */
export const updateMirorSettings = mutation({
  args: {
    mirorAvatarProfile: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("inclusive")
    )),
    mirorEnchantmentEnabled: v.optional(v.boolean()),
    mirorEnchantmentTiming: v.optional(v.union(
      v.literal("subtle"),
      v.literal("magical"),
      v.literal("playful")
    )),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
