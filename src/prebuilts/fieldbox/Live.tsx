/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Fieldbox Live                                     │
│  /src/prebuilts/fieldbox/Live.tsx                                     │
│                                                                        │
│  State-aware live edit field with premium UX feedback.                │
│  Purely presentational - receives state, renders visuals.             │
│                                                                        │
│  States: idle | focused | dirty | saving | saved | error              │
│                                                                        │
│  TTT Compliant:                                                       │
│  - No side effects                                                    │
│  - No mutations                                                       │
│  - Parent controls state                                              │
│  - VR only renders                                                    │
└────────────────────────────────────────────────────────────────────────┘ */

import LabelBasic from '@/prebuilts/label/Basic';

export type LiveFieldState = 'idle' | 'focused' | 'dirty' | 'saving' | 'saved' | 'error';

export interface FieldboxLiveProps {
  /** Field content (input/display) */
  children: React.ReactNode;
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Current field state - controls visual feedback */
  state?: LiveFieldState;
  /** Helper text */
  helper?: string;
  /** Error message (shown when state is 'error') */
  error?: string;
  /** Additional className */
  className?: string;
}

/**
 * Chip text for each state
 */
const CHIP_TEXT: Record<LiveFieldState, string | null> = {
  idle: null,
  focused: null,
  dirty: null,
  saving: 'Saving...',
  saved: 'Saved ✓',
  error: 'Error',
};

/**
 * FieldboxLive - State-aware live edit field
 *
 * Premium UX for inline editing:
 * - Brand orange focus ring when focused
 * - Yellow pulse when saving
 * - Green accent + "Saved ✓" chip on success
 * - Red accent + error message on failure
 *
 * TTT Gap Model compliant - no external margins
 */
export default function FieldboxLive({
  children,
  label,
  required = false,
  state = 'idle',
  helper,
  error,
  className = ''
}: FieldboxLiveProps) {
  // DEBUG: Remove after confirming state changes
  console.log('LiveField state:', label, state);

  const showChip = state === 'saving' || state === 'saved' || state === 'error';
  const chipText = CHIP_TEXT[state];

  const classes = [
    'vr-fieldbox-live',
    state !== 'idle' && `vr-fieldbox-live--${state}`,
    className
  ].filter(Boolean).join(' ');

  const chipClasses = [
    'vr-fieldbox-live__chip',
    showChip && 'vr-fieldbox-live__chip--visible',
    state === 'saving' && 'vr-fieldbox-live__chip--saving',
    state === 'saved' && 'vr-fieldbox-live__chip--saved',
    state === 'error' && 'vr-fieldbox-live__chip--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <LabelBasic required={required}>
          {label}
        </LabelBasic>
      )}

      {/* Status chip - positioned absolute top-right */}
      <div className={chipClasses}>
        {chipText}
      </div>

      {children}

      {helper && state !== 'error' && (
        <div className="vr-fieldbox-wrapper__helper">{helper}</div>
      )}

      {error && state === 'error' && (
        <div className="vr-fieldbox-wrapper__error">{error}</div>
      )}
    </div>
  );
}
