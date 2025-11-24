'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSignUp, useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EmailVerificationModal({
  isOpen,
  email,
  onSuccess,
  onClose
}: EmailVerificationModalProps) {
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isLoaded = userLoaded || signUpLoaded;

  // Reset modal state when it opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setCode("");
      setError("");
      setIsLoading(false);
      setShowSuccess(false);
      setIsResending(false);
    }
  }, [isOpen]);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && !showSuccess && firstInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showSuccess]);

  // Auto-submit when 6 digits are entered (Apple-style)
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      handleVerifyCodeSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleVerifyCodeSubmit = async () => {

    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      let result;

      if (clerkUser && clerkUser.primaryEmailAddress) {
        result = await clerkUser.primaryEmailAddress.attemptVerification({ code });
      } else if (signUp) {
        result = await signUp.attemptEmailAddressVerification({ code });
      } else {
        throw new Error('No verification method available');
      }

      // Type guard for different result types from Clerk
      const isVerified = (
        (result && typeof result === 'object' && 'verification' in result && result.verification?.status === "verified") ||
        (result && typeof result === 'object' && 'status' in result && result.status === "complete") ||
        (result && typeof result === 'object' && 'emailAddress' in result && result.emailAddress && typeof result.emailAddress === 'object' && 'verification' in result.emailAddress && (result.emailAddress as { verification?: { status?: string } }).verification?.status === "verified")
      );

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
        // Check if it's an expiration error
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
    setCode(""); // Clear the old code

    try {
      if (clerkUser && clerkUser.primaryEmailAddress) {
        await clerkUser.primaryEmailAddress.prepareVerification({ strategy: "email_code" });
      } else if (signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        throw new Error('No verification method available');
      }

      // Keep the "Sent!" message visible for 2 seconds
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

  if (!isOpen) return null;

  // Don&apos;t render until we're in the browser
  if (typeof window === 'undefined') return null;

  const modalContent = showSuccess ? (
    // Success state
    (
      <div className="ft-verify-overlay">
        <div className="ft-verify-container ft-verify-container--narrow">
          {/* Logo */}
          <div className="ft-verify-logo">
            <Image
              src="/images/brand/transfoorm.png"
              alt="Transfoorm"
              className="ft-verify-logo-img"
              width={200}
              height={50}
            />
          </div>

          {/* Success Icon */}
          <div className="ft-verify-success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="ft-verify-heading">
            Email Verified!
          </h1>
          <p className="ft-verify-description">
            Your email has been successfully verified
          </p>

          {/* Progress Bar */}
          <div className="ft-verify-progress-bar">
            <div className="ft-verify-progress-fill" />
          </div>
          <p className="ft-verify-progress-text">
            Completing your setup...
          </p>

          {/* Footer */}
          <p className="ft-verify-footer ft-verify-footer--lg">
            Powered by FUSE 2.0 Fast User-Session Experience
          </p>
        </div>
      </div>
    )
  ) : (
    // Main verification form
    (
    <div className="ft-verify-overlay">
      <div className="ft-verify-container ft-verify-container--wide">
        {/* Logo */}
        <div className="ft-verify-logo">
          <Image
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="ft-verify-logo-img"
            width={200}
            height={50}
          />
        </div>

        {/* Header */}
        <h1 className="ft-verify-heading ft-verify-heading--sm">
          Verify Your Email
        </h1>
        <p className="ft-verify-description">
          Check your inbox for a 6-digit code and return here
        </p>

        {/* Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleVerifyCodeSubmit();
        }}>
          <label className="ft-verify-form-label">
            Enter Verification Code
          </label>

          {/* Code Inputs */}
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
                    // Handle deletion
                    const newCode = code.split('');
                    newCode[index] = '';
                    setCode(newCode.join(''));
                  } else if (value.length === 1) {
                    // Single digit - replace current position
                    const newCode = code.split('');
                    newCode[index] = value;
                    setCode(newCode.join(''));

                    // Move to next input
                    if (index < 5) {
                      const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                      nextInput?.focus();
                    }
                  } else {
                    // Multiple digits (user typed fast or pasted) - fill from current position
                    const newCode = code.split('');
                    const digits = value.split('');

                    for (let i = 0; i < digits.length && index + i < 6; i++) {
                      newCode[index + i] = digits[i];
                    }

                    setCode(newCode.join(''));

                    // Focus the next empty input or last input
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
                  // Select the text on focus so typing overwrites
                  e.target.select();
                }}
                className="ft-verify-code-input"
                disabled={isLoading}
              />
            ))}
          </div>

          <p className="ft-verify-code-sent-to">
            6-digit was code sent to <span className="ft-verify-code-email">{email}</span>
          </p>

          {/* Error Message */}
          {error && (
            <div className="ft-verify-error">
              <p className="ft-verify-error-text">{error}</p>
            </div>
          )}

          {/* Submit Button */}
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
              "Verify Email"
            )}
          </button>

          {/* Resend Link */}
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
                ✓ Code sent! Check again
              </span>
            )}
          </div>

          {/* Cancel Link */}
          <div className="ft-verify-cancel">
            <button
              type="button"
              onClick={onClose}
              className="ft-verify-cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="ft-verify-footer">
          Powered by FUSE Revolution -  Fast User Session Experience
        </p>
      </div>
    </div>
    )
  );

  // Render modal via portal to escape parent stacking context
  return createPortal(modalContent, document.body);
}
