'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Add a new email to user's account and send verification code
 * Uses Backend API - bypasses client-side reverification
 */
export async function addEmailAndSendCode(newEmail: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = await clerkClient();

    // Create email address via Backend API (no reverification needed)
    const emailAddress = await client.emailAddresses.createEmailAddress({
      userId,
      emailAddress: newEmail,
      verified: false,
    });

    // The email address is created - now we need to trigger verification
    // Backend API doesn't have prepareVerification, so we return the ID
    // and let the client call prepareVerification on it
    return {
      success: true,
      emailAddressId: emailAddress.id,
    };
  } catch (err) {
    console.error('Failed to add email:', err);
    const error = err as { errors?: Array<{ message: string; code?: string }> };
    if (error?.errors?.[0]?.message) {
      return { error: error.errors[0].message };
    }
    return { error: 'Failed to add email address' };
  }
}

/**
 * Set an email address as primary and delete the old primary
 */
export async function setPrimaryEmail(emailAddressId: string, oldEmailId?: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = await clerkClient();

    // Set new email as primary
    await client.users.updateUser(userId, {
      primaryEmailAddressID: emailAddressId,
    });

    // Delete the old primary email (cleanup)
    if (oldEmailId) {
      try {
        await client.emailAddresses.deleteEmailAddress(oldEmailId);
      } catch {
        // Silent failure - old email might already be deleted
        console.warn('Could not delete old email:', oldEmailId);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to set primary email:', err);
    return { error: 'Failed to update primary email' };
  }
}

/**
 * Delete an email address (for cleanup when changing secondary)
 */
export async function deleteEmail(emailAddressId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = await clerkClient();
    await client.emailAddresses.deleteEmailAddress(emailAddressId);
    return { success: true };
  } catch (err) {
    console.error('Failed to delete email:', err);
    return { error: 'Failed to delete email address' };
  }
}
