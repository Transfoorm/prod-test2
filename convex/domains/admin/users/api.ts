// FUSE Users API - Domain Wrapper Layer
import { query, mutation } from "@/convex/_generated/server";
import type { QueryCtx, MutationCtx } from "@/convex/_generated/server";
import { v } from "convex/values";
import { UsersModel } from "./model";
import { isTrialExpired, isInGracePeriod } from "@/fuse/constants/ranks";

// ══════════════════════════════════════════════════════════════════════
// AUTHORIZATION HELPER
// ══════════════════════════════════════════════════════════════════════

/**
 * Check if the current user is an Admiral (server-side authorization)
 * Uses Convex auth context to get the authenticated user
 * Throws error if user is not authenticated or not an Admiral
 */
async function requireAdmiral(ctx: QueryCtx | MutationCtx) {
  // Get authenticated user from Convex auth context
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    console.error('❌ requireAdmiral: No identity');
    throw new Error("Unauthorized: Authentication required");
  }

  // Get user from database by Clerk ID
  const currentUser = await UsersModel.getUserByClerkId(ctx.db, identity.subject);

  if (!currentUser) {
    console.error('❌ requireAdmiral: User not found for clerkId:', identity.subject);
    throw new Error("User not found");
  }

  // Check rank (case-insensitive)
  if (currentUser.rank?.toLowerCase() !== "admiral") {
    console.error(`❌ requireAdmiral: User ${currentUser.email} has rank "${currentUser.rank}", needs "admiral"`);
    throw new Error("Unauthorized: Admiral rank required");
  }

  console.log(`✅ requireAdmiral: User ${currentUser.email} authorized as Admiral`);
  return currentUser;
}

// QUERIES

// Get all admin_users (Admiral-only, for user management)
// TTT-CERTIFIED: Update lastLoginAt, increment loginCount, and check trial expiration on every login
export const updateLastLogin = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const updates: Partial<typeof user> = {
      lastLoginAt: now,
      loginCount: (user.loginCount || 0) + 1,
      updatedAt: now,
    };

    // RANK-AWARE SYSTEM: Check trial expiration (TTT-compliant, login-check only)
    // Only check if user is on trial or has expired status
    if (user.subscriptionStatus === "trial" || user.subscriptionStatus === "expired") {
      const expired = isTrialExpired(user.trialEndsAt);
      const inGrace = isInGracePeriod(user.trialEndsAt);

      if (expired && !inGrace) {
        // Trial expired and grace period ended → Demote to Crew
        updates.rank = "crew";
        updates.subscriptionStatus = "expired";
      } else if (expired && inGrace) {
        // In grace period → Keep Captain but mark as expired
        updates.subscriptionStatus = "expired";
      }
      // If not expired, keep current status (trial continues)
    }

    // Lifetime and active subscriptions never expire, skip checks

    await ctx.db.patch(user._id, updates);

    return {
      success: true,
      trialExpired: updates.subscriptionStatus === "expired",
      demotedToCrew: updates.rank === "crew",
    };
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    // 🔒 SECURITY: Admiral-only access (return empty if unauthorized)
    try {
      await requireAdmiral(ctx);
    } catch {
      return []; // Return empty array instead of throwing
    }

    // Get all admin_users from database (ordered by _creationTime DESC - latest first)
    const admin_users = await ctx.db.query("admin_users").order("desc").collect();
    console.log(`✅ getAllUsers: Returning ${admin_users.length} admin_users (sorted by _creationTime DESC - v2)`);

    // Return with basic info (no sensitive data)
    return admin_users.map(user => ({
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      entityName: user.entityName,
      socialName: user.socialName,
      phoneNumber: user.phoneNumber,
      rank: user.rank,
      setupStatus: user.setupStatus,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount || 0,
    }));
  },
});

// Get paginated admin_users (Admiral-only, for large-scale user management)
export const getAllUsersPaginated = query(async (ctx) => {
  // 🔒 SECURITY: Admiral-only access (return empty if unauthorized)
  try {
    await requireAdmiral(ctx);
  } catch {
    return []; // Return empty array instead of throwing
  }

  // Query all admin_users with descending order
  const admin_users = await ctx.db.query("admin_users").order("desc").collect();

  // Return with basic info (no sensitive data)
  return admin_users.map(user => ({
    _id: user._id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    entityName: user.entityName,
    socialName: user.socialName,
    phoneNumber: user.phoneNumber,
    rank: user.rank,
    setupStatus: user.setupStatus,
    createdAt: user.createdAt,
  }));
});

