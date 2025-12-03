/**──────────────────────────────────────────────────────────────────────┐
│  📍 TOPBAR - Full-Width Frame with Logo (WCCC ly-* Compliant)         │
│  /src/shell/Topbar/Topbar.tsx                                         │
│                                                                        │
│  Topbar with logo on left side and Clerk UserButton on right.          │
│  Uses Sovereign Router for navigation (FUSE 6.0).                      │
│  Uses: --topbar-height, --topbar-bg, --topbar-logo-width              │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { Button } from '@/prebuilts/button';
import { useFuse } from '@/store/fuse';
import { useRankCheck } from '@/fuse/hydration/hooks/useRankCheck';
import {
  reverseFlow,
  navAwayFromUnskippedFlow,
  navReturnFlow
} from '@/features/UserSetup/FlyingButton/config';


export default function Topbar() {
  const navigate = useFuse((s) => s.navigate);
  const route = useFuse((s) => s.sovereign.route);
  const user = useFuse((s) => s.user);
  const { isCaptain, isAdmiral } = useRankCheck();
  const modalSkipped = useFuse((s) => s.modalSkipped);
  const flyingButtonVisible = useFuse((s) => s.phoenixButtonVisible);
  const setFlyingButtonVisible = useFuse((s) => s.setPhoenixButtonVisible);
  const themeMode = useFuse((s) => s.themeMode);
  const [shouldFadeIn, setShouldFadeIn] = React.useState(false);
  const [shouldFadeOut, setShouldFadeOut] = React.useState(false);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  // Determine logo based on rank
  const getLogoSrc = () => {
    if (isAdmiral()) {
      return themeMode === 'dark'
        ? '/images/sitewide/admiral-logo_dk.png'
        : '/images/sitewide/admiral-logo.png';
    }
    return themeMode === 'dark'
      ? '/images/brand/transfoorm_dk.png'
      : '/images/brand/transfoorm.png';
  };

  // Listen for Phoenix landing event (skip flow complete)
  React.useEffect(() => {
    const handlePhoenixLanded = () => {
      // Phoenix has landed - show the real button immediately
      setFlyingButtonVisible(true);
    };

    window.addEventListener('phoenixLanded', handlePhoenixLanded);

    return () => {
      window.removeEventListener('phoenixLanded', handlePhoenixLanded);
    };
  }, [setFlyingButtonVisible]);

  // Show button when navigating away from unskipped modal
  React.useEffect(() => {
    const isOnHome = route === 'dashboard';
    const needsSetup = isCaptain() && user?.setupStatus === 'pending';
    const modalIsUnskipped = needsSetup && !modalSkipped;

    // GOLDEN RULE: If we're on home page with unskipped modal, hide topbar button
    // BUT NOT during reverse flow (isFadingOut means reverse is in progress)
    if (isOnHome && modalIsUnskipped && !isFadingOut) {
      if (flyingButtonVisible) {
        setIsFadingOut(true);
        setShouldFadeOut(true);
        setTimeout(() => {
          setFlyingButtonVisible(false);
          setIsFadingOut(false);
          setShouldFadeOut(false);
        }, navAwayFromUnskippedFlow.topbarButtonFadeOutDuration);
      }
      return;
    }

    // Keep button visible when in skip mode (Phoenix has already landed)
    if (modalSkipped && needsSetup) {
      // Button should remain visible during skip mode
      return;
    }

    // If we're NOT on home and modal is unskipped
    if (!isOnHome && modalIsUnskipped) {
      // If button is already visible, don't re-trigger everything!
      if (flyingButtonVisible) {
        return; // Button is already there, keep it solid like skipped mode
      }

      // Show button with fade-in animation
      setTimeout(() => {
        setShouldFadeIn(true);
        setFlyingButtonVisible(true);
        // Remove fade-in class after animation completes
        setTimeout(() => setShouldFadeIn(false), 400);
      }, navAwayFromUnskippedFlow.topbarButtonAppearDelay);
    }
  }, [route, modalSkipped, user, flyingButtonVisible, isCaptain, setFlyingButtonVisible, setShouldFadeIn, isFadingOut]);

  return (
    <header className="ly-topbar-header">
      <div className="ly-topbar-left-container">
      </div>

      <div className="ly-topbar-right-container">
        {/* Phantom button for flying button positioning */}
        {user?.setupStatus === 'pending' && (
          <Button.fire
            data-setup-target
            className={`whitespace-nowrap ly-topbar-phantom-button ${flyingButtonVisible ? 'ly-topbar-phantom-button--absolute' : 'ly-topbar-phantom-button--relative'}`}
            icon={<Sparkles />}
          >
            Complete my setup
          </Button.fire>
        )}

        {/* Real flying button - show when: skipped, fading out, OR nav-away from unskipped */}
        {user?.setupStatus === 'pending' && (modalSkipped || isFadingOut || route !== 'dashboard') && flyingButtonVisible && (
          <Button.fire
            className={`whitespace-nowrap animate-pulse-slow ly-topbar-setup-button ${shouldFadeIn ? 'ly-topbar-setup-button--fade-in' : ''} ${shouldFadeOut ? 'ly-topbar-setup-button--fade-out' : ''}`}
            icon={<Sparkles />}
            onMouseDown={(e) => {
              const isOnHomePage = route === 'dashboard';

              if (isOnHomePage) {
                // REVERSE FLOW: Bring modal back down

                // Get button positions for Phoenix flight - use the clicked button itself
                const sourceButton = e.currentTarget as HTMLElement;

                if (sourceButton) {
                  // Capture position IMMEDIATELY before anything changes
                  const buttonRect = sourceButton.getBoundingClientRect();

                  // Mark as fading to keep button visible (prevents useEffect from hiding instantly)
                  setIsFadingOut(true);

                  // Hide button after delay (blink disappear, no fade/motion)
                  setTimeout(() => {
                    setFlyingButtonVisible(false);
                    setIsFadingOut(false);
                  }, reverseFlow.topbarButtonFadeStartDelay);

                  // Tell dashboard to bring modal back
                  window.dispatchEvent(new CustomEvent('bringModalBack'));

                  // Fire Phoenix event after the ONE takeoff delay
                  setTimeout(() => {
                    // Use captured position
                    window.dispatchEvent(new CustomEvent('phoenixReverseFlow', {
                      detail: {
                        sourceX: buttonRect.left,
                        sourceY: buttonRect.top,
                        sourceWidth: buttonRect.width
                      }
                    }));

                  }, reverseFlow.phoenixTakeoffDelay); // THE ONE CLEAR DELAY from config
                }
              } else {
                // NOT on homepage - navigate home and trigger reverse-like flow
                // Capture position BEFORE navigation
                const sourceButton = e.currentTarget as HTMLElement;
                const buttonRect = sourceButton.getBoundingClientRect();

                // Set modalReturning BEFORE navigation so Dashboard reads it on mount
                const setModalReturning = useFuse.getState().setModalReturning;
                setModalReturning(true);

                // Reset modalSkipped BEFORE navigation so modal renders with page
                const setModalSkipped = useFuse.getState().setModalSkipped;
                setModalSkipped(false);

                // Navigate to home - modal will render with button hidden (modalReturning)
                navigate('dashboard');

                // Mark fading out to protect from useEffect
                setIsFadingOut(true);

                // Hide topbar button at configured delay
                setTimeout(() => {
                  setFlyingButtonVisible(false);
                  setIsFadingOut(false);
                }, reverseFlow.topbarButtonFadeStartDelay);

                // Dispatch bringModalBack after small delay for Dashboard to mount
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('bringModalBack'));
                }, navReturnFlow.bringModalBackDelay);

                // Fire Phoenix after modal has animated into position
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('phoenixReverseFlow', {
                    detail: {
                      sourceX: buttonRect.left,
                      sourceY: buttonRect.top,
                      sourceWidth: buttonRect.width
                    }
                  }));
                }, reverseFlow.phoenixTakeoffDelay);
              }
            }}
          >
            Complete my setup
          </Button.fire>
        )}

        <div className="ly-topbar-logo-wrapper">
          <Image
            src={getLogoSrc()}
            alt={isAdmiral() ? "Transfoorm Fleet Control Manager" : "Transfoorm"}
            width={2000}
            height={400}
            className="ly-topbar-logo-image"
            priority
          />
        </div>
      </div>
    </header>
  );
}
