/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD VR - Complete Field Units                                   │
│  /src/prebuilts/field/index.ts                                        │
│                                                                        │
│  Usage: import { Field } from '@/prebuilts';                          │
│  Then:  Field.live, Field.display, Field.row, Field.wrapper           │
│                                                                        │
│  These are COMPLETE behavioral units:                                 │
│  - Field.live = auto-save with all states handled                     │
│  - Field.display = read-only display                                  │
│  - Field.row = horizontal layout                                      │
│  - Field.wrapper = label + content + messages                         │
└────────────────────────────────────────────────────────────────────────┘ */

import FieldLive from './Live';
import FieldDisplay from './Display';
import FieldRow from './Row';
import FieldWrapper from './Wrapper';

export const Field = {
  live: FieldLive,
  display: FieldDisplay,
  row: FieldRow,
  wrapper: FieldWrapper,
};

// Type exports for consumers
export type { FieldLiveProps } from './Live';
export type { FieldDisplayProps } from './Display';
export type { FieldWrapperProps } from './Wrapper';
