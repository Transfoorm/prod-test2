/**──────────────────────────────────────────────────────────────────────┐
│  🔱 VERIFY MODAL - Universal Email Verification                       │
│  /src/features/VerifyModal/index.tsx                                  │
│                                                                        │
│  Handles signup verification, primary email changes, and secondary.   │
│  Lives in /features/ because it needs Clerk access (Golden Bridge).   │
│                                                                        │
│  Props:                                                               │
│  - isOpen: boolean - Modal visibility                                 │
│  - email: string - Email being verified                               │
│  - mode: 'verify' | 'change' | 'secondary' - Verification mode        │
│  - onSuccess: () => void - Called after successful verification       │
│  - onClose: () => void - Called when user cancels                     │
│                                                                        │
│  Mode 'verify': Verifies existing primary email (signup flow)         │
│  Mode 'change': Adds new email, verifies it, sets as primary          │
│  Mode 'secondary': Adds new email, verifies it, keeps as secondary    │
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, email]);

  // Auto-focus first input when modal opens or preparing completes
  useEffect(() => {
    if (isOpen && !showSuccess && !isPreparing) {
      // Small delay to ensure DOM is ready
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
        await clerkUser.reload(); // Refresh to get latest email addresses
        const pendingEmailObj = clerkUser.emailAddresses.find(e => e.id === pendingEmailId);
        if (pendingEmailObj) {
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
        const result = await clerkUser.primaryEmailAddress.attemptVerification({ code });
        isVerified = (
          result.verification?.status === "verified" ||
          ('status' in result && result.status === "complete")
        );
      } else if (signUp) {
        // Signup verification
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
          await pendingEmail.prepareVerification({ strategy: "email_code" });
        }
      } else if (clerkUser && clerkUser.primaryEmailAddress) {
        await clerkUser.primaryEmailAddress.prepareVerification({ strategy: "email_code" });
      } else if (signUp) {
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
    <div className="ft-verify-overlay">
      <div className="ft-verify-container ft-verify-container--narrow">
        <div className="ft-verify-logo">
          <Image
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="ft-verify-logo-img"
            width={200}
            height={50}
          />
        </div>

        <div className="ft-verify-success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="ft-verify-heading">
          {mode === 'secondary' ? 'Secondary Email Added!' : mode === 'change' ? 'Email Updated!' : 'Email Verified!'}
        </h1>
        <p className="ft-verify-description">
          {mode === 'secondary'
            ? 'Your secondary email has been verified successfully'
            : mode === 'change'
            ? 'Your primary email has been changed successfully'
            : 'Your email has been successfully verified'}
        </p>

        <div className="ft-verify-progress-bar">
          <div className="ft-verify-progress-fill" />
        </div>
        <p className="ft-verify-progress-text">
          {mode === 'secondary' || mode === 'change' ? 'Updating your profile...' : 'Completing your setup...'}
        </p>

        <p className="ft-verify-footer ft-verify-footer--lg">
          Powered by FUSE * Instant Everything!
        </p>
      </div>
    </div>
  ) : (
    <div className="ft-verify-overlay">
      <div className="ft-verify-container ft-verify-container--wide">
        <div className="ft-verify-logo">
          <Image
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="ft-verify-logo-img"
            width={200}
            height={50}
          />
        </div>

        <h1 className="ft-verify-heading ft-verify-heading--sm">
          {mode === 'secondary' ? 'Add Secondary Email' : mode === 'change' ? 'Verify New Email' : 'Verify Your Email'}
        </h1>
        <p className="ft-verify-description">
          {isPreparing
            ? 'Sending verification code...'
            : 'Check your inbox for a 6-digit code and return here'}
        </p>

        {isPreparing ? (
          <div className="ft-verify-preparing">
            <svg className="ft-verify-spinner ft-verify-spinner--large" fill="none" viewBox="0 0 24 24">
              <circle className="ft-verify-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="ft-verify-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCodeSubmit();
          }}>
            <label className="ft-verify-form-label">
              Enter Verification Code
            </label>

            <div className="ft-verify-code-inputs">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');

                    if (value.length === 0) {
                      const newCode = code.split('');
                      newCode[index] = '';
                      setCode(newCode.join(''));
                    } else if (value.length === 1) {
                      const newCode = code.split('');
                      newCode[index] = value;
                      setCode(newCode.join(''));

                      if (index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    } else {
                      const newCode = code.split('');
                      const digits = value.split('');

                      for (let i = 0; i < digits.length && index + i < 6; i++) {
                        newCode[index + i] = digits[i];
                      }

                      setCode(newCode.join(''));

                      const nextIndex = Math.min(index + digits.length, 5);
                      const nextInput = e.target.parentElement?.children[nextIndex] as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    const newCode = pastedData.padEnd(6, '').split('').slice(0, 6).join('');
                    setCode(newCode);
                    const targetIndex = Math.min(pastedData.length, 5);
                    const targetInput = e.currentTarget.parentElement?.children[targetIndex] as HTMLInputElement;
                    targetInput?.focus();
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  className="ft-verify-code-input"
                  disabled={isLoading}
                />
              ))}
            </div>

            <p className="ft-verify-code-sent-to">
              6-digit code was sent to <span className="ft-verify-code-email">{email}</span>
            </p>

            {error && (
              <div className="ft-verify-error">
                <p className="ft-verify-error-text">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isLoaded || code.length !== 6}
              className="ft-verify-submit-button"
            >
              {isLoading ? (
                <span className="ft-verify-submit-button-content">
                  <svg className="ft-verify-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="ft-verify-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="ft-verify-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                mode === 'secondary' ? "Verify & Add Email" : mode === 'change' ? "Verify & Update Email" : "Verify Email"
              )}
            </button>

            <div className="ft-verify-resend">
              {!isResending ? (
                <>
                  <span className="ft-verify-resend-text">
                    Didn&apos;t receive the code?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="ft-verify-resend-button"
                  >
                    Resend Code
                  </button>
                </>
              ) : (
                <span className="ft-verify-resend-success">
                  Code sent! Check again
                </span>
              )}
            </div>

            <div className="ft-verify-cancel">
              <button
                type="button"
                onClick={handleClose}
                className="ft-verify-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="ft-verify-footer">
          Powered by FUSE * Instant Everything!
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
