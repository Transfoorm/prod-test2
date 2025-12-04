/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.live                                        │
│  /src/prebuilts/field/Live.tsx                                        │
│                                                                        │
│  COMPLETE BEHAVIORAL UNIT - World-class inline editing UX.            │
│                                                                        │
│  The VR handles ALL behavior:                                         │
│  - Hover → subtle border highlight                                    │
│  - Focus → brand orange ring + select all text                        │
│  - Typing → yellow dirty background                                   │
│  - Stop typing 500ms → "Saved ✓" + green bg (instant, state only)    │
│  - Blur → THEN hits the DB (silent, user doesn't wait)               │
│  - Error → red ring + error message                                   │
│                                                                        │
│  Domain view ONLY provides: label, value, onSave                      │
│  ZERO behavior in the page. ZERO wiring. ZERO state machines.         │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const DEBOUNCE_MS = 500;

type LiveState = 'idle' | 'focused' | 'dirty' | 'saving' | 'saved' | 'error';

export interface FieldLiveProps {
  /** Field label */
  label: string;
  /** Current value (from FUSE) */
  value: string;
  /** Save handler - called on blur if value changed. VR handles the rest. */
  onSave: (value: string) => Promise<void>;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'number' | 'url';
  /** Required indicator */
  required?: boolean;
  /** Helper text */
  helper?: string;
}

const CHIP_TEXT: Record<LiveState, string | null> = {
  idle: null,
  focused: null,
  dirty: null,
  saving: null,
  saved: 'Saved ✓',
  error: 'Error',
};

export default function FieldLive({
  label,
  value,
  onSave,
  placeholder = '',
  type = 'text',
  required = false,
  helper,
}: FieldLiveProps) {
  // Internal state machine - OWNED BY THE VR
  const [state, setState] = useState<LiveState>('idle');
  const [localValue, setLocalValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSave = useRef<string | null>(null);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
    originalValue.current = value;
  }, [value]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Event handlers - ALL BEHAVIOR LIVES HERE
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setState('focused');
    setErrorMessage(null);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setState('dirty');
    pendingSave.current = newValue;

    // Clear existing debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // After 500ms of no typing → back to focused (clear bg)
    debounceRef.current = setTimeout(() => {
      setState('focused');
    }, DEBOUNCE_MS);
  }, []);

  const handleBlur = useCallback(async () => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // If there's a pending save, hit the DB now (silently)
    if (pendingSave.current !== null && pendingSave.current !== originalValue.current) {
      const valueToSave = pendingSave.current;
      pendingSave.current = null;

      // Show saved briefly, fade after 400ms - DB saves in background
      setState('saved');
      setTimeout(() => setState('idle'), 1500);

      // DB save happens silently - if it fails, error will override idle
      try {
        await onSave(valueToSave);
        originalValue.current = valueToSave;
      } catch (err) {
        setState('error');
        setErrorMessage(err instanceof Error ? err.message : 'Save failed');
      }
    } else {
      // No changes, just go idle
      pendingSave.current = null;
      setState('idle');
    }
  }, [onSave]);

  // CSS classes
  const showChip = state === 'saving' || state === 'saved' || state === 'error';
  const chipText = CHIP_TEXT[state];

  const wrapperClasses = [
    'vr-field-live',
    state !== 'idle' && `vr-field-live--${state}`,
  ].filter(Boolean).join(' ');

  const chipClasses = [
    'vr-field-live__chip',
    showChip && 'vr-field-live__chip--visible',
    state === 'saving' && 'vr-field-live__chip--saving',
    state === 'saved' && 'vr-field-live__chip--saved',
    state === 'error' && 'vr-field-live__chip--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label className="vr-field-live__label">
        {label}
        {required && <span className="vr-field-live__required">*</span>}
      </label>
      <div className="vr-field-live__input-wrapper">
        <input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="vr-field-live__input"
        />
        <div className={chipClasses}>{chipText}</div>
      </div>
      {helper && state !== 'error' && (
        <div className="vr-field-live__helper">{helper}</div>
      )}
      {errorMessage && state === 'error' && (
        <div className="vr-field-live__error">{errorMessage}</div>
      )}
    </div>
  );
}
