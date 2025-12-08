/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD VR - Dumb Visual Shells                                     │
│  /src/prebuilts/field/index.ts                                        │
│                                                                       │
│  Usage: import { Field } from '@/prebuilts';                          │
│                                                                       │
│  VR DOCTRINE: These are DUMB SHELLS. No FUSE, no business logic.      │
│  They receive value, fire callbacks. That's it.                       │
│                                                                       │
│  CONTENT VRs (behavioral units):                                      │
│  - Field.live = auto-save with all states handled                     │
│  - Field.verify = editable, triggers verification on change           │
│  - Field.readonly = label + content + messages (not editable)         │
│                                                                       │
│  LAYOUT: Use CSS classes directly in Features:                        │
│  - .vr-field-spacing = vertical spacing between rows                  │
│  - .ft-field-row = horizontal arrangement of fields                   │
│  - .ft-field-with-action = field + action button pairing              │
└────────────────────────────────────────────────────────────────────────┘ */

import FieldLive from './Live';
import FieldVerify from './Verify';
import FieldReadonly from './Readonly';

export const Field = {
  live: FieldLive,
  verify: FieldVerify,
  readonly: FieldReadonly,
};

// Type exports for consumers
export type { FieldLiveProps } from './Live';
export type { FieldVerifyProps } from './Verify';
export type { FieldReadonlyProps } from './Readonly';
