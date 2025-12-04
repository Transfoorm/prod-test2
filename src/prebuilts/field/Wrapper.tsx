/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.wrapper                                     │
│  /src/prebuilts/field/Wrapper.tsx                                     │
│                                                                        │
│  Label + field + messages container.                                  │
└────────────────────────────────────────────────────────────────────────┘ */

export interface FieldWrapperProps {
  /** Field content */
  children: React.ReactNode;
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Helper text */
  helper?: string;
  /** Error message */
  error?: string;
}

export default function FieldWrapper({
  children,
  label,
  required = false,
  helper,
  error,
}: FieldWrapperProps) {
  const classes = [
    'vr-field-wrapper',
    error && 'vr-field-wrapper--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="vr-field-wrapper__label">
          {label}
          {required && <span className="vr-field-wrapper__required">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <div className="vr-field-wrapper__helper">{helper}</div>
      )}
      {error && <div className="vr-field-wrapper__error">{error}</div>}
    </div>
  );
}