// Get user by Convex ID for editing (Admiral-only, TTT-compliant)
export const getUserForEdit = query({
  args: { userId: v.id("admin_users") },
  handler: async (ctx, args) => {
    // 🔒 SECURITY: Admiral-only access (return null if unauthorized)
    try {
      await requireAdmiral(ctx);
    } catch {
      return null; // Return null instead of throwing
    }

    // Direct document fetch - TTT-passing performance
    const user = await ctx.db.get(args.userId);

    if (!user) return null;

    // Resolve storage URL for avatar (check avatarUrl first, fallback to imageUrl for migration)
    const avatarField = user.avatarUrl || user.imageUrl;
    let avatarUrl = null;

    if (avatarField) {
      try {
        // Try to resolve as storage ID
        const url = await ctx.storage.getUrl(avatarField);
        avatarUrl = url;
      } catch {
        // Fallback to direct URL string if it's an HTTP URL
        if (typeof avatarField === 'string' && avatarField.startsWith('http')) {
          avatarUrl = avatarField;
        }
      }
    }

    // Return complete user document with resolved avatar URL
    return {
      ...user,
      avatarUrl, // Override with resolved URL
    };
  },
});

// ⚡ FUSE 5.0: Lightweight query for session minting (skips expensive storage URL resolution)
// Used during login critical path where storage URLs aren't needed yet (only raw data for JWT)
export const getCurrentUserForSession = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const start = Date.now();
    console.log(`⚡ getCurrentUserForSession: START for clerkId=${args.clerkId}`);

    // Direct model query - no storage URL resolution (2400ms → ~10ms)
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    console.log(`⚡ getCurrentUserForSession: DONE in ${Date.now() - start}ms`);
    return user;
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) return null;

    // Resolve storage URL for avatar (check avatarUrl first, fallback to imageUrl for migration)
    const avatarField = user.avatarUrl || user.imageUrl;
    let avatarUrl = null;

    if (avatarField) {
      try {
        // Try to resolve as storage ID
        const url = await ctx.storage.getUrl(avatarField);
        avatarUrl = url;
      } catch {
        // Fallback to direct URL string if it's an HTTP URL
        if (typeof avatarField === 'string' && avatarField.startsWith('http')) {
          avatarUrl = avatarField;
        }
      }
    }

    // Resolve storage URL for brand logo
    let brandLogoUrl = null;

    if (user.brandLogoUrl) {
      try {
        // Try to resolve as storage ID
        const url = await ctx.storage.getUrl(user.brandLogoUrl);
        brandLogoUrl = url;
      } catch {
        // Fallback to direct URL string if it's an HTTP URL
        if (typeof user.brandLogoUrl === 'string' && user.brandLogoUrl.startsWith('http')) {
          brandLogoUrl = user.brandLogoUrl;
        }
      }
    }

    return {
      ...user,
      avatarUrl,
      brandLogoUrl
    };
  },
});

// Get RAW user document for Database tab with ALL schema fields (Admiral-only, TTT-compliant)
export const getRawUserDocument = query({
  args: { userId: v.id("admin_users") },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Only admirals can view raw documents
    const currentUser = await UsersModel.getUserByClerkId(ctx.db, identity.subject);
    if (!currentUser || currentUser.rank !== 'admiral') {
      throw new Error("Unauthorized: Admiral access required");
    }

    // Direct document fetch - TTT-passing performance
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Return the raw user object - Convex already includes all schema fields
    // Missing fields will be undefined (shown as null in JSON)
    return {
      ...user,
      _id: user._id.toString() // Convert ID to string for display
    };
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) return null;

    // Resolve storage URL for avatar
    const avatarField = user.avatarUrl || user.imageUrl;
    let avatarUrl = null;

    if (avatarField) {
      try {
        const url = await ctx.storage.getUrl(avatarField);
        avatarUrl = url;
      } catch {
        if (typeof avatarField === 'string' && avatarField.startsWith('http')) {
          avatarUrl = avatarField;
        }
      }
    }

    return {
      ...user,
      avatarUrl
    };
  },
});

export const getUserThemePreferences = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await UsersModel.getUserThemePreferences(ctx.db, args.clerkId);
  },
});

// MUTATIONS
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    setupStatus: v.optional(v.union(
      v.literal("invited"),
      v.literal("pending"),
      v.literal("abandon"),
      v.literal("complete"),
      v.literal("revoked")
    )),
    businessCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await UsersModel.createUser(ctx.db, args);
  },
});

