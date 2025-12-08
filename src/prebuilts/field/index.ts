/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELD VR - Complete Field Units                                   │
│  /src/prebuilts/field/index.ts                                        │
│                                                                        │
│  Usage: import { Field } from '@/prebuilts';                          │
│                                                                        │
│  CONTENT VRs (behavioral units):                                      │
│  - Field.live = auto-save with all states handled                     │
│  - Field.verify = editable, triggers verification on change           │
│  - Field.verifyEmail = email-specific verification flow               │
│  - Field.verifyPassword = password change with verify pattern         │
│  - Field.display = read-only value display                            │
│  - Field.readonly = label + content + messages (not editable)         │
│  - Field.emailActions = Make Primary / Remove pills                   │
│                                                                        │
│  LAYOUT VRs (VR LAYOUT LAW - Fields own their layout):                │
│  - Field.group = vertical spacing between rows                        │
│  - Field.row = horizontal arrangement of fields                       │
│  - Field.withAction = field + action button pairing                   │
└────────────────────────────────────────────────────────────────────────┘ */

// Content VRs
import FieldLive from './Live';
import FieldVerify from './Verify';
import FieldVerifyEmail from './VerifyEmail';
import FieldVerifyPassword from './VerifyPassword';
import FieldDisplay from './Display';
import FieldReadonly from './Readonly';
import FieldEmailActions from './EmailActions';

// Layout VRs
import FieldGroup from './Group';
import FieldRow from './Row';
import FieldWithAction from './WithAction';

export const Field = {
  // Content VRs
  live: FieldLive,
  verify: FieldVerify,
  verifyEmail: FieldVerifyEmail,
  verifyPassword: FieldVerifyPassword,
  display: FieldDisplay,
  readonly: FieldReadonly,
  emailActions: FieldEmailActions,
  // Layout VRs
  group: FieldGroup,
  row: FieldRow,
  withAction: FieldWithAction,
};

// Type exports for consumers
export type { FieldLiveProps } from './Live';
export type { FieldVerifyProps } from './Verify';
export type { FieldVerifyEmailProps } from './VerifyEmail';
export type { FieldVerifyPasswordProps } from './VerifyPassword';
export type { FieldDisplayProps } from './Display';
export type { FieldReadonlyProps } from './Readonly';
export type { FieldGroupProps } from './Group';
export type { FieldRowProps } from './Row';
export type { FieldWithActionProps } from './WithAction';
