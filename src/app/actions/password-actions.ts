'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Change user's password
 * Uses Clerk Backend API - no reverification needed
 *
 * Password Requirements:
 * - Minimum 6 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 symbol
 */
export async function changePassword(newPassword: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  // Validate password requirements
  if (!newPassword || typeof newPassword !== 'string') {
    return { error: 'New password is required' };
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  if (!/[A-Z]/.test(newPassword)) {
    return { error: 'Password must include at least 1 uppercase letter' };
  }

  if (!/[0-9]/.test(newPassword)) {
    return { error: 'Password must include at least 1 number' };
  }

  if (!/[^a-zA-Z0-9]/.test(newPassword)) {
    return { error: 'Password must include at least 1 symbol' };
  }

  try {
    const client = await clerkClient();

    await client.users.updateUser(userId, {
      password: newPassword,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to change password:', err);

    // Type guard for Clerk errors
    const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };

    if (clerkError.errors?.[0]) {
      const firstError = clerkError.errors[0];
      return { error: firstError.longMessage || firstError.message || 'Unknown error' };
    }

    return { error: 'Failed to change password' };
  }
}
