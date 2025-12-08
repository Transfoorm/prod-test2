import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from Convex
    const user = await convex.query(api.domains.admin.users.api.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      firstName,
      lastName,
      entityName,
      socialName,
      orgSlug,
      businessCountry,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !entityName || !socialName || !orgSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call Convex mutation to update user profile
    await convex.mutation(api.domains.admin.users.api.completeSetup, {
      clerkId: userId,
      firstName,
      lastName,
      entityName,
      socialName,
      orgSlug,
      businessCountry,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle profile updates (firstName, lastName)
    if (body.firstName !== undefined || body.lastName !== undefined) {
      await convex.mutation(api.domains.admin.users.api.updateProfile, {
        clerkId: userId,
        firstName: body.firstName,
        lastName: body.lastName,
      });

      return NextResponse.json({ success: true });
    }

    // Handle entity updates (entityName, socialName, businessCountry)
    if (body.entityName !== undefined || body.socialName !== undefined || body.businessCountry !== undefined) {
      await convex.mutation(api.domains.admin.users.api.updateEntity, {
        clerkId: userId,
        entityName: body.entityName,
        socialName: body.socialName,
        businessCountry: body.businessCountry,
      });

      return NextResponse.json({ success: true });
    }

    // Fallback: Handle businessCountry only (for backward compatibility)
    if (body.businessCountry) {
      await convex.mutation(api.domains.admin.users.api.updateBusinessCountry, {
        clerkId: userId,
        businessCountry: body.businessCountry,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  } catch (error) {
    console.error('Profile patch error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
