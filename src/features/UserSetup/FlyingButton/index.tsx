'use client';

/**──────────────────────────────────────────────────────────────────────────┐
 │  ✈️ FLYING BUTTON (PHOENIX) - Animation Engine                           │
 │  /src/features/UserSetup/FlyingButton/index.tsx                          │
 │                                                                            │
 │  The animated button that flies between SetupModal and Topbar.            │
 │  Uses phantom buttons as GPS beacons for precise positioning.             │
 │                                                                            │
 │  Creates the Houdini illusion - users see one button transforming         │
 │  across the screen, never knowing there are three separate instances.     │
 └────────────────────────────────────────────────────────────────────────────*/

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/prebuilts/button';
import { skipFlow, reverseFlow, visual } from './config';

interface Position {
  x: number;
  y: number;
}

interface FlightPayload {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  targetX: number;
  targetY: number;
}

export default function FlyingButton() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [width, setWidth] = useState<number>(0);
  const [isFlying, setIsFlying] = useState(false);
  const [isReverse, setIsReverse] = useState(false);

  // Wait for DOM to be ready
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for show/hide events
  useEffect(() => {
    const handleShow = (event: Event) => {
      const customEvent = event as CustomEvent<FlightPayload>;
      if (customEvent.detail) {
        const { sourceX, sourceY, sourceWidth, targetX, targetY } = customEvent.detail;

        // Start at source position with source width
        setPosition({ x: sourceX, y: sourceY });
        setWidth(sourceWidth);
        setIsVisible(true);
        setIsFlying(false);
        setIsReverse(false); // Normal flow

        // Begin flight immediately
        requestAnimationFrame(() => {
          setIsFlying(true);
          setPosition({ x: targetX, y: targetY });
        });

        // Disappear after landing (flight complete)
        setTimeout(() => {
          setIsVisible(false);
          setIsFlying(false);
          // Signal topbar to show its button
          window.dispatchEvent(new CustomEvent('phoenixLanded'));
        }, skipFlow.flightDuration + skipFlow.landingBuffer);
      }
    };

    const handleReverseFlow = (event: Event) => {
      const customEvent = event as CustomEvent<{ sourceX: number; sourceY: number; sourceWidth: number }>;
      if (customEvent.detail) {
        const { sourceX, sourceY, sourceWidth } = customEvent.detail;

        // Prepare Phoenix at topbar position IMMEDIATELY
        const adjustedWidth = sourceWidth / 0.8; // Compensate for 80% scale
        setPosition({ x: sourceX, y: sourceY });
        setWidth(adjustedWidth);
        setIsReverse(true); // Reverse flow
        setIsFlying(false);

        // Make Phoenix visible immediately
        setIsVisible(true);

        // Wait for modal animation to complete before getting position and flying
        setTimeout(() => {
          const targetButton = document.querySelector('[data-setup-source]');
          console.log('🔍 Phoenix searching for modal button:', targetButton);

          if (!targetButton) {
            console.warn('Phoenix: Modal button not found, aborting reverse flight');
            // Let's also check what elements exist
            console.log('Available elements:', {
              allButtons: document.querySelectorAll('button').length,
              withDataAttr: document.querySelectorAll('[data-setup-source]').length,
              modal: document.querySelector('.ft-setup-modal')
            });
            // Tell topbar to show its button again
            window.dispatchEvent(new CustomEvent('phoenixAborted'));
            return;
          }

          // Get position AFTER modal has finished animating
          const targetRect = targetButton.getBoundingClientRect();
        console.log('🎯 Phoenix target position:', {
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          height: targetRect.height
        });

        // Start flight to modal
        requestAnimationFrame(() => {
          setIsFlying(true);
          setPosition({ x: targetRect.left, y: targetRect.top });
          console.log('✈️ Phoenix flying to:', {
            left: targetRect.left,
            top: targetRect.top
          });
        });

        // Show modal button based on config timing
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('phoenixApproachingModal'));
        }, reverseFlow.setupButtonAppearDelay); // Use config value!

        // Disappear after landing back at modal
        setTimeout(() => {
          setIsVisible(false);
          setIsFlying(false);
          // Signal modal that Phoenix has fully landed
          window.dispatchEvent(new CustomEvent('phoenixReturnedToModal'));
        }, reverseFlow.flightDuration + reverseFlow.landingBuffer);
        }, reverseFlow.modalPositionDelay); // Wait for modal to reach position
      }
    };

    const handleHide = () => setIsVisible(false);

    window.addEventListener('phoenixShow', handleShow);
    window.addEventListener('phoenixReverseFlow', handleReverseFlow);
    window.addEventListener('phoenixHide', handleHide);

    return () => {
      window.removeEventListener('phoenixShow', handleShow);
      window.removeEventListener('phoenixReverseFlow', handleReverseFlow);
      window.removeEventListener('phoenixHide', handleHide);
    };
  }, []);

  if (!isMounted || !isVisible) return null;

  return createPortal(
    <div
      className={`ft-phoenix ${isVisible ? 'ft-phoenix--visible' : 'ft-phoenix--hidden'} ${isFlying ? 'ft-phoenix--flying' : ''} ${isReverse ? 'ft-phoenix--reverse' : ''}`}
      // eslint-disable-next-line react/forbid-dom-props -- CSS custom properties for dynamic positioning (TTT-compliant)
      style={{
        '--phoenix-x': `${position.x}px`,
        '--phoenix-y': `${position.y}px`,
        '--phoenix-width': `${width}px`,
        '--phoenix-flight-duration': `${isReverse ? reverseFlow.flightDuration : skipFlow.flightDuration}ms`,
      } as React.CSSProperties}
    >
      <Button.primary
        icon={<Sparkles />}
        style={visual.debugMode ? { background: visual.debugColor } : undefined}
      >
        Complete my setup
      </Button.primary>
    </div>,
    document.body
  );
}
