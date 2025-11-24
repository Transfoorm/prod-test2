/**──────────────────────────────────────────────────────────────────────┐
│  🔒 SERVER-SIDE EMAIL MANAGEMENT                                       │
│  /api/user/email/make-primary                                          │
│                                                                        │
│  ADMIRAL SUPPORT:                                                      │
│  - Accepts optional targetUserId to edit other users                  │
│  - Requires Admiral rank when changing another user's primary email   │
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

    // Determine which user to operate on
    let targetUserClerkId = userId; // Default to session user

    // If targeting another user, verify Admiral permissions
    if (targetUserId && targetUserId !== userId) {
      console.log('[API MAKE PRIMARY] Admiral operation detected - targetUserId:', targetUserId);

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
        console.log('[API MAKE PRIMARY] Permission denied - user rank:', requestingUser.rank);
        return NextResponse.json(
          { error: "Permission denied - Admiral rank required to edit other users" },
          { status: 403 }
        );
      }

      console.log('[API MAKE PRIMARY] Admiral permission verified');
      targetUserClerkId = targetUserId;
    }

    if (!emailAddressId || typeof emailAddressId !== 'string') {
      return NextResponse.json(
        { error: "Invalid email address ID" },
        { status: 400 }
      );
    }

    console.log('[API MAKE PRIMARY] Changing primary email for user:', targetUserClerkId);
    console.log('[API MAKE PRIMARY] New primary email ID:', emailAddressId);

    // Use Clerk backend API to update primary email
    // This bypasses client-side step-up authentication
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(targetUserClerkId, {
      primaryEmailAddressID: emailAddressId
    });

    console.log('[API MAKE PRIMARY] Primary email updated successfully');
    console.log('[API MAKE PRIMARY] New primary:', updatedUser.primaryEmailAddress?.emailAddress);

    // Return the updated email addresses
    const primaryEmail = updatedUser.primaryEmailAddress?.emailAddress;
    const secondaryEmail = updatedUser.emailAddresses.find(
      e => e.id !== updatedUser.primaryEmailAddressId
    )?.emailAddress || null;

    return NextResponse.json({
      success: true,
      primaryEmail,
      secondaryEmail,
      message: "Primary email updated successfully"
    });

  } catch (error) {
    console.error('[API MAKE PRIMARY] Error:', error);

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
      { error: "Failed to update primary email" },
      { status: 500 }
    );
  }
}
