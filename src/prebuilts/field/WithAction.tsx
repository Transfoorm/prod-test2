/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD.WITHACTION - Layout VR for Field + Action Pairing          │
│  /src/prebuilts/field/WithAction.tsx                                  │
│                                                                        │
│  VR LAYOUT LAW: Fields own their layout.                              │
│  This VR pairs a Field with its action buttons (e.g., emailActions).  │
│                                                                        │
│  Usage:                                                                │
│  <Field.withAction>                                                    │
│    <Field.verifyEmail ... />                                           │
│    <Field.emailActions />                                              │
│  </Field.withAction>                                                   │
└────────────────────────────────────────────────────────────────────────┘ */

import type { ReactNode } from 'react';

interface FieldWithActionProps {
  children: ReactNode;
}

export default function FieldWithAction({ children }: FieldWithActionProps) {
  return <div className="ft-field-with-action">{children}</div>;
}

export type { FieldWithActionProps };
