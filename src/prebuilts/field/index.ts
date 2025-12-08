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
│  - Field.verifyPassword = password change with verify pattern         │
│  - Field.readonly = label + content + messages (not editable)         │
│                                                                       │
│  LAYOUT VRs (VR LAYOUT LAW - Fields own their layout):                │
│  - Field.group = vertical spacing between rows                        │
│  - Field.row = horizontal arrangement of fields                       │
│  - Field.withAction = field + action button pairing                   │
└────────────────────────────────────────────────────────────────────────┘ */

// Content VRs - DUMB SHELLS
import FieldLive from './Live';
import FieldVerify from './Verify';
import FieldVerifyPassword from './VerifyPassword';
import FieldReadonly from './Readonly';

// Layout VRs - Divs with lipstick
import FieldGroup from './Group';
import FieldRow from './Row';
import FieldWithAction from './WithAction';

export const Field = {
  // Content VRs
  live: FieldLive,
  verify: FieldVerify,
  verifyPassword: FieldVerifyPassword,
  readonly: FieldReadonly,
  // Layout VRs
  group: FieldGroup,
  row: FieldRow,
  withAction: FieldWithAction,
};

// Type exports for consumers
export type { FieldLiveProps } from './Live';
export type { FieldVerifyProps } from './Verify';
export type { FieldVerifyPasswordProps } from './VerifyPassword';
export type { FieldReadonlyProps } from './Readonly';
export type { FieldGroupProps } from './Group';
export type { FieldRowProps } from './Row';
export type { FieldWithActionProps } from './WithAction';
