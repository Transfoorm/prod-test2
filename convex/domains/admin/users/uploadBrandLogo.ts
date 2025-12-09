/**──────────────────────────────────────────────────────────────────────┐
│  🏷️ UPLOAD BRAND LOGO - Company Logo Storage                          │
│  /convex/domains/admin/users/uploadBrandLogo.ts                        │
│                                                                        │
│  🛡️ SID-5.3 COMPLIANT: Accepts userId: v.id("admin_users")            │
│  Sovereign identity lookup via ctx.db.get()                            │
└────────────────────────────────────────────────────────────────────────┘ */

import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";

export const uploadBrandLogo = mutation({
  args: {
    fileId: v.id("_storage"),
    // 🛡️ SID-5.3: Accept sovereign userId, not clerkId
    userId: v.id("admin_users"),
  },
  handler: async (ctx, args) => {
    const { fileId, userId } = args;

    // 🛡️ SID-5.3: Direct lookup by sovereign _id
    const user = await ctx.db.get(userId);

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
    console.log(`✅ Brand logo uploaded: Storage ID ${fileId} saved to user ${userId}`);

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
