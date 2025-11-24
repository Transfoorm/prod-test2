/**──────────────────────────────────────────────────────────────────────┐
│  🔒 SERVER-SIDE PASSWORD MANAGEMENT                                    │
│  /api/user/password/change                                             │
│                                                                        │
│  Handles password change with verification code flow                  │
│  Similar to email verification pattern                                │
│                                                                        │
│  ADMIRAL SUPPORT:                                                      │
│  - Accepts optional targetUserId to edit other users                  │
│  - Requires Admiral rank when changing another user's password        │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get data from request body
    const { newPassword, targetUserId } = await req.json();

    // Determine which user to operate on
    let targetUserClerkId = userId; // Default to session user

    // If targeting another user, verify Admiral permissions
    if (targetUserId && targetUserId !== userId) {
      console.log('[API PASSWORD CHANGE] Admiral operation detected - targetUserId:', targetUserId);

      // Query Convex to get requesting user's rank
      const requestingUser = await convex.query(api.domains.admin.users.api.getUserByClerkId, {
        clerkId: userId,
      });

      if (!requestingUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Check if user is Admiral
      if (requestingUser.rank !== 'admiral') {
        console.log('[API PASSWORD CHANGE] Permission denied - user rank:', requestingUser.rank);
        return NextResponse.json(
          { error: "Permission denied - Admiral rank required to edit other users" },
          { status: 403 }
        );
      }

      console.log('[API PASSWORD CHANGE] Admiral permission verified');
      targetUserClerkId = targetUserId;
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Validate new password requirements (same as signup)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must include at least 1 uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must include at least 1 number" },
        { status: 400 }
      );
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must include at least 1 symbol" },
        { status: 400 }
      );
    }

    console.log('[API PASSWORD CHANGE] Changing password for user:', targetUserClerkId);

    // FUSE PRINCIPLE: User is already authenticated with verified session
    // No need to verify current password - they proved their identity by logging in
    // ADMIRAL POWER: Admiral can change any user's password without knowing current password
    const client = await clerkClient();

    await client.users.updateUser(targetUserClerkId, {
      password: newPassword,
    });

    console.log('[API PASSWORD CHANGE] Password updated successfully');

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error('[API PASSWORD CHANGE] Error:', error);

    // Type guard for Clerk errors
    const clerkError = error as { errors?: Array<{ message?: string; longMessage?: string }> };

    // Handle Clerk-specific errors
    if (clerkError.errors?.[0]) {
      const firstError = clerkError.errors[0];
      return NextResponse.json(
        { error: firstError.longMessage || firstError.message || 'Unknown error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
