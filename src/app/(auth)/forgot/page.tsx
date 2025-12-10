"use client";

/**──────────────────────────────────────────────────────────────────────┐
│  🔐 FORGOT PASSWORD PAGE - TTT-CERTIFIED CLIENT FORM                  │
│  /src/app/(auth)/forgot/page.tsx                                       │
│                                                                        │
│  CLIENT COMPONENT - Only the form logic.                               │
│  Shell (logo, card, footer) is SSR via layout.tsx.                     │
│                                                                        │
│  TTT Result:                                                           │
│  - Logo never disappears                                               │
│  - Card never collapses                                                │
│  - Form hydrates in place                                              │
│  - Zero layout shift                                                   │
└────────────────────────────────────────────────────────────────────────┘ */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Icon } from '@/prebuilts/icon/iconRegistry';
import { Button } from '@/prebuilts/button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<"email" | "code" | "password" | "success">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [codeAttempted, setCodeAttempted] = useState(false); // Track if we've tried this code
  const [isResending, setIsResending] = useState(false);
  const firstCodeInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyCodeSubmit = useCallback(async () => {
    if (!isLoaded || !signIn) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    setCodeAttempted(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStage("password");
        setIsSubmitting(false);
      } else {
        setError("Invalid code. Please try again.");
        setCode(""); // Clear code on failure
        setCodeAttempted(false);
        setIsSubmitting(false);
        // Refocus first input
        setTimeout(() => firstCodeInputRef.current?.focus(), 100);
      }
    } catch (err) {
      console.error("Code verification error:", err);
      const errCode = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.code;
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;

      // Handle specific error cases with friendly messages
      if (errCode === "too_many_requests" || String(message).toLowerCase().includes("too many")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (errCode === "form_code_incorrect" || String(message).toLowerCase().includes("incorrect")) {
        setError("Incorrect code. Please check and try again.");
      } else {
        setError("Invalid code. Please try again.");
      }

      // Clear code and refocus on any error
      setCode("");
      setCodeAttempted(false);
      setIsSubmitting(false);
      setTimeout(() => firstCodeInputRef.current?.focus(), 100);
    }
  }, [isLoaded, signIn, code]);

  useEffect(() => {
    if (stage === "code" && firstCodeInputRef.current) {
      setTimeout(() => {
        firstCodeInputRef.current?.focus();
      }, 100);
    }
  }, [stage]);

  useEffect(() => {
    // Only auto-submit when we have 6 digits AND haven't already tried this code
    if (code.length === 6 && !isSubmitting && stage === "code" && !codeAttempted) {
      handleVerifyCodeSubmit();
    }
  }, [code, handleVerifyCodeSubmit, isSubmitting, stage, codeAttempted]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signIn) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setStage("code");
      setIsSubmitting(false);
    } catch (err) {
      const errCode = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.code;
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;

      if (errCode === "form_identifier_not_found" || errCode === "identifier_not_found") {
        setError("Couldn't find your account.");
      } else if (message) {
        setError(message);
      } else {
        setError("We couldn't send a reset code. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn || isResending) return;

    setIsResending(true);
    setError("");
    setCode("");
    setCodeAttempted(false);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      // Show success state briefly
      setTimeout(() => {
        setIsResending(false);
        firstCodeInputRef.current?.focus();
      }, 2000);
    } catch (err) {
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;
      if (message) {
        setError(String(message));
      } else {
        setError("Failed to resend code. Please try again.");
      }
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signIn) {
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      setError("Password must contain at least one special character");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push("/api/session");
          return;
        } else {
          setStage("success");
          setTimeout(() => {
            router.push("/sign-in");
          }, 3000);
          setIsSubmitting(false);
        }
      } else {
        setError("Failed to reset password. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;
      if (message) {
        setError(String(message));
      } else {
        setError("Failed to reset password. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  // Success state
  if (stage === "success") {
    return (
      <>
        <div className="ft-auth-header">
          <h1 className="ft-auth-title">Password Reset Complete</h1>
          <p className="ft-auth-subtitle">Your password has been successfully reset</p>
        </div>

        <div className="ft-auth-success">
          <div className="ft-auth-success-icon">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="ft-auth-success-message">
            Redirecting you to sign in...
          </p>

          <div className="ft-auth-progress-bar">
            <div className="ft-auth-progress-track">
              <div className="ft-auth-progress-fill"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="ft-auth-header">
        <h1 className="ft-auth-title">
          {stage === "password" ? "Reset Password" : "Forgot Password?"}
        </h1>
        <p className="ft-auth-subtitle">
          {stage === "email" && "If you have an account with us, enter your email address and you will receive a reset code"}
          {stage === "code" && "Enter the 6-digit code sent to your email"}
          {stage === "password" && "Enter your new password"}
        </p>
      </div>

      {/* Email Stage */}
      {stage === "email" && (
        <form onSubmit={handleSendCode} className="ft-auth-form">
          <div className="ft-auth-field">
            <label htmlFor="email" className="ft-auth-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="ft-auth-input"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="ft-auth-error">
              <p className="ft-auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? <span className="ft-auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Sending code..." : "Send Reset Code"}
          </Button.fire>
        </form>
      )}

      {/* Code Verification Stage */}
      {stage === "code" && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCodeSubmit(); }} className="ft-auth-form">
          <div className="ft-auth-field">
            <label htmlFor="code" className="ft-auth-code-label">
              Enter Verification Code
            </label>
            <div className="ft-auth-code-inputs">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={index === 0 ? firstCodeInputRef : null}
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
                  className="ft-auth-code-input"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <p className="ft-auth-code-help">
              6-digit code was sent to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="ft-auth-error">
              <p className="ft-auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            icon={isSubmitting ? <span className="ft-auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button.fire>

          <div className="ft-auth-resend">
            {!isResending ? (
              <>
                <span className="ft-auth-resend-text">Didn&apos;t receive the code? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="ft-auth-resend-button"
                >
                  Resend Code
                </button>
              </>
            ) : (
              <span className="ft-auth-resend-success">Code sent! Check your inbox</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setStage("email");
              setCode("");
              setError("");
            }}
            className="ft-auth-secondary-button"
          >
            ← Try a different email
          </button>
        </form>
      )}

      {/* New Password Stage */}
      {stage === "password" && (
        <form onSubmit={handleResetPassword} className="ft-auth-form">
          <div className="ft-auth-field">
            <label htmlFor="newPassword" className="ft-auth-label">
              New Password
            </label>
            <div className="ft-auth-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                className="ft-auth-input ft-auth-input-with-icon"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ft-auth-input-icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon variant={showPassword ? "eye-off" : "eye"} size="sm" />
              </button>
            </div>
            <p className="ft-auth-help-text">
              Must have: 6+ characters, 1 uppercase, 1 number, 1 symbol
            </p>
          </div>

          {error && (
            <div className="ft-auth-error">
              <p className="ft-auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? <span className="ft-auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button.fire>
        </form>
      )}

      {/* Back to Sign In */}
      <div className="ft-auth-footer-inline">
        <a href="/sign-in" className="ft-auth-link">
          ← Back to sign in
        </a>
      </div>
    </>
  );
}
