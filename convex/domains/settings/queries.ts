/**──────────────────────────────────────────────────────────────────────┐
│  ⚙️ SETTINGS DOMAIN QUERIES - SRS Layer 4                             │
│  /convex/domains/settings/queries.ts                                   │
│                                                                        │
│  All-rank self-scoped access to user settings and preferences          │
│  • Crew: Own settings only                                             │
│  • Captain: Own settings only                                          │
│  • Commodore: Own settings only                                        │
│  • Admiral: Own settings only                                          │
│                                                                        │
│  SRS Commandment #4: Data scoping via self-only user access           │
└────────────────────────────────────────────────────────────────────────┘ */

import { query } from "@/convex/_generated/server";
import type { QueryCtx } from "@/convex/_generated/server";

/**
 * Get current user's profile and settings
 *
 * SRS Layer 4: Self-Scoped Data Access
 * - All ranks can access their own settings
 * - Returns null if user not found (should never happen if authenticated)
 */
export const getUserSettings = query({
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    // Return user profile data for settings pages
    return {
      userProfile: {
        id: String(user._id),         // ✅ SOVEREIGNTY: Convex _id (canonical identity)
        convexId: String(user._id),   // Explicit alias for clarity
        clerkId: user.clerkId,        // ⚠️ Auth reference only
        email: user.email,
        secondaryEmail: user.secondaryEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        entityName: user.entityName,
        socialName: user.socialName,
        phoneNumber: user.phoneNumber,
        businessCountry: user.businessCountry,
        // Theme preferences
        themeDark: user.themeDark,
        // Miror AI preferences
        mirorAvatarProfile: user.mirorAvatarProfile,
        mirorEnchantmentEnabled: user.mirorEnchantmentEnabled,
        mirorEnchantmentTiming: user.mirorEnchantmentTiming,
        // System fields
        rank: user.rank,
        setupStatus: user.setupStatus,
        orgSlug: user.orgSlug,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      // Preferences (empty for now - can add separate preferences table later)
      preferences: [],
      // Notifications (empty for now - can add separate notifications table later)
      notifications: [],
    };
  },
});

/**
 * Get current user's Professional Genome
 *
 * SRS Layer 4: Self-Scoped Data Access
 * - Genome now lives in settings_account_Genome table
 * - Returns null if not yet created
 */
export const getUserGenome = query({
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    // Get genome from separate table
    const genome = await ctx.db
      .query("settings_account_Genome")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!genome) {
      // Return empty genome with 0% completion
      return {
        userId: user._id,
        completionPercent: 0,
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
      };
    }

    return genome;
  },
});
