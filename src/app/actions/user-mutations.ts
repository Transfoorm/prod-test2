/**
 * 🛡️ FUSE Stack Server Actions - Cookie-Aware User Mutations
 *
 * These server actions wrap Convex mutations and automatically update session cookies,
 * eliminating the need for manual session refresh calls.
 *
 * ARCHITECTURE:
 * Component → Server Action → Convex Mutation + Cookie Update → ClientHydrator → FUSE State
 *
 * This maintains the Golden Bridge automation principle.
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { readSessionCookie, mintSession } from '@/fuse/hydration/session/cookie';
import { cookies } from 'next/headers';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Update business country and auto-update session cookie
 */
export async function updateBusinessCountryAction(businessCountry: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Call Convex mutation
    await convex.mutation(api.domains.admin.users.api.updateBusinessCountry, {
      clerkId: userId,
      businessCountry,
    });

    // Fetch fresh user data (getCurrentUser resolves storage IDs to URLs)
    const freshUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
      clerkId: userId,
    });

    if (!freshUser) throw new Error('User not found');

    // Read current session to preserve fields not in Convex
    const session = await readSessionCookie();

    // Mint new session with updated data
    const token = await mintSession({
      _id: String(freshUser._id),
      clerkId: freshUser.clerkId,
      email: freshUser.email || session?.email || '',
      secondaryEmail: freshUser.secondaryEmail || undefined,
      firstName: freshUser.firstName || session?.firstName,
      lastName: freshUser.lastName || session?.lastName,
      avatarUrl: freshUser.avatarUrl || undefined,
      brandLogoUrl: freshUser.brandLogoUrl || undefined,
      rank: freshUser.rank as string,
      setupStatus: freshUser.setupStatus as string,
      businessCountry: freshUser.businessCountry as string,
      entityName: freshUser.entityName as string,
      socialName: freshUser.socialName as string,
      themeMode: freshUser.themeDark ? 'dark' : 'light',
      mirorAvatarProfile: freshUser.mirorAvatarProfile as 'male' | 'female' | 'inclusive' | undefined,
      mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming as 'subtle' | 'magical' | 'playful' | undefined,
    });

    // Update cookie (Server Action context - set directly on cookies store)
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('FUSE_5.0', token, {
      httpOnly: false, // Must be false for client-side hydration
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error) {
    console.error('updateBusinessCountryAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Complete setup and auto-update session cookie
 */
export async function completeSetupAction(data: {
  firstName: string;
  lastName: string;
  entityName: string;
  socialName: string;
  orgSlug: string;
  businessCountry?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Call Convex mutation
    await convex.mutation(api.domains.admin.users.api.completeSetup, {
      clerkId: userId,
      ...data,
    });

    // Fetch fresh user data (getCurrentUser resolves storage IDs to URLs)
    const freshUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
      clerkId: userId,
    });

    if (!freshUser) throw new Error('User not found');

    // Read current session
    const session = await readSessionCookie();

    // Mint new session with updated data
    const token = await mintSession({
      _id: String(freshUser._id),
      clerkId: freshUser.clerkId,
      email: freshUser.email || session?.email || '',
      secondaryEmail: freshUser.secondaryEmail || undefined,
      firstName: freshUser.firstName || session?.firstName,
      lastName: freshUser.lastName || session?.lastName,
      avatarUrl: freshUser.avatarUrl || undefined,
      brandLogoUrl: freshUser.brandLogoUrl || undefined,
      rank: freshUser.rank as string,
      setupStatus: freshUser.setupStatus as string,
      businessCountry: freshUser.businessCountry as string,
      entityName: freshUser.entityName as string,
      socialName: freshUser.socialName as string,
      themeMode: freshUser.themeDark ? 'dark' : 'light',
      mirorAvatarProfile: freshUser.mirorAvatarProfile as 'male' | 'female' | 'inclusive' | undefined,
      mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming as 'subtle' | 'magical' | 'playful' | undefined,
    });

    // Update cookie (Server Action context - set directly on cookies store)
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('FUSE_5.0', token, {
      httpOnly: false, // Must be false for client-side hydration
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, user: freshUser };
  } catch (error) {
    console.error('completeSetupAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update theme preferences in database only (no cookie refresh)
 *
 * FUSE Pattern: UI updates via store + localStorage (instant)
 * DB sync is fire-and-forget for persistence across devices/sessions
 * Cookie will sync on next login - no need to refresh mid-session
 */
export async function updateThemeAction(themeDark: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Just update DB - store + localStorage already have the right value
    await convex.mutation(api.domains.admin.users.api.updateThemePreferences, {
      clerkId: userId,
      themeDark,
    });

    return { success: true };
  } catch (error) {
    console.error('updateThemeAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update user profile settings and auto-update session cookie
 * TTT-LiveField pattern: Called from FUSE store action on field blur
 */
export async function updateProfileAction(data: {
  firstName?: string;
  lastName?: string;
  entityName?: string;
  socialName?: string;
  phoneNumber?: string;
  businessCountry?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Call Convex mutation
    await convex.mutation(api.domains.admin.users.api.updateProfile, {
      clerkId: userId,
      ...data,
    });

    // Fetch fresh user data (getCurrentUser resolves storage IDs to URLs)
    const freshUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
      clerkId: userId,
    });

    if (!freshUser) throw new Error('User not found');

    // Read current session
    const session = await readSessionCookie();

    // Mint new session with updated data
    const token = await mintSession({
      _id: String(freshUser._id),
      clerkId: freshUser.clerkId,
      email: freshUser.email || session?.email || '',
      secondaryEmail: freshUser.secondaryEmail || undefined,
      firstName: freshUser.firstName || session?.firstName,
      lastName: freshUser.lastName || session?.lastName,
      avatarUrl: freshUser.avatarUrl || undefined,
      brandLogoUrl: freshUser.brandLogoUrl || undefined,
      rank: freshUser.rank as string,
      setupStatus: freshUser.setupStatus as string,
      businessCountry: freshUser.businessCountry as string,
      entityName: freshUser.entityName as string,
      socialName: freshUser.socialName as string,
      phoneNumber: freshUser.phoneNumber as string,
      themeMode: freshUser.themeDark ? 'dark' : 'light',
      mirorAvatarProfile: freshUser.mirorAvatarProfile as 'male' | 'female' | 'inclusive' | undefined,
      mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming as 'subtle' | 'magical' | 'playful' | undefined,
    });

    // Update cookie (Server Action context - set directly on cookies store)
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('FUSE_5.0', token, {
      httpOnly: false, // Must be false for client-side hydration
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error) {
    console.error('updateProfileAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update genome fields (no cookie update needed - genome is in separate table)
 * TTT-LiveField pattern: Called from FUSE store action on field blur
 */
export async function updateGenomeAction(data: {
  jobTitle?: string;
  department?: string;
  seniority?: string;
  industry?: string;
  companySize?: string;
  companyWebsite?: string;
  transformationGoal?: string;
  transformationStage?: string;
  transformationType?: string;
  timelineUrgency?: string;
  howDidYouHearAboutUs?: string;
  teamSize?: number;
  annualRevenue?: string;
  successMetric?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Call Convex mutation via HTTP client with clerkId for auth
    await convex.mutation(api.domains.settings.mutations.updateGenome, {
      clerkId: userId,
      ...data,
    });

    return { success: true };
  } catch (error) {
    console.error('updateGenomeAction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function refreshSessionAfterUpload() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Fetch fresh user data (getCurrentUser resolves storage IDs to URLs)
    const freshUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
      clerkId: userId,
    });

    if (!freshUser) throw new Error('User not found');

    console.log('🔍 refreshSessionAfterUpload - brandLogoUrl from Convex:', freshUser.brandLogoUrl);
    console.log('🔍 refreshSessionAfterUpload - avatarUrl from Convex:', freshUser.avatarUrl);

    // Read current session
    const session = await readSessionCookie();

    // Mint new session with updated avatar and brandLogo
    const token = await mintSession({
      _id: String(freshUser._id),
      clerkId: freshUser.clerkId,
      email: freshUser.email || session?.email || '',
      secondaryEmail: freshUser.secondaryEmail || undefined,
      firstName: freshUser.firstName || session?.firstName,
      lastName: freshUser.lastName || session?.lastName,
      avatarUrl: freshUser.avatarUrl || undefined,
      brandLogoUrl: freshUser.brandLogoUrl || undefined,
      rank: freshUser.rank as string,
      setupStatus: freshUser.setupStatus as string,
      businessCountry: freshUser.businessCountry as string,
      entityName: freshUser.entityName as string,
      socialName: freshUser.socialName as string,
      themeMode: freshUser.themeDark ? 'dark' : 'light',
      mirorAvatarProfile: freshUser.mirorAvatarProfile as 'male' | 'female' | 'inclusive' | undefined,
      mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming as 'subtle' | 'magical' | 'playful' | undefined,
    });

    // Update cookie (Server Action context - set directly on cookies store)
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('FUSE_5.0', token, {
      httpOnly: false, // Match the original FUSE cookie setting
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error) {
    console.error('refreshSessionAfterUpload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
