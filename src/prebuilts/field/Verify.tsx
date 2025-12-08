/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.verify                                       │
│  /src/prebuilts/field/Verify.tsx                                       │
│                                                                        │
│  SELF-SUFFICIENT VR - Two modes:                                       │
│  1. field prop: Reads/writes FUSE automatically                        │
│  2. value/onCommit props: Callback mode for custom flows               │
│                                                                        │
│  The Reveal Pattern:                                                   │
│  - idle: Display mode (no border, quiet)                              │
│  - focused: Awakens (border materializes, yellow breathes in)         │
│  - dirty: Pill slides in showing → newValue                           │
│  - committing: Pill becomes spinner, amber pulse                       │
│  - success: Green ring, checkmark, fades to idle                      │
│  - error: Red ring, error message, stays focused                      │
│                                                                        │
│  Blur without clicking pill = revert (safe escape)                    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import type { FuseUser } from '@/store/types';

type VerifyState = 'idle' | 'focused' | 'dirty' | 'committing' | 'success' | 'error';

// Fields that can be used with Field.verify
type VerifyableField = keyof NonNullable<FuseUser>;

// Props for self-sufficient mode (FUSE wired in)
interface FieldVerifyPropsWithField {
  /** FUSE field key - VR reads/writes this field automatically */
  field: VerifyableField;
  /** Field label */
  label: string;
  value?: never;
  onCommit?: never;
}

// Props for callback mode (custom flows like VerifyEmail)
interface FieldVerifyPropsWithCallback {
  /** Current value */
  value: string;
  /** Called when user clicks the commit pill */
  onCommit: (newValue: string) => Promise<void>;
  /** Field label */
  label: string;
  field?: never;
}

// Shared optional props
interface FieldVerifyCommonProps {
  /** Input type */
  type?: 'text' | 'email' | 'tel';
  /** Placeholder when empty */
  placeholder?: string;
  /** Required indicator */
  required?: boolean;
  /** Helper text */
  helper?: string;
  /** Only show helper when focused (not in idle state) */
  helperOnFocus?: boolean;
}

export type FieldVerifyProps = (FieldVerifyPropsWithField | FieldVerifyPropsWithCallback) & FieldVerifyCommonProps;

export default function FieldVerify(props: FieldVerifyProps) {
  const {
    label,
    type = 'text',
    placeholder = '',
    required = false,
    helper,
    helperOnFocus = false,
  } = props;

  // ─────────────────────────────────────────────────────────────────────
  // FUSE - Only used in self-sufficient mode
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  // Determine mode and get value
  const isSelfSufficient = 'field' in props && props.field !== undefined;
  const value = isSelfSufficient
    ? String(user?.[props.field] ?? '')
    : (props.value ?? '');

  const [state, setState] = useState<VerifyState>('idle');
  const [localValue, setLocalValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value);
  const isCommitting = useRef(false);
  const isHoveringPill = useRef(false);

  // Sync local value when external value changes (FUSE update)
  useEffect(() => {
    if (state === 'idle' || state === 'success') {
      setLocalValue(value);
      originalValue.current = value;
    }
  }, [value, state]);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (state === 'idle') {
      setState('focused');
      setErrorMessage(null);
    }
    // Select all text on focus
    e.target.select();
  }, [state]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Only go dirty if value actually changed from original
    if (newValue !== originalValue.current) {
      setState('dirty');
    } else {
      setState('focused');
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Don't revert if we're in the middle of committing or hovering pill
    if (isCommitting.current || isHoveringPill.current) return;

    // Revert to original and go idle
    setLocalValue(originalValue.current);
    setState('idle');
    setErrorMessage(null);
  }, []);

  const handlePillClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If in error state, clicking "Invalid" resets to original and returns to editing
    if (state === 'error') {
      setLocalValue(originalValue.current);
      setState('focused');
      setErrorMessage(null);
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }

    // Validate email format if type is email
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localValue)) {
        setState('error');
        setErrorMessage('Please enter a valid email address');
        return;
      }
    }

    // Prevent blur from reverting
    isCommitting.current = true;
    setState('committing');

    try {
      if (isSelfSufficient && 'field' in props) {
        // SELF-SUFFICIENT: Write directly to FUSE
        await updateUserLocal({ [props.field]: localValue || undefined });
      } else if ('onCommit' in props && props.onCommit) {
        // CALLBACK MODE: Let parent handle it
        await props.onCommit(localValue);
      }

      setState('success');
      originalValue.current = localValue;

      // Return to idle after success lingers
      setTimeout(() => {
        setState('idle');
        isCommitting.current = false;
      }, 1500);
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save');
      isCommitting.current = false;
      // Stay focused so user can retry or blur to revert
    }
  }, [localValue, type, state, props, isSelfSufficient, updateUserLocal]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Revert and blur
      setLocalValue(originalValue.current);
      setState('idle');
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && state === 'dirty') {
      // Commit on Enter when dirty
      handlePillClick(e as unknown as React.MouseEvent);
    }
  }, [state, handlePillClick]);

  // ─────────────────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────────────────

  const isDirty = localValue !== originalValue.current;
  const isEmpty = !value; // Original value is empty (no verified value yet)

  // Pill content based on state
  const getPillContent = () => {
    if (state === 'committing') {
      return <span className="vr-field-verify__typing">Verifying...</span>;
    }
    if (state === 'error') {
      return 'Invalid';
    }
    if (isDirty) {
      return 'Verify →';
    }
    if (state === 'focused') {
      return <span className="vr-field-verify__typing">Editing...</span>;
    }
    // Empty value = not set yet, show neutral state
    if (isEmpty) {
      return 'Not Set';
    }
    return 'Verified ✓';
  };

  // ─────────────────────────────────────────────────────────────────────
  // Classes
  // ─────────────────────────────────────────────────────────────────────

  const wrapperClasses = [
    'vr-field-verify',
    `vr-field-verify--${state}`,
    helper && 'vr-field--has-helper',
  ].filter(Boolean).join(' ');

  // Pill state: active (dirty/committing) > editing (focused) > empty (not set) > verified (idle)
  const getPillState = () => {
    if (state === 'committing') return 'vr-field-verify__pill--active';  // Stay orange while verifying
    if (isDirty) return 'vr-field-verify__pill--active';
    if (state === 'focused') return 'vr-field-verify__pill--editing';
    if (isEmpty) return 'vr-field-verify__pill--empty';  // Neutral gray for empty/not set
    return 'vr-field-verify__pill--verified';
  };

  const pillClasses = [
    'vr-field-verify__pill',
    getPillState(),
    state === 'error' && 'vr-field-verify__pill--error',
  ].filter(Boolean).join(' ');

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className={wrapperClasses}>
      <label className="vr-field__label">
        {label}
        {required && <span className="vr-field__required">*</span>}
      </label>

      <div className="vr-field-verify__input-wrapper">
        <input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="vr-field-verify__input"
          aria-describedby={errorMessage ? 'verify-error' : undefined}
        />

        <button
          type="button"
          className={pillClasses}
          onClick={handlePillClick}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => { isHoveringPill.current = true; }}
          onMouseLeave={() => { isHoveringPill.current = false; }}
          disabled={state === 'committing' || state === 'success'}
          tabIndex={0}
          aria-label={state === 'dirty' ? `Confirm change to ${localValue}` : undefined}
        >
          {getPillContent()}
        </button>
      </div>

      {helper && state !== 'error' && (!helperOnFocus || state !== 'idle') && (
        <div className="vr-field__helper">{helper}</div>
      )}

      {errorMessage && state === 'error' && (
        <div id="verify-error" className="vr-field__error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
