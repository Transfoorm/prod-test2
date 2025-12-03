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
  const firstCodeInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyCodeSubmit = useCallback(async () => {
    if (!isLoaded || !signIn) {
      return;
    }

    setError("");
    setIsSubmitting(true);

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
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Code verification error:", err);
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;
      if (message) {
        setError(String(message));
      } else {
        setError("Invalid code. Please try again.");
      }
      setIsSubmitting(false);
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
    if (code.length === 6 && !isSubmitting && stage === "code") {
      handleVerifyCodeSubmit();
    }
  }, [code, handleVerifyCodeSubmit, isSubmitting, stage]);

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
        <div className="auth-header">
          <h1 className="auth-title">Password Reset Complete</h1>
          <p className="auth-subtitle">Your password has been successfully reset</p>
        </div>

        <div className="auth-success">
          <div className="auth-success-icon">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="auth-success-message">
            Redirecting you to sign in...
          </p>

          <div className="auth-progress-bar">
            <div className="auth-progress-track">
              <div className="auth-progress-fill"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="auth-header">
        <h1 className="auth-title">
          {stage === "password" ? "Reset Password" : "Forgot Password?"}
        </h1>
        <p className="auth-subtitle">
          {stage === "email" && "If you have an account with us, enter your email address and you will receive a reset code"}
          {stage === "code" && "Enter the 6-digit code sent to your email"}
          {stage === "password" && "Enter your new password"}
        </p>
      </div>

      {/* Email Stage */}
      {stage === "email" && (
        <form onSubmit={handleSendCode} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
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
              className="auth-input"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="auth-error">
              <p className="auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? <span className="auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Sending code..." : "Send Reset Code"}
          </Button.fire>
        </form>
      )}

      {/* Code Verification Stage */}
      {stage === "code" && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCodeSubmit(); }} className="auth-form">
          <div className="auth-field">
            <label htmlFor="code" className="auth-code-label">
              Verification Code
            </label>
            <div className="auth-code-inputs">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={index === 0 ? firstCodeInputRef : null}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 1) {
                      const newCode = code.split('');
                      newCode[index] = value;
                      setCode(newCode.join(''));

                      if (value && index < 5) {
                        const target = e.target as HTMLInputElement;
                        const nextInput = target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      const target = e.currentTarget as HTMLInputElement;
                      const prevInput = target.parentElement?.children[index - 1] as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    setCode(pastedData);

                    const targetIndex = Math.min(pastedData.length, 5);
                    const targetInput = e.currentTarget.parentElement?.children[targetIndex] as HTMLInputElement;
                    targetInput?.focus();
                  }}
                  className="auth-code-input"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <p className="auth-code-help">
              Check your inbox for the 6-digit code
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <p className="auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            icon={isSubmitting ? <span className="auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button.fire>

          <button
            type="button"
            onClick={() => {
              setStage("email");
              setCode("");
              setError("");
            }}
            className="auth-secondary-button"
          >
            ← Try a different email
          </button>
        </form>
      )}

      {/* New Password Stage */}
      {stage === "password" && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="auth-field">
            <label htmlFor="newPassword" className="auth-label">
              New Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                className="auth-input auth-input-with-icon"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon variant={showPassword ? "eye-off" : "eye"} size="sm" />
              </button>
            </div>
            <p className="auth-help-text">
              Must have: 6+ characters, 1 uppercase, 1 number, 1 symbol
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <p className="auth-error-text">{error}</p>
            </div>
          )}

          <Button.fire
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? <span className="auth-spinner" /> : undefined}
            iconPosition="left"
            fullWidth
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button.fire>
        </form>
      )}

      {/* Back to Sign In */}
      <div className="auth-footer-inline">
        <a href="/sign-in" className="auth-link">
          ← Back to sign in
        </a>
      </div>
    </>
  );
}
