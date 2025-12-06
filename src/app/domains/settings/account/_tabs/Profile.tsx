/**──────────────────────────────────────────────────────────────────────┐
│  🔱 PROFILE TAB - VR-Pure Implementation                               │
│  /src/app/domains/settings/account/_tabs/Profile.tsx                   │
│                                                                        │
│  100% VR Doctrine Compliant:                                           │
│  - ZERO behavior in page                                               │
│  - ZERO state machines                                                 │
│  - ZERO lifecycle wiring                                               │
│  - Field.live handles everything                                       │
│  - CountrySelectorLive behavior capsule handles country field          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';
import { Field } from '@/prebuilts';
import { CountrySelectorLive } from '@/behaviors/live-fields/country/CountrySelectorLive';

export default function Profile() {
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  return (
    <div className="vr-field-spacing">
      {/* Row 1: First Name + Last Name */}
      <div className="ft-field-row">
        <Field.live
          label="First Name"
          value={user?.firstName ?? ''}
          onSave={(v) => updateUserLocal({ firstName: v })}
          placeholder="First name"
        />
        <Field.live
          label="Last Name"
          value={user?.lastName ?? ''}
          onSave={(v) => updateUserLocal({ lastName: v })}
          placeholder="Last name"
        />
      </div>

      {/* Row 2: Entity/Organisation + Social Name */}
      <div className="ft-field-row">
        <Field.live
          label="Entity/Organisation"
          value={user?.entityName ?? ''}
          onSave={(v) => updateUserLocal({ entityName: v || undefined })}
          placeholder="Your company name"
        />
        <Field.live
          label="User Name"
          value={user?.socialName ?? ''}
          onSave={(v) => updateUserLocal({ socialName: v || undefined })}
          placeholder="How you prefer to be called"
        />
      </div>

      {/* Row 3: Phone Number + Business Location */}
      <div className="ft-field-row">
        <Field.live
          label="Phone Number (Optional)"
          value={user?.phoneNumber ?? ''}
          onSave={(v) => updateUserLocal({ phoneNumber: v || undefined })}
          type="tel"
          placeholder="Not set"
        />
        <CountrySelectorLive
          label="Business Location"
          onSave={(country) => updateUserLocal({ businessCountry: country })}
        />
      </div>
    </div>
  );
}
