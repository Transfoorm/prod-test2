import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";

export const uploadAvatar = mutation({
  args: {
    fileId: v.id("_storage"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { fileId, clerkId } = args;

    // Find the user by clerkId
    const user = await ctx.db
      .query("admin_users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Store the old storage ID before updating
    const oldStorageId = user.avatarUrl;

    // Update user with new avatar storage ID (not URL)
    await ctx.db.patch(user._id, {
      avatarUrl: fileId,
      updatedAt: Date.now(),
    });
    console.log(`✅ Avatar uploaded: Storage ID ${fileId} saved to user ${clerkId}`);

    // Delete the old avatar from storage if it exists and it's a storage ID
    if (oldStorageId && typeof oldStorageId === 'string') {
      // Check if it's a Convex storage ID (not an HTTP URL)
      if (!oldStorageId.startsWith('http')) {
        try {
          await ctx.storage.delete(oldStorageId as Id<"_storage">);
          console.log(`🗑️ Deleted old avatar from storage: ${oldStorageId}`);
        } catch (error) {
          console.error("❌ Failed to delete old avatar:", error);
        }
      } else {
        console.log(`⏭️ Skipped deletion - old avatar is legacy URL: ${oldStorageId.substring(0, 50)}...`);
      }
    }

    return { storageId: fileId };
  },
});
