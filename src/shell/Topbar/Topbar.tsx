/**──────────────────────────────────────────────────────────────────────┐
│  📍 TOPBAR - Full-Width Frame with Logo (WCCC ly-* Compliant)         │
│  /src/shell/Topbar.tsx                                                 │
│                                                                        │
│  Topbar with logo on left side and Clerk UserButton on right.          │
│  Uses: --topbar-height, --topbar-bg, --topbar-logo-width              │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { Button } from '@/prebuilts/button';
import { useFuse } from '@/store/fuse';
import { useRankCheck } from '@/fuse/hydration/hooks/useRankCheck';
import {
  skipFlow,
  reverseFlow,
  navAwayFromUnskippedFlow
} from '@/features/UserSetup/FlyingButton/config';


export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useFuse((s) => s.user);
  const { isCaptain, isAdmiral } = useRankCheck();
  const modalSkipped = useFuse((s) => s.modalSkipped);
  const flyingButtonVisible = useFuse((s) => s.phoenixButtonVisible);
  const setFlyingButtonVisible = useFuse((s) => s.setPhoenixButtonVisible);
  const themeMode = useFuse((s) => s.themeMode);
  const [shouldFadeIn, setShouldFadeIn] = React.useState(false);
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

  // Listen for flying button events (keeping technical event names)
  React.useEffect(() => {
    const handleFlyingButtonLanded = () => {
      setTimeout(() => setFlyingButtonVisible(true), skipFlow.topbarButtonAppearDelay);
    };

    const handlePhoenixLanded = () => {
      // Phoenix has landed - show the real button immediately
      setFlyingButtonVisible(true);
    };

    const handleFlyingButtonTakingOff = () => {
      // Delay hiding the button so flying button can start from its position
      setTimeout(() => {
        setFlyingButtonVisible(false);
      }, reverseFlow.topbarButtonHideDelay);
    };

    const handleHideFlyingButton = () => {
      setFlyingButtonVisible(false);
    };

    window.addEventListener('phoenixToTopbar', handleFlyingButtonLanded);
    window.addEventListener('phoenixLanded', handlePhoenixLanded);
    window.addEventListener('phoenixButtonClicked', handleFlyingButtonTakingOff);
    window.addEventListener('hidePhoenixButton', handleHideFlyingButton);

    return () => {
      window.removeEventListener('phoenixToTopbar', handleFlyingButtonLanded);
      window.removeEventListener('phoenixLanded', handlePhoenixLanded);
      window.removeEventListener('phoenixButtonClicked', handleFlyingButtonTakingOff);
      window.removeEventListener('hidePhoenixButton', handleHideFlyingButton);
    };
  }, [setFlyingButtonVisible]);

  // Show button when navigating away from unskipped modal
  React.useEffect(() => {
    const isOnHome = pathname === '/';
    const needsSetup = isCaptain() && user?.setupStatus === 'pending';
    const modalIsUnskipped = needsSetup && !modalSkipped;

    // GOLDEN RULE: If we're on home page with unskipped modal, hide topbar button
    if (isOnHome && modalIsUnskipped) {
      // If button is visible and not already fading out, fade it out smoothly
      if (flyingButtonVisible && !isFadingOut) {
        setIsFadingOut(true);
        setTimeout(() => {
          setFlyingButtonVisible(false);
          setIsFadingOut(false);
        }, 600); // Match fade-out animation duration
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

      // Only trigger Phoenix and show button if it's not already visible
      const storedPosition = sessionStorage.getItem('flyingButtonStartPosition');
      if (storedPosition) {
        const startPos = JSON.parse(storedPosition);

        // Fire flying button event with stored position - START GUN!
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('phoenixFromUnskippedModal', {
            detail: { startPosition: startPos }
          }));
        }, navAwayFromUnskippedFlow.flyingButtonStartDelay);

        // Show button when flying button lands - same START GUN timing!
        setTimeout(() => {
          setShouldFadeIn(true);
          setFlyingButtonVisible(true);
          // Remove fade-in class after animation completes
          setTimeout(() => setShouldFadeIn(false), 400);
        }, navAwayFromUnskippedFlow.topbarButtonAppearDelay);
      } else {
        setShouldFadeIn(true);
        setFlyingButtonVisible(true);
        setTimeout(() => setShouldFadeIn(false), 400);
      }
    }
  }, [pathname, modalSkipped, user, flyingButtonVisible, isCaptain, setFlyingButtonVisible, setShouldFadeIn, isFadingOut]);

  return (
    <header className="ly-topbar-header">
      <div className="ly-topbar-left-container">
      </div>

      <div className="ly-topbar-right-container">
        {/* Phantom button for flying button positioning */}
        <Button.primary
          data-setup-target
          className={`whitespace-nowrap ly-topbar-phantom-button ${flyingButtonVisible ? 'ly-topbar-phantom-button--absolute' : 'ly-topbar-phantom-button--relative'}`}
          icon={<Sparkles />}
        >
          Complete my setup
        </Button.primary>

        {/* Real flying button */}
        {flyingButtonVisible && (
          <Button.primary
            className={`whitespace-nowrap animate-pulse-slow ly-topbar-setup-button ${shouldFadeIn ? 'ly-topbar-setup-button--fade-in' : ''} ${isFadingOut ? 'ly-topbar-setup-button--fade-out' : ''}`}
            icon={<Sparkles />}
            onMouseDown={() => {
              const isOnHomePage = pathname === '/';

              if (isOnHomePage) {
                // REVERSE FLOW: Bring modal back down

                // Get button positions for Phoenix flight
                const sourceButton = document.querySelector('.ly-topbar-right-container button') as HTMLElement;

                if (sourceButton) {
                  // Tell dashboard to bring modal back FIRST
                  window.dispatchEvent(new CustomEvent('bringModalBack'));

                  // Fire Phoenix event after the ONE takeoff delay
                  console.log('Phoenix takeoff delay:', reverseFlow.phoenixTakeoffDelay);
                  setTimeout(() => {
                    // Get fresh button rect in case it moved
                    const freshRect = sourceButton.getBoundingClientRect();
                    window.dispatchEvent(new CustomEvent('phoenixReverseFlow', {
                      detail: {
                        sourceX: freshRect.left,
                        sourceY: freshRect.top,
                        sourceWidth: freshRect.width
                      }
                    }));

                    // Start fade-out animation immediately
                    setIsFadingOut(true);

                    // Hide button completely after fade animation completes
                    setTimeout(() => {
                      setFlyingButtonVisible(false);
                      setIsFadingOut(false);
                    }, reverseFlow.topbarButtonHideDelay);
                  }, reverseFlow.phoenixTakeoffDelay); // THE ONE CLEAR DELAY from config
                }
              } else {
                // NOT on homepage - we need to navigate AND bring modal back
                // First, reset the modal skip state BEFORE navigation
                const setModalSkipped = useFuse.getState().setModalSkipped;
                setModalSkipped(false);

                // Navigate to home
                router.push('/');

                // Then trigger the Phoenix reverse flow after navigation
                setTimeout(() => {
                  // Get button position for Phoenix flight
                  const sourceButton = document.querySelector('.ly-topbar-right-container button') as HTMLElement;

                  if (sourceButton) {
                    // Fire Phoenix event after the takeoff delay
                    setTimeout(() => {
                      const freshRect = sourceButton.getBoundingClientRect();
                      window.dispatchEvent(new CustomEvent('phoenixReverseFlow', {
                        detail: {
                          sourceX: freshRect.left,
                          sourceY: freshRect.top,
                          sourceWidth: freshRect.width
                        }
                      }));

                      // Start fade-out animation
                      setIsFadingOut(true);

                      // Hide button completely after fade animation
                      setTimeout(() => {
                        setFlyingButtonVisible(false);
                        setIsFadingOut(false);
                      }, reverseFlow.topbarButtonHideDelay);
                    }, reverseFlow.phoenixTakeoffDelay);
                  }
                }, 300); // Small delay to let navigation complete
              }
            }}
          >
            Complete my setup
          </Button.primary>
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
