/**──────────────────────────────────────────────────────────────────────┐
│  🔐 VERIFY SETUP - Email Verification for Onboarding                 │
│  /src/features/auth/VerifySetup/index.tsx                             │
│                                                                        │
│  VR DOCTRINE: Feature Layer (Dirty Playground)                         │
│  - Has Clerk hooks (useUser, useSignUp)                                │
│  - Has state (code, error, isLoading)                                  │
│  - Has handlers (handleVerify, handleResend)                           │
│  - Returns Modal.verify VR                                             │
│                                                                        │
│  Used by: SetupModal during onboarding to verify primary email         │
│  Flow: User signs up → email needs verification → this modal           │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useEffect } from 'react';
import { useUser, useSignUp } from '@clerk/nextjs';
import { Modal } from '@/prebuilts/modal';

export interface VerifySetupProps {
  /** Control visibility */
  isOpen: boolean;
  /** Email to verify (display only) */
  email: string;
  /** Called when verification succeeds */
  onSuccess: () => void;
  /** Called when user closes/cancels */
  onClose: () => void;
}

/**
 * VerifySetup - Email verification for onboarding/setup
 *
 * This feature handles verifying an existing primary email.
 * Used during signup flow when email needs verification.
 *
 * Clerk flow:
 * 1. On open: prepareVerification({ strategy: 'email_code' })
 * 2. On submit: attemptVerification({ code })
 * 3. On success: call onSuccess callback
 */
export function VerifySetup({
  isOpen,
  email,
  onSuccess,
  onClose,
}: VerifySetupProps) {
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ CLERK HOOKS - LEGAL IN AUTH FEATURES (features/auth/*)
  // ═══════════════════════════════════════════════════════════════════
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // State
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isLoaded = userLoaded || signUpLoaded;

  // ═══════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════

  // Reset state and send code when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setCode('');
    setError('');
    setIsLoading(false);
    setShowSuccess(false);
    setIsResending(false);

    // Send verification code
    const sendCode = async () => {
      setIsPreparing(true);
      try {
        if (clerkUser?.primaryEmailAddress) {
          await clerkUser.primaryEmailAddress.prepareVerification({
            strategy: 'email_code',
          });
        } else if (signUp) {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });
        }
      } catch (err) {
        console.error('Failed to send verification code:', err);
        setError('Failed to send code. Click Resend to try again.');
      } finally {
        setIsPreparing(false);
      }
    };

    if (isLoaded) {
      sendCode();
    }
  }, [isOpen, isLoaded, clerkUser, signUp]);

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleVerify = async () => {
    if (!isLoaded || code.length !== 6) return;

    setError('');
    setIsLoading(true);

    try {
      let isVerified = false;

      if (clerkUser?.primaryEmailAddress) {
        // Verify existing user's primary email
        const result = await clerkUser.primaryEmailAddress.attemptVerification({
          code,
        });
        isVerified =
          result.verification?.status === 'verified' ||
          ('status' in result && result.status === 'complete');
      } else if (signUp) {
        // Verify during signup flow
        const result = await signUp.attemptEmailAddressVerification({ code });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResult = result as any;
        isVerified =
          anyResult?.verification?.status === 'verified' ||
          anyResult?.status === 'complete';
      } else {
        throw new Error('No verification method available');
      }

      if (isVerified) {
        setIsLoading(false);
        setShowSuccess(true);

        // Delay callback for success animation
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError('Verification incomplete. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      if (error?.errors?.[0]?.message) {
        const msg = error.errors[0].message.toLowerCase();
        if (msg.includes('expired') || msg.includes('expire')) {
          setError('Code expired - click "Resend Code"');
        } else if (msg.includes('incorrect') || msg.includes('invalid')) {
          setError('That code is incorrect, try again.');
        } else {
          setError(error.errors[0].message);
        }
      } else {
        setError('Invalid code. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || isResending) return;

    setIsResending(true);
    setError('');
    setCode('');

    try {
      if (clerkUser?.primaryEmailAddress) {
        await clerkUser.primaryEmailAddress.prepareVerification({
          strategy: 'email_code',
        });
      } else if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
      }

      // Show success feedback briefly
      setTimeout(() => {
        setIsResending(false);
      }, 2000);
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      if (error?.errors?.[0]?.message) {
        setError(error.errors[0].message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
      setIsResending(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER - Modal.verify VR (dumb shell)
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Modal.verify
      isOpen={isOpen}
      variant="modal"
      email={email}
      code={code}
      error={error}
      isPreparing={isPreparing}
      isLoading={isLoading}
      isResending={isResending}
      showSuccess={showSuccess}
      heading="Verify Your Email"
      description="Check your inbox for a 6-digit code and return here"
      submitText="Verify Email"
      cancelText="Cancel"
      resendText="Resend Code"
      resendSuccessText="Code sent! Check again"
      successHeading="Email Verified!"
      successDescription="Your email has been successfully verified"
      successProgressText="Completing your setup..."
      preparingText="Sending verification code..."
      onCodeChange={setCode}
      onSubmit={handleVerify}
      onResend={handleResend}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}

export default VerifySetup;