export const updateThemePreferences = mutation({
  args: {
    clerkId: v.string(),
    themeName: v.optional(v.literal("transtheme")),
    themeDark: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    return await UsersModel.updateThemePreferences(
      ctx.db,
      args.clerkId,
      args.themeName,
      args.themeDark
    );
  },
});

export const updateMirorAvatarProfile = mutation({
  args: {
    clerkId: v.string(),
    mirorAvatarProfile: v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("inclusive")
    )
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      mirorAvatarProfile: args.mirorAvatarProfile,
      updatedAt: Date.now(),
    });

    return { success: true, mirorAvatarProfile: args.mirorAvatarProfile };
  },
});

export const updateMirorEnchantment = mutation({
  args: {
    clerkId: v.string(),
    mirorEnchantmentEnabled: v.boolean()
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      mirorEnchantmentEnabled: args.mirorEnchantmentEnabled,
      updatedAt: Date.now(),
    });

    return { success: true, mirorEnchantmentEnabled: args.mirorEnchantmentEnabled };
  },
});

export const updateMirorEnchantmentTiming = mutation({
  args: {
    clerkId: v.string(),
    mirorEnchantmentTiming: v.union(
      v.literal("subtle"),
      v.literal("magical"),
      v.literal("playful")
    )
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      mirorEnchantmentTiming: args.mirorEnchantmentTiming,
      updatedAt: Date.now(),
    });

    return { success: true, mirorEnchantmentTiming: args.mirorEnchantmentTiming };
  },
});

export const updateBusinessCountry = mutation({
  args: {
    clerkId: v.string(),
    businessCountry: v.string(),
  },
  handler: async (ctx, args) => {
    return await UsersModel.updateBusinessCountry(
      ctx.db,
      args.clerkId,
      args.businessCountry
    );
  },
});

