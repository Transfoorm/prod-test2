/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Typography Heading                                 │
│  /src/components/prebuilts/typography/heading/index.tsx                │
│                                                                        │
│  Subsection headings with consistent styling.                        │
└────────────────────────────────────────────────────────────────────────┘ */

import React from 'react';

export interface TypographyHeadingProps {
  /** Heading content */
  children: React.ReactNode;
  /** Heading level */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Weight variant */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Additional className */
  className?: string;
}

/**
 * Typography.heading - Subsection headings
 * TTT Gap Model compliant - no external margins
 */
export default function TypographyHeading({
  children,
  level = 3,
  size = 'md',
  weight = 'semibold',
  className = ''
}: TypographyHeadingProps) {
  const classes = [
    'vr-typography-heading',
    `vr-typography-heading--${size}`,
    `vr-typography-heading--${weight}`,
    className
  ].filter(Boolean).join(' ');

  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={classes}>
      {children}
    </Tag>
  );
}
