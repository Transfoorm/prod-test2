/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Input Live                                        │
│  /src/prebuilts/input/live/index.tsx                                  │
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
│  Domain view ONLY provides:                                           │
│  - label, value, onSave                                               │
│                                                                        │
│  ZERO behavior in the page. ZERO wiring. ZERO state machines.         │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import LabelBasic from '@/prebuilts/label/Basic';

type LiveState = 'idle' | 'focused' | 'dirty' | 'saving' | 'saved' | 'error';

export interface InputLiveProps {
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

/**
 * Chip text for each state
 */
const CHIP_TEXT: Record<LiveState, string | null> = {
  idle: null,
  focused: null,
  dirty: null,
  saving: 'Saving...',
  saved: 'Saved ✓',
  error: 'Error',
};

/**
 * Input.live - Complete LiveField VR
 *
 * World-class inline editing UX:
 * - Hover: subtle orange border
 * - Focus: brand orange ring, text selected
 * - Typing: yellow background (dirty)
 * - Blur: auto-save if changed
 * - Saving: yellow pulse + chip
 * - Saved: green ring + chip → fades after 1.2s
 * - Error: red ring + message
 *
 * Domain view usage:
 * <Input.live
 *   label="First Name"
 *   value={firstName}
 *   onSave={(v) => updateUserLocal({ firstName: v })}
 * />
 *
 * That's it. The VR handles everything else.
 */
export default function InputLive({
  label,
  value,
  onSave,
  placeholder = '',
  type = 'text',
  required = false,
  helper,
}: InputLiveProps) {
  // ─────────────────────────────────────────────────────────────────────
  // Internal state machine - OWNED BY THE VR
  // ─────────────────────────────────────────────────────────────────────
  const [state, setState] = useState<LiveState>('idle');
  const [localValue, setLocalValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value);

  // Sync local value when external value changes (e.g., from server sync)
  useEffect(() => {
    setLocalValue(value);
    originalValue.current = value;
  }, [value]);

  // ─────────────────────────────────────────────────────────────────────
  // Event handlers - ALL BEHAVIOR LIVES HERE
  // ─────────────────────────────────────────────────────────────────────

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
    // No change? Return to idle
    if (localValue === originalValue.current) {
      setState('idle');
      return;
    }

    // Value changed → save
    setState('saving');

    try {
      await onSave(localValue);
      originalValue.current = localValue;
      setState('saved');

      // After 1.2s, fade back to idle
      setTimeout(() => setState('idle'), 1200);
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }, [localValue, onSave]);

  // ─────────────────────────────────────────────────────────────────────
  // CSS class computation
  // ─────────────────────────────────────────────────────────────────────
  const showChip = state === 'saving' || state === 'saved' || state === 'error';
  const chipText = CHIP_TEXT[state];

  const wrapperClasses = [
    'vr-form-live',
    state !== 'idle' && `vr-form-live--${state}`,
  ].filter(Boolean).join(' ');

  const chipClasses = [
    'vr-form-live__chip',
    showChip && 'vr-form-live__chip--visible',
    state === 'saving' && 'vr-form-live__chip--saving',
    state === 'saved' && 'vr-form-live__chip--saved',
    state === 'error' && 'vr-form-live__chip--error',
  ].filter(Boolean).join(' ');

  // ─────────────────────────────────────────────────────────────────────
  // Render - Pure VR output
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className={wrapperClasses}>
      <LabelBasic required={required}>{label}</LabelBasic>

      {/* Status chip - positioned absolute top-right */}
      <div className={chipClasses}>{chipText}</div>

      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="vr-form-live__input"
      />

      {helper && state !== 'error' && (
        <div className="vr-form-live__helper">{helper}</div>
      )}

      {errorMessage && state === 'error' && (
        <div className="vr-form-live__error">{errorMessage}</div>
      )}
    </div>
  );
}
