/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.verifyPassword                              │
│  /src/prebuilts/field/VerifyPassword.tsx                              │
│                                                                        │
│  Password field with Reveal choreography.                             │
│                                                                        │
│  TWO MODES:                                                            │
│  1. Entry mode (showEyeToggle=true): Eye icon to show/hide password   │
│  2. Confirm mode (default): "Verify →" pill to commit                 │
│                                                                        │
│  VISIBILITY CONTROL:                                                   │
│  - Entry field owns the eye toggle                                     │
│  - Page lifts visibility state to control BOTH fields                  │
│  - showPassword prop passed from page controls input type              │
│                                                                        │
│  NOTE: Page handles password matching logic, not this VR.             │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@/prebuilts/icon/iconRegistry';

type VerifyState = 'idle' | 'focused' | 'dirty' | 'committing' | 'success' | 'error';

export interface FieldVerifyPasswordProps {
  /** Field label */
  label: string;
  /** Current value (controlled by page) */
  value: string;
  /** Called on every keystroke */
  onChange: (value: string) => void;
  /** Called when user clicks the commit pill (only used when showEyeToggle=false) */
  onCommit?: () => Promise<void>;
  /** Placeholder when empty */
  placeholder?: string;
  /** Helper text */
  helper?: string;
  /** External error message (e.g., "Passwords don't match") */
  error?: string | null;
  /** Clear error when user starts typing */
  onErrorClear?: () => void;
  /** Show eye toggle instead of Verify pill (for password entry field) */
  showEyeToggle?: boolean;
  /** Show dots in idle state (true for "Change Password", false for "Retype") */
  showDotsWhenIdle?: boolean;
  /** Password visibility (controlled by page - eye toggle in first field controls both) */
  showPassword?: boolean;
  /** Called when eye toggle is clicked (only for entry field) */
  onToggleVisibility?: () => void;
  /** Keep value on blur instead of reverting (for paired password fields) */
  persistOnBlur?: boolean;
  /** Called when field receives focus (for page-level validation triggers) */
  onFieldFocus?: () => void;
  /** External validation passed - show green success state */
  valid?: boolean;
  /** Field is disabled/frozen */
  disabled?: boolean;
  /** Called when field loses focus (for page-level validation) */
  onFieldBlur?: (e: React.FocusEvent) => void;
  /** Field is dormant/dead until awakened (opaque on fresh page) */
  dormant?: boolean;
  /** Field is ready for input (sibling passed validation) */
  ready?: boolean;
  /** Called on mousedown (before blur fires on sibling) */
  onMouseDown?: () => void;
}

