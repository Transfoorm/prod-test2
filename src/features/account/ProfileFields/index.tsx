/**──────────────────────────────────────────────────────────────────────┐
│  🔱 PROFILE FIELDS FEATURE                                            │
│  /src/features/account/ProfileFields/index.tsx                        │
│                                                                       │
│  VR Doctrine: Feature Layer                                           │
│  - Imports VRs (Field.live, CountrySelectorLive)                      │
│  - Wires FUSE (user state, updateUserLocal)                           │
│  - Handles all transforms and callbacks                               │
│  - The sponge that absorbs all dirt                                   │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';
import { Field } from '@/prebuilts';
import { CountrySelectorLive } from '@/behaviors/live-fields/country/CountrySelectorLive';

export function ProfileFields() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE wiring - all state access lives here in the Feature
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  return (
    <div className="vr-field-spacing">
      {/* Row 1: First Name + Last Name */}
      <div className="vr-field-row">
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
      <div className="vr-field-row">
        <Field.live
          label="Entity/Organisation"
          value={user?.entityName ?? ''}
          onSave={(v) => updateUserLocal({ entityName: v || undefined })}
          placeholder="Your company name"
        />
        <Field.live
          label="Username"
          value={user?.socialName ?? ''}
          onSave={(v) => updateUserLocal({ socialName: v || undefined })}
          placeholder="Your 'handle'"
          transform="username"
          helper="* Letters, numbers, and one dot only"
        />
      </div>

      {/* Row 3: Phone Number + Business Location */}
      <div className="vr-field-row">
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
