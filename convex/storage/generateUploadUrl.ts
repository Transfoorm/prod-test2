import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user exists in our system
    const user = await ctx.db
      .query("admin_users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});
