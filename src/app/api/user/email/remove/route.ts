/**──────────────────────────────────────────────────────────────────────┐
│  🔒 SERVER-SIDE EMAIL MANAGEMENT                                       │
│  /api/user/email/remove                                                │
│                                                                        │
│  Bypasses Clerk's client-side step-up authentication                  │
│  by using backend API with admin privileges                           │
│                                                                        │
│  ADMIRAL SUPPORT:                                                      │
│  - Accepts optional targetUserId to verify permission                 │
│  - Requires Admiral rank when removing another user's email           │
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

    // Get email address ID and optional targetUserId from request body
    const { emailAddressId, targetUserId } = await req.json();

    // If targeting another user, verify Admiral permissions
    if (targetUserId && targetUserId !== userId) {
      console.log('[API EMAIL REMOVE] Admiral operation detected - targetUserId:', targetUserId);

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
        console.log('[API EMAIL REMOVE] Permission denied - user rank:', requestingUser.rank);
        return NextResponse.json(
          { error: "Permission denied - Admiral rank required to edit other users" },
          { status: 403 }
        );
      }

      console.log('[API EMAIL REMOVE] Admiral permission verified');
    }

    if (!emailAddressId || typeof emailAddressId !== 'string') {
      return NextResponse.json(
        { error: "Invalid email address ID" },
        { status: 400 }
      );
    }

    console.log('[API EMAIL REMOVE] Removing email for user:', userId);
    console.log('[API EMAIL REMOVE] Email ID:', emailAddressId);

    // Use Clerk backend API to delete email address
    // This bypasses client-side step-up authentication
    const client = await clerkClient();
    await client.emailAddresses.deleteEmailAddress(emailAddressId);

    console.log('[API EMAIL REMOVE] Email removed successfully:', emailAddressId);

    return NextResponse.json({
      success: true,
      message: "Email address removed successfully"
    });

  } catch (error) {
    console.error('[API EMAIL REMOVE] Error:', error);

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
      { error: "Failed to remove email address" },
      { status: 500 }
    );
  }
}
