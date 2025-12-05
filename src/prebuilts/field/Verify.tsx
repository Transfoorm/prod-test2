/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.verify                                      │
│  /src/prebuilts/field/Verify.tsx                                      │
│                                                                        │
│  Editable field that triggers verification flow on change.            │
│  Used for sensitive fields like email that require confirmation.      │
│                                                                        │
│  States:                                                               │
│  - idle: default display                                               │
│  - focused: editing with brand ring                                   │
│  - dirty: value changed (yellow bg)                                   │
│  - verifying: verification in progress                                │
│  - sent: "Verification sent" badge                                    │
│  - error: verification failed                                         │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type VerifyState = 'idle' | 'focused' | 'dirty' | 'verifying' | 'sent' | 'error';

export interface FieldVerifyProps {
  /** Field label */
  label: string;
  /** Current value (from FUSE) */
  value: string;
  /** Verification handler - called on blur if value changed */
  onVerify: (value: string) => Promise<void>;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'email';
  /** Required indicator */
  required?: boolean;
  /** Helper text */
  helper?: string;
}

const CHIP_TEXT: Record<VerifyState, string | null> = {
  idle: null,
  focused: null,
  dirty: null,
  verifying: 'Verifying...',
  sent: 'Verification sent',
  error: 'Error',
};

export default function FieldVerify({
  label,
  value,
  onVerify,
  placeholder = '',
  type = 'email',
  required = false,
  helper,
}: FieldVerifyProps) {
  const [state, setState] = useState<VerifyState>('idle');
  const [localValue, setLocalValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
    originalValue.current = value;
  }, [value]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setState('focused');
    setErrorMessage(null);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setState('dirty');
  }, []);

  const handleBlur = useCallback(async () => {
    // If no change, just go idle
    if (localValue === originalValue.current) {
      setState('idle');
      return;
    }

    // Validate email format
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localValue)) {
        setState('error');
        setErrorMessage('Please enter a valid email address');
        return;
      }
    }

    // Trigger verification
    setState('verifying');
    try {
      await onVerify(localValue);
      setState('sent');
      // Reset to original value - actual change happens after verification
      setLocalValue(originalValue.current);
      // Clear sent state after 3s
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Verification failed');
      // Reset to original value on error
      setLocalValue(originalValue.current);
    }
  }, [localValue, onVerify, type]);

  const showChip = state === 'verifying' || state === 'sent' || state === 'error';
  const chipText = CHIP_TEXT[state];

  const wrapperClasses = [
    'vr-field-verify',
    state !== 'idle' && `vr-field-verify--${state}`,
  ].filter(Boolean).join(' ');

  const chipClasses = [
    'vr-field-verify__chip',
    showChip && 'vr-field-verify__chip--visible',
    state === 'verifying' && 'vr-field-verify__chip--verifying',
    state === 'sent' && 'vr-field-verify__chip--sent',
    state === 'error' && 'vr-field-verify__chip--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label className="vr-field-verify__label">
        {label}
        {required && <span className="vr-field-verify__required">*</span>}
      </label>
      <div className="vr-field-verify__input-wrapper">
        <input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="vr-field-verify__input"
        />
        <div className={chipClasses}>{chipText}</div>
      </div>
      {helper && state !== 'error' && (
        <div className="vr-field-verify__helper">{helper}</div>
      )}
      {errorMessage && state === 'error' && (
        <div className="vr-field-verify__error">{errorMessage}</div>
      )}
    </div>
  );
}
