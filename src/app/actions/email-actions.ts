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
 * Swap secondary email to become primary (both must be verified)
 * Old primary becomes the new secondary
 *
 * @param secondaryEmail - The email address string to make primary
 */
export async function swapEmailsToPrimary(secondaryEmail: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = await clerkClient();

    // Get user to find the email address ID (case-insensitive)
    const clerkUser = await client.users.getUser(userId);
    const emailObj = clerkUser.emailAddresses.find(
      e => e.emailAddress.toLowerCase() === secondaryEmail.toLowerCase()
    );

    if (!emailObj) {
      return { error: 'Secondary email not found in Clerk' };
    }

    if (emailObj.verification?.status !== 'verified') {
      return { error: 'Secondary email must be verified first' };
    }

    // Set the secondary email as primary
    // Clerk keeps the old primary as a secondary email automatically
    await client.users.updateUser(userId, {
      primaryEmailAddressID: emailObj.id,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to swap emails:', err);
    return { error: 'Failed to swap emails' };
  }
}

/**
 * Delete secondary email by email address string
 */
export async function deleteSecondaryEmail(secondaryEmail: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = await clerkClient();

    // Get user to find the email address ID (case-insensitive)
    const clerkUser = await client.users.getUser(userId);
    const emailObj = clerkUser.emailAddresses.find(
      e => e.emailAddress.toLowerCase() === secondaryEmail.toLowerCase()
    );

    if (!emailObj) {
      return { error: 'Secondary email not found in Clerk' };
    }

    // Don't allow deleting primary email
    if (emailObj.id === clerkUser.primaryEmailAddressId) {
      return { error: 'Cannot delete primary email' };
    }

    await client.emailAddresses.deleteEmailAddress(emailObj.id);
    return { success: true };
  } catch (err) {
    console.error('Failed to delete secondary email:', err);
    return { error: 'Failed to delete email' };
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
