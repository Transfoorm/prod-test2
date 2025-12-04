/**──────────────────────────────────────────────────────────────────────┐
│  🔱 PROFILE TAB - VR-Pure Implementation                              │
│  /src/app/domains/settings/account/_tabs/Profile.tsx                  │
│                                                                        │
│  100% VR Doctrine Compliant:                                          │
│  - ZERO behavior in page                                              │
│  - ZERO state machines                                                │
│  - ZERO lifecycle wiring                                              │
│  - Field.live handles everything                                       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';
import { Field } from '@/prebuilts';

export default function Profile() {
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  return (
    <div className="vr-field-spacing">
      {/* Row 1: First Name + Last Name */}
      <Field.row>
        <Field.live
          label="First Name"
          value={user?.firstName ?? ''}
          onSave={(v) => updateUserLocal({ firstName: v })}
          placeholder="Kenneth"
        />
        <Field.live
          label="Last Name"
          value={user?.lastName ?? ''}
          onSave={(v) => updateUserLocal({ lastName: v })}
          placeholder="Roberts"
        />
      </Field.row>

      {/* Row 2: Entity/Organisation + Social Name */}
      <Field.row>
        <Field.live
          label="Entity/Organisation"
          value={user?.entityName ?? ''}
          onSave={(v) => updateUserLocal({ entityName: v || undefined })}
          placeholder="Your company name"
        />
        <Field.live
          label="Social Name"
          value={user?.socialName ?? ''}
          onSave={(v) => updateUserLocal({ socialName: v || undefined })}
          placeholder="How you prefer to be called"
        />
      </Field.row>

      {/* Row 3: Phone Number + Business Location */}
      <Field.row>
        <Field.live
          label="Phone Number (Optional)"
          value={user?.phoneNumber ?? ''}
          onSave={(v) => updateUserLocal({ phoneNumber: v || undefined })}
          type="tel"
          placeholder="Not set"
        />
        <Field.wrapper label="Business Location">
          <Field.display
            value={user?.businessCountry ? `🇦🇺 ${user.businessCountry}` : undefined}
            emptyText="Select flag to change"
          />
        </Field.wrapper>
      </Field.row>
    </div>
  );
}
