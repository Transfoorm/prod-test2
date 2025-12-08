// FUSE Users Model - Business Logic Layer
// Following Convex Best Practices: Model-Driven Architecture

import { DatabaseReader, DatabaseWriter } from "@/convex/_generated/server";
import { THEME_DEFAULTS } from "@/convex/system/constants";
import { Doc } from "@/convex/_generated/dataModel";
import { RANK_SYSTEM_DEFAULTS, calculateTrialEndDate } from "@/fuse/constants/ranks";

// Core user business logic - pure TypeScript functions
export class UsersModel {

  // Create new user with defaults
  // 🛡️ UNIQUE CONSTRAINT: Prevents duplicate emails in database
  static async createUser(
    db: DatabaseWriter,
    args: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      setupStatus?: "invited" | "pending" | "abandon" | "complete" | "revoked";
      businessCountry?: string;
    }
  ): Promise<string> {
    // 🛡️ DUPLICATE CHECK: Enforce email uniqueness (Convex has no native unique constraint)
    const existingByEmail = await db
      .query("admin_users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingByEmail) {
      throw new Error(`User with email ${args.email} already exists`);
    }

    // 🛡️ DUPLICATE CHECK: Enforce clerkId uniqueness
    const existingByClerkId = await db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerkId) {
      throw new Error(`User with clerkId ${args.clerkId} already exists`);
    }

    const defaultMode = THEME_DEFAULTS.DEFAULT_MODE;
    const now = Date.now();

    // Calculate trial dates based on system defaults
    const trialDuration = RANK_SYSTEM_DEFAULTS.DEFAULT_TRIAL_DURATION;
    const trialEndsAt = calculateTrialEndDate(trialDuration, now);

    const userId = await db.insert("admin_users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName || '', // Empty string shows "Setup Incomplete" in UI
      lastName: args.lastName || '', // Empty string shows "Setup Incomplete" in UI
      avatarUrl: args.avatarUrl,
      // brandLogoUrl: NOT set by default - only when user uploads custom logo
      rank: RANK_SYSTEM_DEFAULTS.DEFAULT_RANK, // Default rank from system constants
      setupStatus: args.setupStatus || "pending", // Default setup status
      businessCountry: args.businessCountry || "AU", // Default business country
      themeDark: defaultMode, // Default mode (required field)
      // RANK-AWARE SYSTEM: Set trial period on signup
      subscriptionStatus: RANK_SYSTEM_DEFAULTS.DEFAULT_SUBSCRIPTION_STATUS,
      trialStartedAt: now,
      trialEndsAt,
      trialDuration,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now, // TTT-CERTIFIED: Account creation = first login
      loginCount: 1, // First login on signup (required field)
    });

    return userId;
  }

  // Get user by Clerk ID
  static async getUserByClerkId(
    db: DatabaseReader,
    clerkId: string
  ): Promise<Doc<"admin_users"> | null> {
    return await db
      .query("admin_users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  }

  // Get user theme preferences
  static async getUserThemePreferences(
    db: DatabaseReader,
    clerkId: string
  ): Promise<{ themeDark: boolean } | null> {
    const user = await this.getUserByClerkId(db, clerkId);

    if (!user) return null;

    return {
      themeDark: user.themeDark
    };
  }

  // Update user theme preferences
  static async updateThemePreferences(
    db: DatabaseWriter,
    clerkId: string,
    _themeName?: "transtheme", // Kept for API compatibility but not stored
    themeDark?: boolean
  ): Promise<{ themeDark: boolean }> {
    const existingUser = await this.getUserByClerkId(db, clerkId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    if (themeDark !== undefined) {
      await db.patch(existingUser._id, {
        themeDark,
        updatedAt: Date.now(),
      });
    }

    return {
      themeDark: themeDark !== undefined ? themeDark : existingUser.themeDark
    };
  }

  // Update user business country
  static async updateBusinessCountry(
    db: DatabaseWriter,
    clerkId: string,
    businessCountry: string
  ): Promise<Doc<"admin_users">> {
    // Find the user by clerkId
    const user = await this.getUserByClerkId(db, clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update the business country
    await db.patch(user._id, {
      businessCountry,
      updatedAt: Date.now(),
    });

    // Return the updated user
    const updatedUser = await db.get(user._id);
    if (!updatedUser) {
      throw new Error("Failed to retrieve updated user");
    }

    return updatedUser;
  }
}
