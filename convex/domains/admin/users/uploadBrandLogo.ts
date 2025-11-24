import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";

export const uploadBrandLogo = mutation({
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
    const oldStorageId = user.brandLogoUrl;

    // Update user with new brand logo storage ID (not URL)
    await ctx.db.patch(user._id, {
      brandLogoUrl: fileId,
      updatedAt: Date.now(),
    });
    console.log(`✅ Brand logo uploaded: Storage ID ${fileId} saved to user ${clerkId}`);

    // Delete the old brand logo from storage if it exists and it's a storage ID
    if (oldStorageId && typeof oldStorageId === 'string') {
      // Check if it's a Convex storage ID (not an HTTP URL)
      if (!oldStorageId.startsWith('http')) {
        try {
          await ctx.storage.delete(oldStorageId as Id<"_storage">);
          console.log(`🗑️ Deleted old brand logo from storage: ${oldStorageId}`);
        } catch (error) {
          console.error("❌ Failed to delete old brand logo:", error);
        }
      } else {
        console.log(`⏭️ Skipped deletion - old brand logo is legacy URL: ${oldStorageId.substring(0, 50)}...`);
      }
    }

    return { storageId: fileId };
  },
});
