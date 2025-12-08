/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD.ROW - Layout VR for Horizontal Field Arrangement           │
│  /src/prebuilts/field/Row.tsx                                         │
│                                                                        │
│  VR LAYOUT LAW: Fields own their layout.                              │
│  This VR arranges Field.* siblings horizontally with equal width.     │
│                                                                        │
│  Usage:                                                                │
│  <Field.row>                                                           │
│    <Field.live label="First" ... />                                    │
│    <Field.live label="Last" ... />                                     │
│  </Field.row>                                                          │
└────────────────────────────────────────────────────────────────────────┘ */

import type { ReactNode } from 'react';

interface FieldRowProps {
  children: ReactNode;
}

export default function FieldRow({ children }: FieldRowProps) {
  return <div className="ft-field-row">{children}</div>;
}

export type { FieldRowProps };
