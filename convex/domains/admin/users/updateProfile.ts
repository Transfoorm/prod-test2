// Update User Profile - Convex Mutation
// Following Model-Driven Architecture

import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { UsersModel } from "./model";

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    businessCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    // Validate entityName length
    if (args.entityName && args.entityName.length > 50) {
      throw new Error("Entity name must be 50 characters or less");
    }

    // Update user profile
    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      entityName: args.entityName,
      socialName: args.socialName,
      businessCountry: args.businessCountry,
      updatedAt: Date.now(),
    });

    // Return updated user
    return await ctx.db.get(user._id);
  },
});
