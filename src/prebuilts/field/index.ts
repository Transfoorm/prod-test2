/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD VR - Complete Field Units                                   │
│  /src/prebuilts/field/index.ts                                        │
│                                                                        │
│  Usage: import { Field } from '@/prebuilts';                          │
│  Then:  Field.live, Field.verify, Field.display, Field.readonly       │
│                                                                        │
│  These are COMPLETE behavioral units:                                 │
│  - Field.live = auto-save with all states handled                     │
│  - Field.verify = editable, triggers verification on change           │
│  - Field.display = read-only value display                            │
│  - Field.readonly = label + content + messages (not editable)         │
└────────────────────────────────────────────────────────────────────────┘ */

import FieldLive from './Live';
import FieldVerify from './Verify';
import FieldDisplay from './Display';
import FieldReadonly from './Readonly';

export const Field = {
  live: FieldLive,
  verify: FieldVerify,
  display: FieldDisplay,
  readonly: FieldReadonly,
};

// Type exports for consumers
export type { FieldLiveProps } from './Live';
export type { FieldVerifyProps } from './Verify';
export type { FieldDisplayProps } from './Display';
export type { FieldReadonlyProps } from './Readonly';
