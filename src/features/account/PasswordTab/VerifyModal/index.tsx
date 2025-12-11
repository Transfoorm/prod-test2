/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ VERIFY MODAL - Auth Boundary Component                          │
│  /src/app/(auth)/components/VerifyModal/index.tsx                    │
│                                                                        │
│  S.I.D. PHASE 12 COMPLIANT - Auth Boundary Pattern                    │
│                                                                        │
│  This component lives in the (auth) zone because it REQUIRES Clerk    │
│  frontend SDK for prepareVerification() and attemptVerification().    │
│                                                                        │
│  CLERK HOOKS ARE LEGAL HERE - This is the auth boundary.              │
│                                                                        │
│  Features import this component to handle email verification flows    │
│  without directly using Clerk hooks themselves.                       │
│                                                                        │
│  Modes:                                                               │
│  - 'verify': Verifies existing primary email (signup flow)            │
│  - 'change': Adds new email, verifies it, sets as primary             │
│  - 'secondary': Adds new email, verifies it, keeps as secondary       │
│                                                                        │
│  REF: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md              │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSignUp, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { addEmailAndSendCode, setPrimaryEmail, deleteEmail } from '@/app/actions/email-actions';
import './verify-modal.css';

export interface VerifyModalProps {
  isOpen: boolean;
  email: string;
  mode?: 'verify' | 'change' | 'secondary';
  /** Current email value (for cleanup - we'll find its Clerk ID and delete it) */
  currentEmail?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function VerifyModal({
  isOpen,
  email,
  mode = 'verify',
  currentEmail,
  onSuccess,
  onClose
}: VerifyModalProps) {
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ CLERK HOOKS - LEGAL IN AUTH BOUNDARY (SID-12.3)
  // These hooks are the ONLY way to call prepareVerification/attemptVerification
  // ═══════════════════════════════════════════════════════════════════
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isLoaded = userLoaded || signUpLoaded;

  // Reset modal state when it opens or closes
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setIsLoading(false);
      setIsPreparing(false);
      setShowSuccess(false);
      setIsResending(false);
      setPendingEmailId(null);

      // For 'change' or 'secondary' mode, prepare verification when modal opens
      if ((mode === 'change' || mode === 'secondary') && email && clerkUser) {
        prepareEmailChange();
      }

      // For 'verify' mode (existing primary email), send verification code on open
      if (mode === 'verify' && clerkUser?.primaryEmailAddress) {
        setIsPreparing(true);
        clerkUser.primaryEmailAddress.prepareVerification({ strategy: 'email_code' })
          .then(() => setIsPreparing(false))
          .catch((err) => {
            console.error('Failed to send verification code:', err);
            setError('Failed to send verification code. Click Resend to try again.');
            setIsPreparing(false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, email]);

  // Auto-focus first input when modal opens or preparing completes
  useEffect(() => {
    if (isOpen && !showSuccess && !isPreparing) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSuccess, isPreparing]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !isLoading && !isPreparing) {
      handleVerifyCodeSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Prepare email change - create new email and send verification
  const prepareEmailChange = async () => {
    if (!clerkUser || !email) return;

    setIsPreparing(true);
    setError("");

    try {
      // Step 1: Create email via Server Action (bypasses reverification)
      const result = await addEmailAndSendCode(email);
      if (result.error) {
        setError(result.error);
        setIsPreparing(false);
        return;
      }

      setPendingEmailId(result.emailAddressId!);

      // Step 2: Reload user to get the new email address object
      await clerkUser.reload();

      // Step 3: Find the email and send verification code
      // 🛡️ CLERK SDK CALL - Legal in auth boundary
      const newEmailObj = clerkUser.emailAddresses.find(e => e.id === result.emailAddressId);
      if (newEmailObj) {
        await newEmailObj.prepareVerification({ strategy: 'email_code' });
      }

      setIsPreparing(false);
    } catch (err) {
      console.error('Failed to prepare email change:', err);
      const error = err as { errors?: Array<{ message: string; code?: string }> };
      if (error?.errors?.[0]?.message) {
        const msg = error.errors[0].message;
        if (msg.toLowerCase().includes('already') || error.errors[0].code === 'form_identifier_exists') {
          setError('This email is already in use');
        } else {
          setError(msg);
        }
      } else {
        setError('Failed to send verification code');
      }
      setIsPreparing(false);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      let isVerified = false;

      if ((mode === 'change' || mode === 'secondary') && pendingEmailId && clerkUser) {
        // Email change/secondary mode - verify the new email
        await clerkUser.reload();
        const pendingEmailObj = clerkUser.emailAddresses.find(e => e.id === pendingEmailId);
        if (pendingEmailObj) {
          // 🛡️ CLERK SDK CALL - Legal in auth boundary
          const result = await pendingEmailObj.attemptVerification({ code });
          isVerified = result.verification?.status === 'verified';

          if (isVerified) {
            // Find the old email's Clerk ID (if we have one to delete)
            const oldEmailObj = currentEmail
              ? clerkUser.emailAddresses.find(e => e.emailAddress === currentEmail)
              : null;
            const oldEmailClerkId = oldEmailObj?.id;

            if (mode === 'change') {
              // Set as primary and delete old primary email
              await setPrimaryEmail(pendingEmailId, oldEmailClerkId);
            } else if (mode === 'secondary' && oldEmailClerkId) {
              // Delete old secondary email
              await deleteEmail(oldEmailClerkId);
            }
          }
        }
      } else if (clerkUser && clerkUser.primaryEmailAddress) {
        // Standard verify mode - verify existing primary email
        // 🛡️ CLERK SDK CALL - Legal in auth boundary
        const result = await clerkUser.primaryEmailAddress.attemptVerification({ code });
        isVerified = (
          result.verification?.status === "verified" ||
          ('status' in result && result.status === "complete")
        );
      } else if (signUp) {
        // Signup verification
        // 🛡️ CLERK SDK CALL - Legal in auth boundary
        const result = await signUp.attemptEmailAddressVerification({ code });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResult = result as any;
        isVerified = (
          (anyResult?.verification?.status === "verified") ||
          (anyResult?.status === "complete")
        );
      } else {
        throw new Error('No verification method available');
      }

      if (isVerified) {
        setIsLoading(false);
        setShowSuccess(true);

        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError("Verification incomplete. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      if (error?.errors?.[0]?.message) {
        const clerkMessage = error.errors[0].message.toLowerCase();
        if (clerkMessage.includes('expired') || clerkMessage.includes('expire')) {
          setError('Code expired - click "Resend Code"');
        } else if (clerkMessage.includes('incorrect') || clerkMessage.includes('invalid')) {
          setError('That code is incorrect, try again.');
        } else {
          setError(error.errors[0].message);
        }
      } else {
        setError("Invalid code. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || isResending) return;

    setIsResending(true);
    setError("");
    setCode("");

    try {
      if ((mode === 'change' || mode === 'secondary') && pendingEmailId && clerkUser) {
        // Resend to pending email
        const pendingEmail = clerkUser.emailAddresses.find(e => e.id === pendingEmailId);
        if (pendingEmail) {
          // 🛡️ CLERK SDK CALL - Legal in auth boundary
          await pendingEmail.prepareVerification({ strategy: "email_code" });
        }
      } else if (clerkUser && clerkUser.primaryEmailAddress) {
        // 🛡️ CLERK SDK CALL - Legal in auth boundary
        await clerkUser.primaryEmailAddress.prepareVerification({ strategy: "email_code" });
      } else if (signUp) {
        // 🛡️ CLERK SDK CALL - Legal in auth boundary
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        throw new Error('No verification method available');
      }

      setTimeout(() => {
        setIsResending(false);
      }, 2000);
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      if (error?.errors?.[0]?.message) {
        setError(error.errors[0].message);
      } else {
        setError("Failed to resend code. Please try again.");
      }
      setIsResending(false);
    }
  };

  const handleClose = async () => {
    // If we created a pending email but didn't verify it, clean it up
    if ((mode === 'change' || mode === 'secondary') && pendingEmailId && clerkUser) {
      try {
        await clerkUser.reload();
        const pendingEmail = clerkUser.emailAddresses.find(e => e.id === pendingEmailId);
        if (pendingEmail && pendingEmail.verification?.status !== 'verified') {
          await pendingEmail.destroy();
        }
      } catch {
        // Silent cleanup failure is ok
      }
    }
    onClose();
  };

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const modalContent = showSuccess ? (
    <div className="ft-password-verifymodal-overlay">
      <div className="ft-password-verifymodal-container ft-password-verifymodal-container--narrow">
        <div className="ft-password-verifymodal-logo">
          <Image
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="ft-password-verifymodal-logo-img"
            width={200}
            height={50}
          />
        </div>

        <div className="ft-password-verifymodal-success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="ft-password-verifymodal-heading">
          {mode === 'secondary' ? 'Email Confirmed!' : mode === 'change' ? 'Email Updated!' : 'Email Verified!'}
        </h1>
        <p className="ft-password-verifymodal-description">
          {mode === 'secondary'
            ? 'Your secondary email has been verified successfully'
            : mode === 'change'
            ? 'Your primary email has been changed successfully'
            : 'Your email has been successfully verified'}
        </p>

        <div className="ft-password-verifymodal-progress-bar">
          <div className="ft-password-verifymodal-progress-fill" />
        </div>
        <p className="ft-password-verifymodal-progress-text">
          {mode === 'secondary' || mode === 'change' ? 'Updating your profile...' : 'Completing your setup...'}
        </p>

        <p className="ft-password-verifymodal-footer ft-password-verifymodal-footer--lg">
          Powered by FUSE * Instant Everything
        </p>
      </div>
    </div>
  ) : (
    <div className="ft-password-verifymodal-overlay">
      <div className="ft-password-verifymodal-container ft-password-verifymodal-container--wide">
        <div className="ft-password-verifymodal-logo">
          <Image
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="ft-password-verifymodal-logo-img"
            width={200}
            height={50}
          />
        </div>

        <h1 className="ft-password-verifymodal-heading ft-password-verifymodal-heading--sm">
          {mode === 'secondary' ? 'Add Secondary Email' : mode === 'change' ? 'Verify New Email' : 'Verify Your Email'}
        </h1>
        <p className="ft-password-verifymodal-description">
          {isPreparing
            ? 'Sending verification code...'
            : 'Check your inbox for a 6-digit code and return here'}
        </p>

        {isPreparing ? (
          <div className="ft-password-verifymodal-preparing">
            <svg className="ft-password-verifymodal-spinner ft-password-verifymodal-spinner--large" fill="none" viewBox="0 0 24 24">
              <circle className="ft-password-verifymodal-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="ft-password-verifymodal-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCodeSubmit();
          }}>
            <label className="ft-password-verifymodal-form-label">
              Enter Verification Code
            </label>

            <div className="ft-password-verifymodal-code-inputs">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ''}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onKeyDown={(e) => {
                    const key = e.key;

                    // Handle digit input - update value and advance
                    if (/^[0-9]$/.test(key)) {
                      e.preventDefault();
                      const newCode = code.split('');
                      newCode[index] = key;
                      setCode(newCode.join(''));

                      // Advance to next cell
                      if (index < 5) {
                        const nextInput = e.currentTarget.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }

                    // Handle backspace
                    if (key === 'Backspace') {
                      e.preventDefault();
                      const newCode = code.split('');
                      if (code[index]) {
                        // Clear current cell
                        newCode[index] = '';
                        setCode(newCode.join(''));
                      } else if (index > 0) {
                        // Move to previous cell and clear it
                        newCode[index - 1] = '';
                        setCode(newCode.join(''));
                        const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }
                  }}
                  onChange={() => {
                    // Handled by onKeyDown - this is just for React controlled input
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    setCode(pastedData);
                    const targetIndex = Math.min(pastedData.length, 5);
                    const targetInput = e.currentTarget.parentElement?.children[targetIndex] as HTMLInputElement;
                    targetInput?.focus();
                  }}
                  className="ft-password-verifymodal-code-input"
                  disabled={isLoading}
                />
              ))}
            </div>

            <p className="ft-password-verifymodal-code-sent-to">
              6-digit code was sent to <span className="ft-password-verifymodal-code-email">{email}</span>
            </p>

            {error && (
              <div className="ft-password-verifymodal-error">
                <p className="ft-password-verifymodal-error-text">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isLoaded || code.length !== 6}
              className="ft-password-verifymodal-submit-button"
            >
              {isLoading ? (
                <span className="ft-password-verifymodal-submit-button-content">
                  <svg className="ft-password-verifymodal-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="ft-password-verifymodal-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="ft-password-verifymodal-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                mode === 'secondary' ? "Verify & Add Email" : mode === 'change' ? "Verify & Update Email" : "Verify Email"
              )}
            </button>

            <div className="ft-password-verifymodal-resend">
              {!isResending ? (
                <>
                  <span className="ft-password-verifymodal-resend-text">
                    Didn&apos;t receive the code?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="ft-password-verifymodal-resend-button"
                  >
                    Resend Code
                  </button>
                </>
              ) : (
                <span className="ft-password-verifymodal-resend-success">
                  Code sent! Check again
                </span>
              )}
            </div>

            <div className="ft-password-verifymodal-cancel">
              <button
                type="button"
                onClick={handleClose}
                className="ft-password-verifymodal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="ft-password-verifymodal-footer">
          Powered by FUSE * Instant Everything
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
