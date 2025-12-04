'use client';

/**──────────────────────────────────────────────────────────────────────────┐
 │  🚀 SETUP MODAL - New User Onboarding                                    │
 │  /src/features/SetupModal/index.tsx                                       │
 │                                                                            │
 │  Simplified setup modal for Captain/Pending users                         │
 │  No flying button engine - clean, direct implementation                   │
 │  Collects essential profile info on first login                           │
 └────────────────────────────────────────────────────────────────────────────*/

import { useState, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { useUser } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import { Button } from '@/prebuilts/button';
import VerifyModal from '@/features/UserSetup/VerifyModal';
import { skipFlow } from '@/features/UserSetup/FlyingButton/config';

interface SetupData {
  firstName: string;
  lastName: string;
  entityName: string;
  socialName: string;
  orgSlug: string;
  businessCountry: string;
}

interface SetupErrors {
  firstName?: string;
  lastName?: string;
  entityName?: string;
  socialName?: string;
  orgSlug?: string;
  businessCountry?: string;
  general?: string;
}

interface SetupModalProps {
  onComplete: (data: SetupData) => void;
  onSkip: () => void;
  isFadingOut?: boolean;
  isFadingIn?: boolean;
  isHidden?: boolean;
}

export default function SetupModal({ onComplete, onSkip, isFadingOut = false, isFadingIn = false, isHidden = false }: SetupModalProps) {
  const user = useFuse((s) => s.user);
  const updateUser = useFuse((s) => s.updateUser);
  const { user: clerkUser, isLoaded } = useUser();

  const [formData, setFormData] = useState<SetupData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    entityName: user?.entityName || '',
    socialName: user?.socialName || '',
    orgSlug: '',
    businessCountry: user?.businessCountry || 'AU'
  });

  const [errors, setErrors] = useState<SetupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  // Hide button initially if we're fading in (reverse flow from topbar)
  const [hideSetupButton, setHideSetupButton] = useState(isFadingIn);

  // Update button visibility when fading in (reverse flow)
  useEffect(() => {
    if (isFadingIn) {
      setHideSetupButton(true); // Hide button when modal is fading in
    }
  }, [isFadingIn]);

  // Listen for Phoenix returning to modal
  useEffect(() => {
    const handlePhoenixApproaching = () => {
      // Show the setup button BEFORE Phoenix arrives
      setHideSetupButton(false);
    };

    const handlePhoenixReturned = () => {
      // Phoenix has fully landed - button should already be visible
      // This is now just for cleanup/confirmation
    };

    window.addEventListener('phoenixApproachingModal', handlePhoenixApproaching);
    window.addEventListener('phoenixReturnedToModal', handlePhoenixReturned);
    return () => {
      window.removeEventListener('phoenixApproachingModal', handlePhoenixApproaching);
      window.removeEventListener('phoenixReturnedToModal', handlePhoenixReturned);
    };
  }, []);

  // Avatar cycling - female → male → female → inclusive → repeat (7s per avatar)
  const avatarProfiles = ['male', 'female', 'inclusive'] as const;
  const cyclePattern = [1, 0, 1, 2]; // Maps to: female, male, female, inclusive
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const currentAvatarIndex = cyclePattern[currentCycleIndex];

  // Advance to next avatar in pattern every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCycleIndex((prev) => (prev + 1) % 4);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Sync with user's businessCountry when it changes
  useEffect(() => {
    if (user?.businessCountry && user.businessCountry !== formData.businessCountry) {
      setFormData(prev => ({ ...prev, businessCountry: user.businessCountry || 'AU' }));
    }
  }, [user?.businessCountry, formData.businessCountry]);

  const handleInputChange = (field: keyof SetupData, value: string) => {
    // Special handling for socialName - only allow letters, numbers and ONE dot
    if (field === 'socialName') {
      // Check if there's already a dot in the current value
      const currentHasDot = formData.socialName.includes('.');

      // If no dot yet and user types space, convert it to dot
      if (!currentHasDot && value.includes(' ')) {
        value = value.replace(' ', '.');
      }

      // Remove any character that isn't a-z, A-Z, 0-9, or dot
      value = value.replace(/[^a-zA-Z0-9.]/g, '');

      // If there's more than one dot, keep only the first one
      const dotIndex = value.indexOf('.');
      if (dotIndex !== -1) {
        const beforeDot = value.substring(0, dotIndex);
        const afterDot = value.substring(dotIndex + 1).replace(/\./g, '');
        value = beforeDot + '.' + afterDot;
      }
    }

    // Auto-generate orgSlug from entityName
    if (field === 'entityName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
        .substring(0, 30);             // Limit length

      setFormData(prev => ({
        ...prev,
        [field]: value,
        orgSlug: slug
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBusinessCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, businessCountry: value }));
    // Update user in store immediately (optimistic update)
    updateUser({ businessCountry: value });
  };

  const validateForm = (): boolean => {
    const newErrors: SetupErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.entityName.trim()) {
      newErrors.entityName = 'Entity name is required';
    }
    if (!formData.socialName.trim()) {
      newErrors.socialName = 'Social name is required';
    } else if (formData.socialName.length < 3) {
      newErrors.socialName = 'Social name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!isLoaded || !clerkUser) {
        throw new Error('Clerk user not loaded');
      }

      const primaryEmail = clerkUser.primaryEmailAddress;

      if (primaryEmail?.verification?.status === 'verified') {
        // Email already verified - proceed directly
        await onComplete(formData);
        setIsSubmitting(false);
      } else if (primaryEmail) {
        // Email exists but not verified - send verification code
        try {
          console.log('📧 Sending verification code to:', primaryEmail.emailAddress);
          await primaryEmail.prepareVerification({ strategy: 'email_code' });
          console.log('✅ Verification code sent successfully');

          // Show verification modal
          setShowEmailVerification(true);
          setIsSubmitting(false);
        } catch (err) {
          console.error('❌ Failed to send verification code:', err);
          setErrors({ ...errors, general: 'Failed to send verification code. Please try again.' });
          setIsSubmitting(false);
        }
      } else {
        // No primary email
        setErrors({ ...errors, general: 'No email address found. Please contact support.' });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ ...errors, general: 'Email verification failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleEmailVerified = async () => {
    // Close verification modal
    setShowEmailVerification(false);

    // Update store immediately
    updateUser({ emailVerified: true, setupStatus: 'complete' });

    // Call onComplete with form data
    try {
      await onComplete(formData);
    } catch {
      // Silent fail - user already sees success
    }
  };

  const handleVerificationCancelled = () => {
    setShowEmailVerification(false);
    setIsSubmitting(false);
  };

  return (
    <div
      className={`ft-setup-modal ${isFadingOut ? 'ft-setup-modal--fading-out' : ''} ${isFadingIn ? 'ft-setup-modal--fading-in' : ''} ${isHidden ? 'ft-setup-modal--hidden' : ''}`}
      data-fade-duration={skipFlow.modalFadeDuration}
      data-rollup-duration={skipFlow.modalRollUpDuration}>
        {/* Background decoration */}
        <div className="ft-setup-bg-container">
          <div className="ft-setup-blur-circle-1" />
          <div className="ft-setup-blur-circle-2" />
        </div>

      {/* Background image - Winding Road */}
      <div className="ft-setup-image-container">
        <div className="ft-setup-image-wrapper">
          <img
            src="/images/sitewide/transfoorm-success.png"
            alt="Your journey starts here"
            className="ft-setup-image"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="ft-setup-content">
        <div className="ft-setup-grid">

          {/* Left side - Compelling message */}
          <div className="ft-setup-left">
            {/* Logo/Brand */}
            <div className="ft-setup-logo-container">
              <div className="ft-setup-logo-wrapper">
                <div className="ft-setup-logo-glow" />
                <div className="ft-setup-logo-box">
                  <img
                    src="/images/brand/pink_logo.png"
                    alt="Transfoorm"
                    className="ft-setup-logo-img"
                  />
                </div>
              </div>
              <div>
                <h3 className="ft-setup-brand-name">Transfoorm</h3>
                <p className="ft-setup-brand-tagline">A platform for people who make a difference</p>
              </div>
            </div>

            {/* Main headline */}
            <div className="ft-setup-headline-section">
              <h1 className="ft-setup-headline">
                <span className="ft-setup-headline-primary">Turn purpose </span>
                <br />
                <span className="ft-setup-headline-gradient">into profit</span>
              </h1>
              <p className="ft-setup-subtext">
                You&apos;ve been searching for a way to live your passion, make an impact, and thrive financially while making your mark in the world. Your prospects are waiting, your potential is brimming... <i>now it&apos;s time to let it out!</i>
              </p>
            </div>

            {/* Benefits */}
            <div className="ft-setup-benefits">
              <div className="ft-setup-benefit-item">
                <div className="ft-setup-benefit-icon">
                  {/* Render all 3 unique avatars stacked - cycle pattern controls which shows */}
                  {avatarProfiles.map((profile, index) => (
                    <img
                      key={index}
                      src={`/images/sitewide/miror_${profile}.png`}
                      alt="AI Avatar"
                      className={`ft-setup-avatar-image ${currentAvatarIndex === index ? 'ft-setup-avatar-image--active' : ''}`}
                    />
                  ))}
                </div>
                <div className="ft-setup-benefit-content">
                  <h4 className="ft-setup-benefit-title ft-setup-benefit-title-nowrap">AI Personal Assistance</h4>
                  <p className="ft-setup-benefit-text"><i>Hello I&apos;m Miror, your inclusive AI task agent. Let&apos;s go!</i></p>
                </div>
              </div>

              <div className="ft-setup-benefit-item">
                <div className="ft-setup-benefit-icon">
                  <img
                    src="/images/sitewide/purpose.png"
                    alt="Purpose"
                  />
                </div>
                <div className="ft-setup-benefit-content">
                  <h4 className="ft-setup-benefit-title">Purpose Driven</h4>
                  <p className="ft-setup-benefit-text">We are geared towards turning passion into profit</p>
                </div>
              </div>

              <div className="ft-setup-benefit-item">
                <div className="ft-setup-benefit-icon">
                  <img
                    src="/images/sitewide/clients.png"
                    alt="Clients"
                  />
                </div>
                <div className="ft-setup-benefit-content">
                  <h4 className="ft-setup-benefit-title ft-setup-benefit-title-nowrap">Scale Without Limits</h4>
                  <p className="ft-setup-benefit-text">1 to 10,000 clients with all the tools you need in one</p>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="ft-setup-social-proof">
              <div className="ft-setup-divider"></div>
              <div className="ft-setup-proof-container">
                <img
                  src="/images/sitewide/trust-shield.png"
                  alt="Trust Shield"
                  className="ft-setup-proof-shield"
                />
                <p className="ft-setup-proof-text">
                  Trusted by <span className="ft-setup-proof-highlight">2,847 transformation agents</span> who have impacted <span className="ft-setup-proof-highlight">126,000+</span> lives.
                  <span className="ft-setup-proof-highlight"> 317 creators of change</span> joined Transfoorm™ this week!
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Setup Form */}
          <div className="ft-setup-form-container">
            {/* Welcome message */}
            <div className="ft-setup-welcome">
              <p className="ft-setup-welcome-text">
                *Completing your setup will enhance your experience with personalised features and smarter AI assistance.
                You can change your details via settings at any time.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="ft-setup-form">
              {/* First Name */}
              <div className="ft-setup-field">
                <label className="ft-setup-label">
                  First Name <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Ace"
                  className={`ft-setup-input ${
                    errors.firstName ? 'ft-setup-input-error' : ''
                  }`}
                />
                {errors.firstName && (
                  <p className="ft-setup-error-text">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="ft-setup-field">
                <label className="ft-setup-label">
                  Last Name <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Ventura"
                  className={`ft-setup-input ${
                    errors.lastName ? 'ft-setup-input-error' : ''
                  }`}
                />
                {errors.lastName && (
                  <p className="ft-setup-error-text">{errors.lastName}</p>
                )}
              </div>

              {/* Entity Name */}
              <div className="ft-setup-field">
                <label className="ft-setup-label">
                  Entity <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => handleInputChange('entityName', e.target.value)}
                  placeholder="Ventura Coaching Academy"
                  className={`ft-setup-input ${
                    errors.entityName ? 'ft-setup-input-error' : ''
                  }`}
                />
                {errors.entityName && (
                  <p className="ft-setup-error-text">{errors.entityName}</p>
                )}
              </div>

              {/* Social Name */}
              <div className="ft-setup-field">
                <label className="ft-setup-label">
                  Social <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.socialName}
                  onChange={(e) => handleInputChange('socialName', e.target.value)}
                  placeholder="Ace.Ventura5"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  className={`ft-setup-input ${
                    errors.socialName ? 'ft-setup-input-error' : ''
                  }`}
                />
                {errors.socialName && (
                  <p className="ft-setup-error-text">{errors.socialName}</p>
                )}
                <p className="ft-setup-help-text">
                  * Uppercase and lowercase letters, numbers and one period (dot). No symbols or special characters. You can change settings later.
                </p>
              </div>

              {/* Business Country */}
              <div className="ft-setup-field">
                <label className="ft-setup-label">
                  Business Location
                </label>
                <select
                  value={formData.businessCountry}
                  onChange={(e) => handleBusinessCountryChange(e.target.value)}
                  className="ft-setup-input"
                >
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                </select>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="ft-setup-error-box">
                  <p className="ft-setup-error-box-text">{errors.general}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="ft-setup-button-row">
                {/* Setup button container */}
                <div className="ft-setup-button-wrapper">
                  {/* Phantom button - ALWAYS present for GPS positioning */}
                  <Button.fire
                    icon={<Sparkles />}
                    data-setup-source
                    className="ft-setup-phantom"
                  >
                    Complete my setup
                  </Button.fire>

                  {/* Real button - positioned on top */}
                  {!hideSetupButton && (
                    <Button.fire
                      type="submit"
                      disabled={isSubmitting}
                      icon={<Sparkles />}
                      className="ft-setup-real-button"
                    >
                      {isSubmitting ? 'Setting up...' : 'Complete my setup'}
                    </Button.fire>
                  )}
                </div>

                <Button.ghost
                  type="button"
                  onClick={() => {
                    // Get BOTH positions BEFORE anything changes
                    const sourceButton = document.querySelector('[data-setup-source]') as HTMLElement;
                    const targetButton = document.querySelector('[data-setup-target]') as HTMLElement;

                    if (sourceButton && targetButton) {
                      const sourceRect = sourceButton.getBoundingClientRect();
                      const targetRect = targetButton.getBoundingClientRect();

                      // HOUDINI SWITCH: Hide modal button IMMEDIATELY
                      setHideSetupButton(true);

                      // Trigger phoenix with positions AND dimensions
                      window.dispatchEvent(new CustomEvent('phoenixShow', {
                        detail: {
                          sourceX: sourceRect.left,
                          sourceY: sourceRect.top,
                          sourceWidth: sourceRect.width,
                          targetX: targetRect.left,
                          targetY: targetRect.top,
                        }
                      }));
                    }

                    // Let dashboard handle the fade-out timing
                    onSkip();
                  }}
                  disabled={isSubmitting}
                >
                  Skip for now
                </Button.ghost>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <VerifyModal
        isOpen={showEmailVerification}
        email={user?.email || ''}
        onSuccess={handleEmailVerified}
        onClose={handleVerificationCancelled}
      />
    </div>
  );
}
