/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Fieldbox Wrapper                                   │
│  /src/prebuilts/fieldbox/Wrapper.tsx                                   │
│                                                                        │
│  Complete field container with label, input/display, and messages.    │
└────────────────────────────────────────────────────────────────────────┘ */

import LabelBasic from '@/prebuilts/label/Basic';

export interface FieldboxWrapperProps {
  /** Field content (input/display) */
  children: React.ReactNode;
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Helper text */
  helper?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Additional className */
  className?: string;
}

/**
 * FieldboxWrapper - Complete field container
 * Combines label, field, and messages
 * TTT Gap Model compliant - no external margins
 */
export default function FieldboxWrapper({
  children,
  label,
  required = false,
  helper,
  error,
  success,
  className = ''
}: FieldboxWrapperProps) {
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const classes = [
    'vr-fieldbox-wrapper',
    hasError && 'vr-fieldbox-wrapper--error',
    hasSuccess && 'vr-fieldbox-wrapper--success',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <LabelBasic required={required}>
          {label}
        </LabelBasic>
      )}

      {children}

      {helper && !error && !success && (
        <div className="vr-fieldbox-wrapper__helper">{helper}</div>
      )}

      {error && (
        <div className="vr-fieldbox-wrapper__error">{error}</div>
      )}

      {success && !error && (
        <div className="vr-fieldbox-wrapper__success">{success}</div>
      )}
    </div>
  );
}
