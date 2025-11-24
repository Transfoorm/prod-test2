/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Stacked Form                                       │
│  /src/components/prebuilts/form/stacked/index.tsx                      │
│                                                                        │
│  Tightly stacked form with minimal spacing.                            │
│                                                                        │
│  Usage:                                                                │
│  import { FormVC } from '@/prebuilts/form';                │
│  <FormVC.stacked onSubmit={handleSubmit}>                            │
│    {children}                                                          │
│  </FormVC.stacked>                                                    │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { ReactNode, FormHTMLAttributes } from 'react';

export interface StackedFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
}

/**
 * StackedForm - Compact vertical form
 *
 * Features:
 * - Minimal spacing
 * - Tight vertical stacking
 * - Space-efficient
 * - Labels above inputs
 *
 * Perfect for:
 * - Modals and drawers
 * - Compact spaces
 * - Quick entry forms
 * - Login/signup forms
 */
export default function StackedForm({
  children,
  className = '',
  ...props
}: StackedFormProps) {
  return (
    <form
      className={`vr-form vr-form-stacked ${className}`}
      {...props}
    >
      {children}
    </form>
  );
}
