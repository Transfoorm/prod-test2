/**──────────────────────────────────────────────────────────────────────┐
│  🍪 FUSE Cookie Client Utilities                                       │
│  /fuse/store/session/cookieClient.ts                                   │
│                                                                        │
│  Client-side cookie reading and JWT decoding utilities                 │
│  Used by ClientHydrator for cookie change detection                    │
│                                                                        │
│  ⚠️  SECURITY NOTE: These utilities are for FUSE_5.0 cookie only.     │
│      Do NOT use for httpOnly cookies (they can't be read client-side) │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

/**
 * Get cookie value by name from document.cookie
 *
 * @param name - Cookie name to retrieve
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  // Server-side guard
  if (typeof document === 'undefined') return null;

  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];

  return value || null;
}

/**
 * FUSE Cookie Payload Type
 * Matches ServerUser structure from server-side fetch
 *
 * 🛡️ SOVEREIGNTY: _id is the canonical identity (Convex), clerkId is auth reference
 */
export interface FuseCookiePayload {
  _id: string;         // ✅ Convex user _id (CANONICAL, sovereign identity)
  clerkId: string;     // Clerk ID for auth handoff reference only
  email?: string;
  secondaryEmail?: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  brandLogoUrl?: string;
  rank?: 'crew' | 'captain' | 'commodore' | 'admiral' | null;
  setupStatus?: 'pending' | 'complete' | null;
  businessCountry?: string;
  entityName?: string;
  socialName?: string;
  phoneNumber?: string;
  mirorAvatarProfile?: 'male' | 'female' | 'inclusive';
  mirorEnchantmentEnabled?: boolean;
  mirorEnchantmentTiming?: 'subtle' | 'magical' | 'playful';
  themeMode?: 'light' | 'dark';
  themeName?: 'transtheme';
  // Dashboard preferences (WARP'd during login)
  dashboardLayout?: 'classic' | 'focus' | 'metrics';
  dashboardWidgets?: string[];
  // Professional Genome (baked during genome save)
  genome?: {
    completionPercent: number;
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
}

/**
 * Decode FUSE cookie (JWT format) to extract payload
 *
 * FUSE_5.0 cookie structure: header.payload.signature
 * We only need the payload for client-side state sync
 *
 * @param cookieValue - JWT-formatted cookie value
 * @returns Decoded payload object or null if invalid
 */
export function decodeFuseCookie(cookieValue: string): FuseCookiePayload | null {
  try {
    const parts = cookieValue.split('.');

    // JWT must have 3 parts: header.payload.signature
    if (parts.length !== 3) {
      console.warn('FUSE: Invalid cookie format - expected JWT with 3 parts');
      return null;
    }

    // Decode base64 payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('FUSE: Failed to decode cookie:', error);
    return null;
  }
}

/**
 * Get and decode FUSE_5.0 cookie in one call
 *
 * @returns Decoded FUSE cookie payload or null
 */
export function getFuseSession(): FuseCookiePayload | null {
  const cookieValue = getCookie('FUSE_5.0');
  if (!cookieValue) return null;

  return decodeFuseCookie(cookieValue);
}
