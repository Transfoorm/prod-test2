// FUSE 5.0 Server-Side User Fetch
// Reads session cookie and fetches fresh data from Convex for SSR

import { readSessionCookie } from '@/fuse/hydration/session/cookie';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export type ServerUser = {
  clerkId: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  rank?: string;
  setupStatus?: string;
  businessCountry?: string;
  entityName?: string;
  socialName?: string;
  themeName?: 'transtheme';
  themeDark?: boolean;
  mirorAvatarProfile?: 'male' | 'female' | 'inclusive';
  mirorEnchantmentEnabled?: boolean;
  mirorEnchantmentTiming?: 'subtle' | 'magical' | 'playful';
  // Professional Genome
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
};

export async function fetchUserServer(): Promise<ServerUser | null> {
  try {
    const session = await readSessionCookie();

    if (!session || !session.clerkId) {
      return null;
    }

    // VALIDATE: Ensure Convex user exists (prevents orphaned cookie data)
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexUser = await convex.query(api.domains.admin.users.api.getUserByClerkId, {
      clerkId: session.clerkId
    });

    if (!convexUser) {
      return null; // User deleted - will trigger redirect to /sign-in
    }

    // FUSE 5.0 Doctrine: Convex is the single source of truth
    // Use fresh data from Convex, not stale cookie
    const userData: ServerUser = {
      clerkId: convexUser.clerkId,
      email: convexUser.email,
      emailVerified: convexUser.emailVerified,
      firstName: convexUser.firstName,
      lastName: convexUser.lastName,
      avatarUrl: convexUser.avatarUrl ?? undefined,
      rank: convexUser.rank,
      setupStatus: convexUser.setupStatus,
      businessCountry: convexUser.businessCountry,
      entityName: convexUser.entityName,
      socialName: convexUser.socialName,
      themeName: convexUser.themeName,
      themeDark: convexUser.themeDark,
      mirorAvatarProfile: convexUser.mirorAvatarProfile,
      mirorEnchantmentEnabled: convexUser.mirorEnchantmentEnabled,
      mirorEnchantmentTiming: convexUser.mirorEnchantmentTiming,
      // Professional Genome
      jobTitle: convexUser.jobTitle,
      department: convexUser.department,
      seniority: convexUser.seniority,
      industry: convexUser.industry,
      companySize: convexUser.companySize,
      companyWebsite: convexUser.companyWebsite,
      transformationGoal: convexUser.transformationGoal,
      transformationStage: convexUser.transformationStage,
      transformationType: convexUser.transformationType,
      timelineUrgency: convexUser.timelineUrgency,
      howDidYouHearAboutUs: convexUser.howDidYouHearAboutUs,
      teamSize: convexUser.teamSize,
      annualRevenue: convexUser.annualRevenue,
      successMetric: convexUser.successMetric,
    };

    console.log(`FUSE fetchUserServer: Using fresh Convex data (rank: ${convexUser.rank})`);
    return userData;
  } catch (error) {
    console.error('FUSE: Failed to fetch user server-side:', error);
    return null;
  }
}
