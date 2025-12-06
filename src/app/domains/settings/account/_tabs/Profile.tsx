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

// Username transform - only allow letters, numbers, and ONE dot (space converts to dot)
const usernameTransform = (value: string, currentValue: string): string => {
  // Check if there's already a dot in the current value
  const currentHasDot = currentValue.includes('.');

  // If no dot yet and user types space, convert it to dot
  if (!currentHasDot && value.includes(' ')) {
    value = value.replace(' ', '.');
  }

  // Remove any character that isn't a-z, A-Z, 0-9, or dot
  value = value.replace(/[^a-zA-Z0-9.]/g, '');

  // If there's more than one dot, keep only the first one
  const dotIndex = value.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = value.substring(0, dotIndex + 1);
    const afterDot = value.substring(dotIndex + 1).replace(/\./g, '');
    value = beforeDot + afterDot;
  }

  return value;
};

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
          label="Username"
          value={user?.socialName ?? ''}
          onSave={(v) => updateUserLocal({ socialName: v || undefined })}
          placeholder="Your 'handle'"
          transform={usernameTransform}
          helper="Letters, numbers, and one dot only"
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
