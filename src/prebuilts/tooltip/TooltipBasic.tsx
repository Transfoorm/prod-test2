/**──────────────────────────────────────────────────────────────────────┐
│  💬 TOOLTIP VARIANT ROBOT - Basic Text Tooltip                        │
│  /src/prebuilts/tooltip/basic/index.tsx                              │
│                                                                        │
│  VR-compliant tooltip with dynamic positioning.                       │
│                                                                        │
│  Usage:                                                                │
│  import { Tooltip } from '@/prebuilts';                                │
│  <Tooltip.basic content="Help text">                                  │
│    <button>Hover me</button>                                          │
│  </Tooltip.basic>                                                     │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TooltipBasic({
  content,
  children,
  side = 'top',
  delay = 50,
  size = 'sm'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();

        // Estimate tooltip width (will be adjusted after render, but this prevents most cases)
        const estimatedTooltipWidth = content.length * 8; // Rough estimate
        const estimatedTooltipHeight = 32; // Rough height estimate

        let top = 0;
        let left = 0;

        switch (side) {
          case 'top':
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            break;
        }

        // Prevent tooltip from running off the right edge
        if (side === 'top' || side === 'bottom') {
          const halfWidth = estimatedTooltipWidth / 2;
          if (left + halfWidth > window.innerWidth - 16) {
            left = window.innerWidth - halfWidth - 16;
          }
          if (left - halfWidth < 16) {
            left = halfWidth + 16;
          }
        }

        // Prevent tooltip from running off the left edge
        if (side === 'left') {
          if (left - estimatedTooltipWidth < 16) {
            // Switch to right side if left would overflow
            left = rect.right + 8;
          }
        }

        // Prevent tooltip from running off the right edge
        if (side === 'right') {
          if (left + estimatedTooltipWidth > window.innerWidth - 16) {
            // Switch to left side if right would overflow
            left = rect.left - 8;
          }
        }

        // Prevent tooltip from running off the top edge
        if (side === 'top') {
          if (top - estimatedTooltipHeight < 16) {
            // Switch to bottom if top would overflow
            top = rect.bottom + 8;
          }
        }

        // Prevent tooltip from running off the bottom edge
        if (side === 'bottom') {
          if (top + estimatedTooltipHeight > window.innerHeight - 16) {
            // Switch to top if bottom would overflow
            top = rect.top - 8;
          }
        }

        setPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipElement = isVisible && isMounted ? (
    <div
      className={`vr-tooltip-basic vr-tooltip-basic--${size} vr-tooltip-basic--${side}`}
      // eslint-disable-next-line react/forbid-dom-props -- ISVEA: runtime portal positioning
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: side === 'top' || side === 'bottom'
          ? 'translateX(-50%) translateY(' + (side === 'top' ? '-100%' : '0%') + ')'
          : 'translateY(-50%) translateX(' + (side === 'left' ? '-100%' : '0%') + ')',
      }}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="vr-tooltip-trigger"
      >
        {children}
      </div>

      {isMounted && tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
}
