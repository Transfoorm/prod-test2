/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD.GROUP - Layout VR for Field Vertical Spacing               │
│  /src/prebuilts/field/Group.tsx                                       │
│                                                                        │
│  VR LAYOUT LAW: Fields own their layout.                              │
│  This VR provides vertical spacing between Field.row elements.        │
│                                                                        │
│  Usage:                                                                │
│  <Field.group>                                                         │
│    <Field.row>...</Field.row>                                          │
│    <Field.row>...</Field.row>                                          │
│  </Field.group>                                                        │
└────────────────────────────────────────────────────────────────────────┘ */

import type { ReactNode } from 'react';

interface FieldGroupProps {
  children: ReactNode;
}

export default function FieldGroup({ children }: FieldGroupProps) {
  return <div className="vr-field-spacing">{children}</div>;
}

export type { FieldGroupProps };
