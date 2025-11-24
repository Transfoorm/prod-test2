/**──────────────────────────────────────────────────────────────────────┐
│  🔒 SERVER-SIDE EMAIL MANAGEMENT                                       │
│  /api/user/email/add                                                   │
│                                                                        │
│  Bypasses Clerk's client-side step-up authentication                  │
│  by using backend API with admin privileges                           │
│                                                                        │
│  ADMIRAL SUPPORT:                                                      │
│  - Accepts optional targetUserId to edit other users                  │
│  - Requires Admiral rank when targetUserId is provided                │
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

    // Get email and optional targetUserId from request body
    const { email, targetUserId } = await req.json();

    // Determine which user to operate on
    let targetUserClerkId = userId; // Default to session user

    // If targeting another user, verify Admiral permissions
    if (targetUserId && targetUserId !== userId) {
      console.log('[API EMAIL ADD] Admiral operation detected - targetUserId:', targetUserId);

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
        console.log('[API EMAIL ADD] Permission denied - user rank:', requestingUser.rank);
        return NextResponse.json(
          { error: "Permission denied - Admiral rank required to edit other users" },
          { status: 403 }
        );
      }

      console.log('[API EMAIL ADD] Admiral permission verified');
      targetUserClerkId = targetUserId;
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log('[API EMAIL ADD] Adding secondary email for user:', targetUserClerkId);
    console.log('[API EMAIL ADD] Email:', email);

    // Use Clerk backend API to create email address
    // This bypasses client-side step-up authentication
    // ADMIRAL GODMODE: Instant verification - user can login with new email + existing password
    const client = await clerkClient();
    const emailAddress = await client.emailAddresses.createEmailAddress({
      userId: targetUserClerkId,
      emailAddress: email,
      verified: true, // Admiral bypass - instant verification, no code required
    });

    console.log('[API EMAIL ADD] Email created successfully:', emailAddress.id);

    return NextResponse.json({
      success: true,
      emailAddress: {
        id: emailAddress.id,
        emailAddress: emailAddress.emailAddress,
        verification: emailAddress.verification,
      }
    });

  } catch (error) {
    console.error('[API EMAIL ADD] Error:', error);

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
      { error: "Failed to add email address" },
      { status: 500 }
    );
  }
}
