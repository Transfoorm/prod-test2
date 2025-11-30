"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { Icon } from '@/prebuilts/icon/iconRegistry';
import { Button } from '@/prebuilts/button';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Optimistic state, not loading
  const [slowConnectionWarning, setSlowConnectionWarning] = useState(false);

  // Check for error query param on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_failed') {
      setError("Session creation failed. Please try signing in again.");
    }
  }, []);

  // FUSE: Redirect to session API to mint cookie before loading dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/api/session");
    }
  }, [isLoaded, isSignedIn, router]);

  // Timeout warning: Show message if authentication takes too long, then auto-refresh
  useEffect(() => {
    let warningTimeoutId: NodeJS.Timeout;
    let refreshTimeoutId: NodeJS.Timeout;

    if (isSubmitting) {
      // Show warning after 5 seconds
      warningTimeoutId = setTimeout(() => {
        setSlowConnectionWarning(true);
      }, 5000);

      // Auto-refresh after 10 seconds total (5 more seconds after warning)
      refreshTimeoutId = setTimeout(() => {
        window.location.reload();
      }, 10000);
    } else {
      setSlowConnectionWarning(false);
    }

    return () => {
      clearTimeout(warningTimeoutId);
      clearTimeout(refreshTimeoutId);
    };
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signIn) {
      return;
    }

    setError("");
    setIsSubmitting(true); // Optimistic - assume success

    try {
      // Create the sign in
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });

        // FUSE: Redirect to session API to mint session cookie
        router.push("/api/session");
        return; // Exit early to keep spinner
      } else {
        setError("Sign in failed. Please check your credentials.");
        setIsSubmitting(false);
      }
    } catch (err) {
      // Handle Clerk errors properly without logging to console
      const code = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.code;
      const message = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message;

      if (code === 'form_identifier_not_found' || code === 'identifier_not_found') {
        setError("Couldn't find your account.");
      } else if (code === 'form_password_incorrect' || code === 'password_incorrect' || message?.includes("Password is incorrect")) {
        setError("Incorrect password. Please try again.");
      } else if (message) {
        // For other errors, show a generic message (not the raw Clerk message)
        setError("The authentication process needs you to refresh the page before trying again!");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo-wrapper">
          { }
          <img
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="auth-logo"
          />
        </div>

        {/* Sign In Form */}
        <div className="auth-card-wrapper">
          <div className="auth-card-glow"></div>
          <div className="auth-card">
            {/* Header */}
            <div className="auth-header">
              <h1 className="auth-title">Welcome back!</h1>
              <p className="auth-subtitle">Sign in to your account</p>
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="auth-error">
                  <p className="auth-error-text">{error}</p>
                </div>
              )}

              {/* Slow Connection Warning */}
              {slowConnectionWarning && (
                <div className="auth-warning">
                  <p className="auth-warning-text">
                    This is taking longer than usual. Refreshing page in a few seconds...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button.primary
                type="submit"
                disabled={isSubmitting || !isLoaded}
                className="auth-submit-gradient"
                icon={isSubmitting ? <span className="auth-spinner" /> : undefined}
                iconPosition="left"
                fullWidth
              >
                {isSubmitting ? "Authenticating..." : "Sign in"}
              </Button.primary>

              {/* Forgot Password Link */}
              <div className="auth-link-wrapper">
                <a href="/reset" className="auth-link">
                  Forgot your password?
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="auth-link-wrapper">
          <p className="auth-footer-text">
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="auth-footer-link">
              Sign up for free
            </a>
          </p>
        </div>

        {/* FUSE 4.0 Note */}
        <div className="auth-note">
          <p className="auth-note-text">
            Powered by FUSE 4.0 • Instant Everything!
          </p>
        </div>
      </div>
    </div>
  );
}
