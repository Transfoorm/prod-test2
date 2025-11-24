/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Fieldbox Display                                   │
│  /src/prebuilts/fieldbox/Display.tsx                                   │
│                                                                        │
│  Read-only fieldbox for displaying data values.                       │
└────────────────────────────────────────────────────────────────────────┘ */

export interface FieldboxDisplayProps {
  /** Display value */
  value?: string | number | null;
  /** Empty state text */
  emptyText?: string;
  /** Multiline display */
  multiline?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * FieldboxDisplay - Read-only box for displaying values
 * TTT Gap Model compliant - no external margins
 */
export default function FieldboxDisplay({
  value,
  emptyText = 'Setup Incomplete',
  multiline = false,
  disabled = false,
  className = ''
}: FieldboxDisplayProps) {
  const hasValue = value !== null && value !== undefined && value !== '';

  const classes = [
    'vr-fieldbox-display',
    hasValue ? 'vr-fieldbox-display--filled' : 'vr-fieldbox-display--empty',
    multiline && 'vr-fieldbox-display--multiline',
    disabled && 'vr-fieldbox-display--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {hasValue ? value : emptyText}
    </div>
  );
}