export const completeSetup = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    entityName: v.string(),
    socialName: v.string(),
    orgSlug: v.string(),
    businessCountry: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      entityName: args.entityName,
      socialName: args.socialName,
      orgSlug: args.orgSlug,
      businessCountry: args.businessCountry,
      emailVerified: args.emailVerified,
      setupStatus: "complete",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    businessCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<typeof user> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.entityName !== undefined) {
      updates.entityName = args.entityName;
      // Regenerate orgSlug when entity name changes
      updates.orgSlug = args.entityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (args.socialName !== undefined) updates.socialName = args.socialName;
    if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;
    if (args.businessCountry !== undefined) updates.businessCountry = args.businessCountry;

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

export const updateEntity = mutation({
  args: {
    clerkId: v.string(),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    businessCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<typeof user> = {
      updatedAt: Date.now(),
    };

    if (args.entityName !== undefined) {
      updates.entityName = args.entityName;
      // Regenerate orgSlug when entity name changes
      updates.orgSlug = args.entityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (args.socialName !== undefined) updates.socialName = args.socialName;
    if (args.businessCountry !== undefined) updates.businessCountry = args.businessCountry;

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// Reset/clear all professional genome fields
export const resetProfessionalGenome = mutation({
  args: {
    userId: v.id("admin_users"),
  },
  handler: async (ctx, args) => {
    // Clear all professional genome fields
    await ctx.db.patch(args.userId, {
      jobTitle: '',
      department: '',
      seniority: undefined,
      industry: '',
      companySize: undefined,
      companyWebsite: '',
      transformationGoal: '',
      transformationStage: undefined,
      transformationType: undefined,
      timelineUrgency: undefined,
      howDidYouHearAboutUs: '',
      teamSize: 0,
      annualRevenue: '',
      successMetric: '',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateProfessionalGenome = mutation({
  args: {
    clerkId: v.string(),
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
      v.literal("founder"),
      v.literal("")
    )),
    // Company Context
    industry: v.optional(v.string()),
    companySize: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-1000"),
      v.literal("1001-5000"),
      v.literal("5001+"),
      v.literal("")
    )),
    companyWebsite: v.optional(v.string()),
    // Transformation Journey
    transformationGoal: v.optional(v.string()),
    transformationStage: v.optional(v.union(
      v.literal("exploring"),
      v.literal("planning"),
      v.literal("executing"),
      v.literal("scaling"),
      v.literal("")
    )),
    transformationType: v.optional(v.union(
      v.literal("digital"),
      v.literal("operational"),
      v.literal("cultural"),
      v.literal("product"),
      v.literal("go_to_market"),
      v.literal("")
    )),
    timelineUrgency: v.optional(v.union(
      v.literal("exploratory"),
      v.literal("3_6_months"),
      v.literal("immediate"),
      v.literal("")
    )),
    // Growth Intel
    howDidYouHearAboutUs: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    annualRevenue: v.optional(v.string()),
    successMetric: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<typeof user> = {
      updatedAt: Date.now(),
    };

    // Professional Identity
    if (args.jobTitle !== undefined) updates.jobTitle = args.jobTitle;
    if (args.department !== undefined) updates.department = args.department;
    if (args.seniority !== undefined) updates.seniority = args.seniority || undefined;

    // Company Context
    if (args.industry !== undefined) updates.industry = args.industry;
    if (args.companySize !== undefined) updates.companySize = args.companySize || undefined;
    if (args.companyWebsite !== undefined) updates.companyWebsite = args.companyWebsite;

    // Transformation Journey
    if (args.transformationGoal !== undefined) updates.transformationGoal = args.transformationGoal;
    if (args.transformationStage !== undefined) updates.transformationStage = args.transformationStage || undefined;
    if (args.transformationType !== undefined) updates.transformationType = args.transformationType || undefined;
    if (args.timelineUrgency !== undefined) updates.timelineUrgency = args.timelineUrgency || undefined;

    // Growth Intel
    if (args.howDidYouHearAboutUs !== undefined) updates.howDidYouHearAboutUs = args.howDidYouHearAboutUs;
    if (args.teamSize !== undefined) updates.teamSize = args.teamSize;
    if (args.annualRevenue !== undefined) updates.annualRevenue = args.annualRevenue;
    if (args.successMetric !== undefined) updates.successMetric = args.successMetric;

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// Webhook mutation to sync user data from Clerk
export const syncUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    secondaryEmail: v.optional(v.union(v.string(), v.null())),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    // Auto-create user if doesn't exist (fallback for webhook safety)
    if (!user) {
      console.log(`[syncUserFromClerk] User not found, auto-creating for clerkId=${args.clerkId}`);
      return await UsersModel.createUser(ctx.db, {
        clerkId: args.clerkId,
        email: args.email || '',
        emailVerified: args.emailVerified,
        firstName: args.firstName,
        lastName: args.lastName,
        avatarUrl: args.avatarUrl,
      });
    }

    const updates: Partial<typeof user> = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) updates.email = args.email;
    if (args.emailVerified !== undefined) updates.emailVerified = args.emailVerified;
    if (args.secondaryEmail !== undefined) updates.secondaryEmail = args.secondaryEmail;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// ═══════════════════════════════════════════════════════════════════
// 🔥 VANISH PROTOCOL 2.1 - USER DELETION MUTATIONS & ACTIONS
// ═══════════════════════════════════════════════════════════════════

// Export deletion mutations from /convex/vanish/
export { deleteCurrentUser } from "@/convex/vanish/deleteCurrentUser";
export { deleteAnyUser } from "@/convex/vanish/deleteAnyUser";

// Export deletion actions (for HTTP operations like Clerk deletion)
export { deleteAnyUserWithClerk } from "@/convex/vanish/deleteAnyUserAction";

// Export audit log update mutation
export { updateClerkDeletionStatus } from "@/convex/vanish/updateClerkDeletionStatus";

// Export VANISH Journal management
export { deleteDeletionLog } from "@/convex/vanish/deleteDeletionLog";

// Get all deletion logs (Admiral-only, for audit trail)
export const getAllDeletionLogs = query({
  handler: async (ctx) => {
    // 🔒 SECURITY: Admiral-only access (return empty if unauthorized)
    try {
      await requireAdmiral(ctx);
    } catch {
      return []; // Return empty array instead of throwing
    }

    const logs = await ctx.db.query("admin_users_DeletionLogs")
      .order("desc")
      .collect();
    return logs;
  },
});

// ═══════════════════════════════════════════════════════════════════
// 🎖️ RANK-AWARE SYSTEM - SUBSCRIPTION & TRIAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// Export subscription mutations (Admiral god-mode controls)
export {
  setUserTrial,
  extendUserTrial,
  setUserSubscription,
  grantLifetimeAccess,
  setUserRank,
  bulkSetSubscription,
} from "./mutations/subscription";

// Export subscription stats queries (Admiral dashboard)
export {
  getSubscriptionStats,
  getExpiringTrials,
  getRankDistribution,
} from "./queries/subscriptionStats";

// ═══════════════════════════════════════════════════════════════════
// 🏢 BRAND LOGO MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// Export brand logo upload mutation
export { uploadBrandLogo } from "./uploadBrandLogo";

