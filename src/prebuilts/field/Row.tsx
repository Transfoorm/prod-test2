/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.row                                         │
│  /src/prebuilts/field/Row.tsx                                         │
│                                                                        │
│  Horizontal layout container for fields.                              │
│  Gap is controlled via CSS variable --space-md (no inline styles).   │
└────────────────────────────────────────────────────────────────────────┘ */

export interface FieldRowProps {
  /** Fields to display in a row */
  children: React.ReactNode;
}

export default function FieldRow({ children }: FieldRowProps) {
  return <div className="vr-field-row">{children}</div>;
}
