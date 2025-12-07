/**──────────────────────────────────────────────────────────────────────┐
│  🔱 SECURITY TAB - Account Security Settings                         │
│  /src/app/domains/settings/account/_tabs/Security.tsx                │
│                                                                        │
│  Uses PasswordChangeCeremony for identity-grade password changes.    │
│                                                                        │
│  SOVEREIGNTY: No Clerk imports in domains - Golden Bridge enforced    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import PasswordChangeCeremony from '@/features/VerifyPassword/PasswordChangeCeremony';
import { changePassword } from '@/app/actions/password-actions';

export default function Security() {
  return <PasswordChangeCeremony onChangePassword={changePassword} />;
}
