/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Inline Form                                        │
│  /src/components/prebuilts/form/inline/index.tsx                       │
│                                                                        │
│  Horizontal form with labels and inputs on the same row.               │
│                                                                        │
│  Usage:                                                                │
│  import { FormVC } from '@/prebuilts/form';                │
│  <FormVC.inline onSubmit={handleSubmit}>                             │
│    {children}                                                          │
│  </FormVC.inline>                                                     │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { ReactNode, FormHTMLAttributes } from 'react';

export interface InlineFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  labelWidth?: string;
  className?: string;
}

/**
 * InlineForm - Horizontal layout with labels beside inputs
 *
 * Features:
 * - Labels and inputs on same row
 * - Configurable label width
 * - Compact horizontal layout
 * - Great for space-constrained UIs
 *
 * Perfect for:
 * - Filters and search bars
 * - Settings panels
 * - Compact forms
 * - Dashboard controls
 */
export default function InlineForm({
  children,
  labelWidth,
  className = '',
  ...props
}: InlineFormProps) {
  return (
    <form
      className={`vr-form vr-form-inline ${className}`}
      style={labelWidth ? { '--inline-label-width': labelWidth } as Record<string, unknown> : undefined}
      {...props}
    >
      {children}
    </form>
  );
}
