/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Fieldbox Row                                       │
│  /src/prebuilts/fieldbox/Row.tsx                                       │
│                                                                        │
│  Horizontal container for fieldboxes (TTT Gap Model compliant).        │
└────────────────────────────────────────────────────────────────────────┘ */

export interface FieldboxRowProps {
  /** Fieldbox components to display in a row */
  children: React.ReactNode;
  /** Gap between fieldboxes (CSS variable) */
  gap?: string;
  /** Additional className */
  className?: string;
}

/**
 * FieldboxRow - Horizontal layout container for fieldboxes
 * TTT Gap Model compliant - no external margins
 */
export default function FieldboxRow({
  children,
  gap = 'var(--space-md)',
  className = ''
}: FieldboxRowProps) {
  const classes = [
    'vr-fieldbox-row',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      /* ISV-EXCEPTION: CSS custom property for dynamic gap configuration */
      style={{ '--fieldbox-row-gap': gap } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