export default function FieldVerifyPassword({
  label,
  value,
  onChange,
  onCommit,
  placeholder = '',
  helper,
  error: externalError,
  onErrorClear,
  showEyeToggle = false,
  showDotsWhenIdle = true,
  showPassword = false,
  onToggleVisibility,
  persistOnBlur = false,
  onFieldFocus,
  valid = false,
  disabled = false,
  onFieldBlur,
  dormant = false,
  ready = false,
  onMouseDown,
}: FieldVerifyPasswordProps) {
  const [state, setState] = useState<VerifyState>('idle');
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef('');
  const isCommitting = useRef(false);
  const isHoveringPill = useRef(false);

  // Use external error if provided, otherwise internal
  const errorMessage = externalError || internalError;

  // Sync state when external error changes
  useEffect(() => {
    if (externalError) {
      setState('error');
    }
  }, [externalError]);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Notify page of focus (for validation triggers)
    onFieldFocus?.();

    if (state === 'idle') {
      setState('focused');
      originalValue.current = value;
      setInternalError(null);
    }
    // Select all text on focus
    e.target.select();
  }, [state, value, onFieldFocus]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear external error when typing
    onErrorClear?.();
    setInternalError(null);

    // Go dirty if value entered
    if (newValue.length > 0) {
      setState('dirty');
    } else {
      setState('focused');
    }
  }, [onChange, onErrorClear]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Notify page of blur (for validation)
    onFieldBlur?.(e);

    // Don't revert if we're in the middle of committing or hovering pill
    if (isCommitting.current || isHoveringPill.current) return;

    // If persistOnBlur, keep value but go idle visually
    if (persistOnBlur) {
      // Don't revert - keep the typed value
      setState('idle');
      return;
    }

    // Revert to original and go idle
    onChange(originalValue.current);
    setState('idle');
    setInternalError(null);
  }, [onChange, persistOnBlur, onFieldBlur]);

  const handlePillClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If in error state, clicking "Invalid" resets and returns to editing
    if (state === 'error') {
      onChange('');
      setState('focused');
      setInternalError(null);
      onErrorClear?.();
      inputRef.current?.focus();
      return;
    }

    // Prevent blur from reverting
    isCommitting.current = true;
    setState('committing');

    try {
      await onCommit?.();
      setState('success');

      // Return to idle after success lingers
      setTimeout(() => {
        setState('idle');
        isCommitting.current = false;
        onChange(''); // Clear the field after success
        originalValue.current = '';
      }, 1500);
    } catch (err) {
      setState('error');
      setInternalError(err instanceof Error ? err.message : 'Failed to save');
      isCommitting.current = false;
    }
  }, [onCommit, onChange, state, onErrorClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Revert and blur
      onChange(originalValue.current);
      setState('idle');
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && state === 'dirty' && !showEyeToggle) {
      // Commit on Enter when dirty (only for confirm field)
      handlePillClick(e as unknown as React.MouseEvent);
    }
  }, [state, handlePillClick, onChange, showEyeToggle]);

  // ─────────────────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────────────────

  const isDirty = value.length > 0;
  const isIdle = state === 'idle';

  // Pill content based on state (only for confirm mode)
  const getPillContent = () => {
    if (state === 'committing') {
      return <span className="vr-field-verify__typing">Verifying...</span>;
    }
    if (state === 'error') {
      return 'Invalid';
    }
    if (state === 'success') {
      return 'Changed ✓';
    }
    if (isDirty) {
      return 'Verify →';
    }
    if (state === 'focused') {
      return <span className="vr-field-verify__typing">Editing...</span>;
    }
    // Idle state - show "Not Set" for empty confirm field
    return 'Not Set';
  };

  // ─────────────────────────────────────────────────────────────────────
  // Classes
  // ─────────────────────────────────────────────────────────────────────

  // Use valid state to override visual state when externally validated
  const visualState = valid ? 'success' : state;

  const wrapperClasses = [
    'vr-field-verify',
    `vr-field-verify--${visualState}`,
    disabled && 'vr-field-verify--disabled',
    dormant && 'vr-field-verify--dormant',
    ready && 'vr-field-verify--ready',
  ].filter(Boolean).join(' ');

  // Pill state
  const getPillState = () => {
    if (state === 'success') return 'vr-field-verify__pill--verified';
    if (state === 'committing') return 'vr-field-verify__pill--active';
    if (isDirty) return 'vr-field-verify__pill--active';
    if (state === 'focused') return 'vr-field-verify__pill--editing';
    if (state === 'error') return 'vr-field-verify__pill--error';
    return 'vr-field-verify__pill--empty';
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
    <div className={wrapperClasses} onMouseDown={onMouseDown}>
      <label className="vr-field-verify__label">{label}</label>

      <div className="vr-field-verify__input-wrapper">
        {isIdle && !(persistOnBlur && value) ? (
          // Idle state (no persisted value)
          showDotsWhenIdle ? (
            // Show masked dots (for Change Password field)
            <div
              className="vr-field-verify__input vr-field-verify__input--masked"
              onClick={() => {
                setState('focused');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              ••••••••••••
            </div>
          ) : (
            // Show empty placeholder (for Retype field)
            <div
              className="vr-field-verify__input vr-field-verify__input--empty"
              onClick={disabled ? undefined : () => {
                onFieldFocus?.();
                setState('focused');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              {placeholder || 'Click to enter'}
            </div>
          )
        ) : (
          // Editing OR idle with persisted value: Show actual password input
          <input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="vr-field-verify__input"
            autoFocus
            aria-describedby={errorMessage ? 'verify-error' : undefined}
          />
        )}

        {/* Entry field: Eye toggle. Confirm field: Verify pill */}
        {showEyeToggle ? (
          // Eye toggle (controls visibility for both fields)
          isIdle && !value ? (
            <button
              type="button"
              className="vr-field-verify__pill vr-field-verify__pill--empty"
              onClick={() => {
                setState('focused');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              Change
            </button>
          ) : (
            <button
              type="button"
              className="vr-field-verify__eye-toggle"
              onClick={onToggleVisibility}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon variant={showPassword ? 'eye-off' : 'eye'} size="xs" />
            </button>
          )
        ) : (
          // Verify pill (for confirm field)
          <button
            type="button"
            className={pillClasses}
            onClick={isIdle ? (disabled ? undefined : () => {
              setState('focused');
              setTimeout(() => inputRef.current?.focus(), 0);
            }) : handlePillClick}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => { isHoveringPill.current = true; }}
            onMouseLeave={() => { isHoveringPill.current = false; }}
            disabled={disabled || state === 'committing' || state === 'success'}
            tabIndex={disabled ? -1 : 0}
          >
            {getPillContent()}
          </button>
        )}
      </div>

      {helper && state !== 'error' && (
        <div className="vr-field-verify__helper">{helper}</div>
      )}

      {errorMessage && state === 'error' && (
        <div id="verify-error" className="vr-field-verify__error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
