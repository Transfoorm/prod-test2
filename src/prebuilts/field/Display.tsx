/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.display                                     │
│  /src/prebuilts/field/Display.tsx                                     │
│                                                                        │
│  Read-only display for field values.                                  │
└────────────────────────────────────────────────────────────────────────┘ */

export interface FieldDisplayProps {
  /** Display value */
  value?: string | number | null;
  /** Empty state text */
  emptyText?: string;
  /** Disabled state */
  disabled?: boolean;
}

export default function FieldDisplay({
  value,
  emptyText = 'Setup Incomplete',
  disabled = false,
}: FieldDisplayProps) {
  const hasValue = value !== null && value !== undefined && value !== '';

  const classes = [
    'vr-field-display',
    hasValue ? 'vr-field-display--filled' : 'vr-field-display--empty',
    disabled && 'vr-field-display--disabled',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {hasValue ? value : emptyText}
    </div>
  );
}
