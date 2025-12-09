'use client';

/**──────────────────────────────────────────────────────────────────────────┐
 │  🚀 SETUP MODAL - New User Onboarding                                    │
 │  /src/features/UserSetup/SetupModal/index.tsx                            │
 │                                                                            │
 │  VR-Sovereign: Owns ALL visibility, animation, AND server actions.        │
 │  Dashboard just renders <SetupModal /> - pure declarative, zero ceremony. │
 │                                                                            │
 │  Owns:                                                                     │
 │  - handleSetupComplete (server action + FUSE update)                       │
 │  - handleSkip (Phoenix animation + skip state)                             │
 │  - All form validation and submission                                      │
 │                                                                            │
 │  Reads from FUSE:                                                          │
 │  - user.rank, user.setupStatus (visibility condition)                      │
 │  - modalSkipped (skip state)                                               │
 │  - modalReturning (reverse flow trigger)                                   │
 │                                                                            │
 │  Listens to:                                                               │
 │  - bringModalBack event (reverse flow animation)                           │
 │  - phoenixApproachingModal event (button reveal timing)                    │
 └────────────────────────────────────────────────────────────────────────────*/

import { useState, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { Sparkles } from 'lucide-react';
import { Button, VerifyModal } from '@/prebuilts';
import { skipFlow, reverseFlow } from '@/features/UserSetup/FlyingButton/config';
import { completeSetupAction } from '@/app/actions/user-mutations';
import { checkPrimaryEmailVerified, preparePrimaryEmailVerification } from '@/app/actions/email-actions';

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

export default function SetupModal() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const updateUser = useFuse((s) => s.updateUser);
  const showRedArrow = useFuse((s) => s.showRedArrow);
  const setShowRedArrow = useFuse((s) => s.setShowRedArrow);
  const modalSkipped = useFuse((s) => s.modalSkipped);
  const setModalSkipped = useFuse((s) => s.setModalSkipped);
  const modalReturning = useFuse((s) => s.modalReturning);
  const setModalReturning = useFuse((s) => s.setModalReturning);

  // ─────────────────────────────────────────────────────────────────────
  // Internal Animation State (VR-sovereign - no props from parent)
  // ─────────────────────────────────────────────────────────────────────
  const [isModalFadingOut, setIsModalFadingOut] = useState(false);
  const [isModalFadingIn, setIsModalFadingIn] = useState(modalReturning);

  // ─────────────────────────────────────────────────────────────────────
  // Form State
  // ─────────────────────────────────────────────────────────────────────
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
  const [hideSetupButton, setHideSetupButton] = useState(modalReturning);
  // Track which placeholders are hidden (during error display)
  const [hiddenPlaceholders, setHiddenPlaceholders] = useState<Set<string>>(new Set());

  // ─────────────────────────────────────────────────────────────────────
  // Visibility Computation (internal, not from props)
  // ─────────────────────────────────────────────────────────────────────
  const shouldShow = user?.rank === 'captain' && user?.setupStatus === 'pending' && !modalSkipped;
  const isHidden = !shouldShow && !isModalFadingOut && !isModalFadingIn;

  // ─────────────────────────────────────────────────────────────────────
  // modalReturning Handler (reverse flow from different page)
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (modalReturning) {
      setIsModalFadingIn(true);
      setHideSetupButton(true);
      setTimeout(() => {
        setModalReturning(false);
        setIsModalFadingIn(false);
      }, reverseFlow.modalFadeInDuration);
    }
  }, [modalReturning, setModalReturning]);

  // ─────────────────────────────────────────────────────────────────────
  // bringModalBack Event Listener (reverse flow same page)
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleBringModalBack = () => {
      // Wait for modalShowDelay from config before showing modal
      setTimeout(() => {
        // Reset skip state and trigger modal to fade in
        setModalSkipped(false);
        setIsModalFadingIn(true);
        setHideSetupButton(true);

        // After fade-in animation completes, set to normal state
        setTimeout(() => {
          setIsModalFadingIn(false);
        }, reverseFlow.modalFadeInDuration);
      }, reverseFlow.modalShowDelay);
    };

    window.addEventListener('bringModalBack', handleBringModalBack);
    return () => {
      window.removeEventListener('bringModalBack', handleBringModalBack);
    };
  }, [setModalSkipped]);

  // ─────────────────────────────────────────────────────────────────────
  // Phoenix Event Listeners
  // ─────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────
  // Avatar Cycling
  // ─────────────────────────────────────────────────────────────────────
  const avatarProfiles = ['male', 'female', 'inclusive'] as const;
  const cyclePattern = [1, 0, 1, 2]; // Maps to: female, male, female, inclusive
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const currentAvatarIndex = cyclePattern[currentCycleIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCycleIndex((prev) => (prev + 1) % 4);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Sync with user's businessCountry
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.businessCountry && user.businessCountry !== formData.businessCountry) {
      setFormData(prev => ({ ...prev, businessCountry: user.businessCountry || 'AU' }));
    }
  }, [user?.businessCountry, formData.businessCountry]);

  // ─────────────────────────────────────────────────────────────────────
  // Error placeholder management
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const errorFields = Object.keys(errors).filter(key => errors[key as keyof SetupErrors]);

    if (errorFields.length > 0) {
      setHiddenPlaceholders(new Set(errorFields));

      const timer = setTimeout(() => {
        setHiddenPlaceholders(new Set());
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  // ─────────────────────────────────────────────────────────────────────
  // Form Handlers
  // ─────────────────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof SetupData, value: string) => {
    // Special handling for socialName - only allow letters, numbers and ONE dot
    if (field === 'socialName') {
      const currentHasDot = formData.socialName.includes('.');

      if (!currentHasDot && value.includes(' ')) {
        value = value.replace(' ', '.');
      }

      value = value.replace(/[^a-zA-Z0-9.]/g, '');

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
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);

      setFormData(prev => ({
        ...prev,
        [field]: value,
        orgSlug: slug
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setHiddenPlaceholders(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const handleFieldFocus = () => {
    const hasErrors = Object.values(errors).some(e => e);
    if (hasErrors) {
      setErrors({});
      setHiddenPlaceholders(new Set());
    }
  };

  const handleBusinessCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, businessCountry: value }));
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
      newErrors.socialName = 'Username is required';
    } else if (formData.socialName.length < 3) {
      newErrors.socialName = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const trimmedData: SetupData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      entityName: formData.entityName.trim(),
      socialName: formData.socialName.trim(),
      orgSlug: formData.orgSlug.trim(),
    };

    try {
      // 🛡️ SID Phase 12: Use server action to check verification status
      const verificationCheck = await checkPrimaryEmailVerified();

      if (verificationCheck.error) {
        setErrors({ ...errors, general: verificationCheck.error });
        setIsSubmitting(false);
        return;
      }

      if (verificationCheck.verified) {
        // Email already verified - complete setup directly
        await handleSetupComplete(trimmedData);
        setIsSubmitting(false);
      } else {
        // Email needs verification - prepare and show modal
        try {
          console.log('📧 Checking verification status for email');
          const prepResult = await preparePrimaryEmailVerification();

          if (prepResult.error) {
            setErrors({ ...errors, general: prepResult.error });
            setIsSubmitting(false);
            return;
          }

          if (prepResult.alreadyVerified) {
            // Already verified - complete setup
            await handleSetupComplete(trimmedData);
            setIsSubmitting(false);
            return;
          }

          // Show verification modal - the modal will handle prepareVerification
          // via Clerk SDK (it's in the auth boundary)
          console.log('✅ Opening verification modal');
          setShowEmailVerification(true);
          setIsSubmitting(false);
        } catch (err) {
          console.error('❌ Failed to prepare verification:', err);
          setErrors({ ...errors, general: 'Failed to send verification code. Please try again.' });
          setIsSubmitting(false);
        }
      }
    } catch {
      setErrors({ ...errors, general: 'Email verification failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleEmailVerified = async () => {
    setShowEmailVerification(false);

    updateUser({ emailVerified: true, setupStatus: 'complete' });

    const trimmedData: SetupData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      entityName: formData.entityName.trim(),
      socialName: formData.socialName.trim(),
      orgSlug: formData.orgSlug.trim(),
    };

    try {
      await handleSetupComplete(trimmedData);
    } catch {
      // Silent fail - user already sees success
    }
  };

  const handleVerificationCancelled = () => {
    setShowEmailVerification(false);
    setIsSubmitting(false);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Setup Complete Handler (server action + FUSE update)
  // ─────────────────────────────────────────────────────────────────────
  const handleSetupComplete = async (data: SetupData) => {
    try {
      // Update FUSE store optimistically
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        businessCountry: data.businessCountry,
        setupStatus: 'complete',
        emailVerified: true,
      });

      // Call server action to persist to database and update session cookie
      const result = await completeSetupAction({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        orgSlug: data.orgSlug,
        businessCountry: data.businessCountry,
      });

      if (!result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      // Update store with fresh data from server (DB → Cookie → Store → UI)
      if (result.user) {
        updateUser({
          setupStatus: result.user.setupStatus as 'pending' | 'complete',
          firstName: result.user.firstName || undefined,
          lastName: result.user.lastName || undefined,
          entityName: result.user.entityName || undefined,
          socialName: result.user.socialName || undefined,
          businessCountry: result.user.businessCountry || undefined,
        });
      }

      console.log('✅ Setup completed successfully');
    } catch (error) {
      console.error('Setup failed:', error);
      // Revert optimistic update
      updateUser({ setupStatus: 'pending' });
      throw error; // Re-throw to let modal handle error display
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Skip Handler (internal - triggers Phoenix and fade out)
  // ─────────────────────────────────────────────────────────────────────
  const handleSkip = () => {
    // Get state functions and check if in Shadow King mode
    const { shadowKingActive, setShadowKingActive } = useFuse.getState();

    if (shadowKingActive) {
      // Shadow King mode: just close it, no Phoenix animation
      setShadowKingActive(false);
      setModalSkipped(true);
      setShowRedArrow(false);
      console.log('👑 Shadow King: Skipped, returning to app');
      return;
    }

    // Normal mode: trigger Phoenix animation
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

    // Set skip state in FUSE store
    setModalSkipped(true);

    // Hide red arrow if visible
    setShowRedArrow(false);

    // Start the fade-out animation
    setIsModalFadingOut(true);

    // Wait for animation to complete, then clear fade state
    setTimeout(() => {
      setIsModalFadingOut(false);
    }, skipFlow.modalUnmountDelay);

    console.log('⏭️ Setup skipped by user');
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`ft-setup-modal ${isModalFadingOut ? 'ft-setup-modal--fading-out' : ''} ${isModalFadingIn ? 'ft-setup-modal--fading-in' : ''} ${isHidden ? 'ft-setup-modal--hidden' : ''}`}
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
                *Complete your setup and enhance user experience with personalised features and smarter AI assistance. Go to the <i>Account</i> page and change your details at any time.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="ft-setup-form">
              {/* First Name */}
              <div className="ft-setup-field ft-setup-field--first-name">
                <label className="ft-setup-label">
                  First Name <span className="ft-setup-required">*</span>
                </label>
                <div className="ft-setup-input-wrapper">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      handleInputChange('firstName', e.target.value);
                      if (showRedArrow) setShowRedArrow(false);
                    }}
                    onFocus={() => {
                      if (showRedArrow) setShowRedArrow(false);
                      handleFieldFocus();
                    }}
                    placeholder={hiddenPlaceholders.has('firstName') ? '' : 'Ace'}
                    className={`ft-setup-input ${
                      errors.firstName ? 'ft-setup-input-error' : ''
                    }`}
                  />
                  {showRedArrow && (
                    <img
                      src="/images/sitewide/brand_arrow.png"
                      alt="Fill this in"
                      className="ft-setup-red-arrow"
                    />
                  )}
                </div>
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
                  onFocus={handleFieldFocus}
                  placeholder={hiddenPlaceholders.has('lastName') ? '' : 'Ventura'}
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
                  Entity / Organisation <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => handleInputChange('entityName', e.target.value)}
                  onFocus={handleFieldFocus}
                  placeholder={hiddenPlaceholders.has('entityName') ? '' : 'Ventura Coaching Academy'}
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
                  Username <span className="ft-setup-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.socialName}
                  onChange={(e) => handleInputChange('socialName', e.target.value)}
                  onFocus={handleFieldFocus}
                  placeholder={hiddenPlaceholders.has('socialName') ? '' : 'Ace.Ventura5'}
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
                  onClick={handleSkip}
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
