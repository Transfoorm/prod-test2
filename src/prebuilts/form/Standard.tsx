/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Standard Form                                      │
│  /src/components/prebuilts/form/standard/index.tsx                     │
│                                                                        │
│  Vertical form layout with labels above inputs.                        │
│                                                                        │
│  Usage:                                                                │
│  import { FormVC } from '@/prebuilts/form';                │
│  <FormVC.standard onSubmit={handleSubmit}>                           │
│    {children}                                                          │
│  </FormVC.standard>                                                   │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { ReactNode, FormHTMLAttributes } from 'react';

export interface StandardFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
}

/**
 * StandardForm - Vertical form layout
 *
 * Features:
 * - Labels above inputs
 * - Vertical stacking
 * - Clear visual hierarchy
 * - Full width fields
 *
 * Perfect for:
 * - Standard forms
 * - Contact forms
 * - Registration forms
 * - Settings pages
 */
export default function StandardForm({
  children,
  className = '',
  ...props
}: StandardFormProps) {
  return (
    <form
      className={`vr-form vr-form-standard ${className}`}
      {...props}
    >
      {children}
    </form>
  );
}
