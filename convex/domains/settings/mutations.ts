/**──────────────────────────────────────────────────────────────────────┐
│  ⚙️ SETTINGS DOMAIN MUTATIONS - SRS Layer 3                           │
│  /convex/domains/settings/mutations.ts                                 │
│                                                                        │
│  All-rank self-scoped mutations for user settings                      │
│  Users can only update their own settings (enforced by auth check)     │
└────────────────────────────────────────────────────────────────────────┘ */

import { mutation } from "@/convex/_generated/server";
import type { MutationCtx } from "@/convex/_generated/server";
import { v } from "convex/values";

// Helper to calculate genome completion percentage
function calculateGenomeCompletion(genome: Record<string, unknown>): number {
  const fields = [
    'jobTitle', 'department', 'seniority',
    'industry', 'companySize', 'companyWebsite',
    'transformationGoal', 'transformationStage', 'transformationType', 'timelineUrgency',
    'howDidYouHearAboutUs', 'teamSize', 'annualRevenue', 'successMetric'
  ];

  let filled = 0;
  for (const field of fields) {
    const value = genome[field];
    if (value !== undefined && value !== null && value !== '') {
      filled++;
    }
  }

  return Math.round((filled / fields.length) * 100);
}

/**
 * Update user profile settings (non-genome fields)
 *
 * SRS Layer 3: Self-Scoped Mutations
 * - All ranks can update their own profile
 * - Cannot update other users' profiles
 */
export const updateUserSettings = mutation({
  args: {
    // Identity fields (verified externally)
    email: v.optional(v.string()),
    secondaryEmail: v.optional(v.string()),
    // Profile fields
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    businessCountry: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Get authenticated user from auth context (SRB-4 compliant)
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
 * SRS Layer 3: Self-Scoped Mutations
 * - All ranks can update their own theme preferences
 */
export const updateThemeSettings = mutation({
  args: {
    themeDark: v.optional(v.boolean()),
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
      themeDark: args.themeDark,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update Miror AI preferences
 *
 * SRS Layer 3: Self-Scoped Mutations
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

/**
 * Update Professional Genome
 *
 * SRS Layer 3: Self-Scoped Mutations
 * - Genome now lives in settings_account_Genome table
 * - Creates record if it doesn't exist
 */
export const updateGenome = mutation({
  args: {
    // Professional Identity
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
    // Company Context
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
    // Growth Intel
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

    // Check if genome record exists
    const existingGenome = await ctx.db
      .query("settings_account_Genome")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingGenome) {
      // Update existing genome
      const updates = { ...args, updatedAt: now };
      const completionPercent = calculateGenomeCompletion({ ...existingGenome, ...args });

      await ctx.db.patch(existingGenome._id, {
        ...updates,
        completionPercent,
      });
    } else {
      // Create new genome record
      const completionPercent = calculateGenomeCompletion(args);

      await ctx.db.insert("settings_account_Genome", {
        userId: user._id,
        ...args,
        completionPercent,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Reset Professional Genome
 *
 * SRS Layer 3: Self-Scoped Mutations
 * - Clears all genome fields, sets completion to 0%
 */
export const resetGenome = mutation({
  handler: async (ctx: MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if genome record exists
    const existingGenome = await ctx.db
      .query("settings_account_Genome")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingGenome) {
      await ctx.db.patch(existingGenome._id, {
        // Professional Identity
        jobTitle: undefined,
        department: undefined,
        seniority: undefined,
        // Company Context
        industry: undefined,
        companySize: undefined,
        companyWebsite: undefined,
        // Transformation Journey
        transformationGoal: undefined,
        transformationStage: undefined,
        transformationType: undefined,
        timelineUrgency: undefined,
        // Growth Intel
        howDidYouHearAboutUs: undefined,
        teamSize: undefined,
        annualRevenue: undefined,
        successMetric: undefined,
        // Meta
        completionPercent: 0,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
