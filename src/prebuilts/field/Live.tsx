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
│  - Blur → triggers save                                               │
│  - Saving → yellow pulse + "Saving..." chip                           │
│  - Saved → green ring + "Saved ✓" chip → fade to idle                 │
│  - Error → red ring + error message                                   │
│                                                                        │
│  Domain view ONLY provides: label, value, onSave                      │
│  ZERO behavior in the page. ZERO wiring. ZERO state machines.         │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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
  saving: 'Saving...',
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

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
    originalValue.current = value;
  }, [value]);

  // Event handlers - ALL BEHAVIOR LIVES HERE
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setState('focused');
    setErrorMessage(null);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setState('dirty');
  }, []);

  const handleBlur = useCallback(async () => {
    if (localValue === originalValue.current) {
      setState('idle');
      return;
    }

    setState('saving');

    try {
      await onSave(localValue);
      originalValue.current = localValue;
      setState('saved');
      setTimeout(() => setState('idle'), 1200);
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }, [localValue, onSave]);

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
      <div className={chipClasses}>{chipText}</div>
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
      {helper && state !== 'error' && (
        <div className="vr-field-live__helper">{helper}</div>
      )}
      {errorMessage && state === 'error' && (
        <div className="vr-field-live__error">{errorMessage}</div>
      )}
    </div>
  );
}
