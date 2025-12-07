/**──────────────────────────────────────────────────────────────────────┐
│  🔱 EMAIL TAB - Account Email Management                              │
│  /src/app/domains/settings/account/_tabs/Email.tsx                    │
│                                                                        │
│  PURE DECLARATIVE SHELL - All logic encapsulated in VRs:             │
│  - Field.verifyEmail: Email field with modal choreography            │
│  - Field.emailActions: Make Primary / Remove pills                   │
│                                                                        │
│  SOVEREIGNTY: No Clerk imports in domains - Golden Bridge enforced    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { Field } from '@/prebuilts';

export default function Email() {
  return (
    <div className="vr-field-spacing">
      <div className="ft-field-row">
        {/* Primary Email */}
        <Field.verifyEmail
          label="Primary Email"
          field="email"
          helper="* Any email updates will require verification"
        />

        {/* Secondary Email + Actions */}
        <div className="ft-field-with-action">
          <Field.verifyEmail
            label="Secondary Email (Optional)"
            field="secondaryEmail"
            placeholder="Add a backup email"
          />
          <Field.emailActions />
        </div>
      </div>
    </div>
  );
}
