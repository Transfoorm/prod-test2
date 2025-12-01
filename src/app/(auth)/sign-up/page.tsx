"use client";

/**──────────────────────────────────────────────────────────────────────┐
│  🔐 SIGN UP PAGE - TTT-CERTIFIED CLIENT FORM                          │
│  /src/app/(auth)/sign-up/page.tsx                                      │
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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useSignIn, useAuth } from "@clerk/nextjs";
import { Icon } from '@/prebuilts/icon/iconRegistry';
import { Button } from '@/prebuilts/button';

export default function SignUpPage() {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Silently redirect to dashboard if already signed in
  useEffect(() => {
    if (signUpLoaded && isSignedIn) {
      router.push("/");
    }
  }, [signUpLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpLoaded || !signUp || !signIn) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const signUpResult = await signUp.create({
        emailAddress: email,
        password,
      });

      if (signUpResult.status === "complete") {
        if (signUpResult.createdSessionId) {
          await setActive({ session: signUpResult.createdSessionId });
          router.push("/api/session");
          return;
        } else {
          router.push("/sign-in");
          setIsSubmitting(false);
        }
      } else {
        router.push("/sign-in");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;
      setError(message ? String(message) : "Sign up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="auth-header">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your transformation journey today</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            >
              <Icon variant={showPassword ? "eye-off" : "eye"} size="sm" />
            </button>
          </div>
          <p className="auth-help-text">
            Password must include 1 uppercase, 1 number, and 1 symbol.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <p className="auth-error-text">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button.primary
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-gradient"
          icon={isSubmitting ? <span className="auth-spinner" /> : undefined}
          iconPosition="left"
          fullWidth
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button.primary>

        {/* Terms */}
        <p className="auth-terms">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>

      {/* Sign In Link */}
      <div className="auth-footer-inline">
        <p className="auth-footer-text">
          Already have an account?{" "}
          <a href="/sign-in" className="auth-footer-link">
            Sign in
          </a>
        </p>
      </div>
    </>
  );
}
