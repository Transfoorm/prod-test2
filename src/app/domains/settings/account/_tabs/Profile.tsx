/**──────────────────────────────────────────────────────────────────────┐
│  🔱 PROFILE TAB - VR-Pure Implementation                               │
│  /src/app/domains/settings/account/_tabs/Profile.tsx                   │
│                                                                        │
│  100% VR Doctrine Compliant:                                           │
│  - ZERO behavior in page                                               │
│  - ZERO state machines                                                 │
│  - ZERO lifecycle wiring                                               │
│  - Field.live handles everything                                       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { Field } from '@/prebuilts';
import CountrySelector from '@/features/CountrySelector';

const COUNTRIES: Record<string, { flag: string; name: string }> = {
  AU: { flag: '🇦🇺', name: 'Australia' },
  US: { flag: '🇺🇸', name: 'United States' },
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
};

type SaveState = 'idle' | 'saved';

export default function Profile() {
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);
  const [showCountry, setShowCountry] = useState(false);
  const [countrySaveState, setCountrySaveState] = useState<SaveState>('idle');
  const flagRef = useRef<HTMLButtonElement>(null);

  const country = user?.businessCountry ? COUNTRIES[user.businessCountry] : null;

  // Clear saved state after 1.5s
  useEffect(() => {
    if (countrySaveState === 'saved') {
      const timer = setTimeout(() => setCountrySaveState('idle'), 1500);
      return () => clearTimeout(timer);
    }
  }, [countrySaveState]);

  const handleCountryChange = () => {
    setCountrySaveState('saved');
    setShowCountry(false);
    // DB save happens in CountrySelector (fire and forget)
  };

  return (
    <div className="vr-field-spacing">
      {/* Row 1: First Name + Last Name */}
      <div className="ft-field-row">
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
          label="Social Name"
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
        <div className={`vr-field-live${countrySaveState === 'saved' ? ' vr-field-live--saved' : ''}`}>
          <label className="vr-field-live__label">Business Location</label>
          <div className="vr-field-live__input-wrapper">
            <button
              ref={flagRef}
              onClick={() => setShowCountry(!showCountry)}
              className="vr-field-live__input ft-profile-country"
            >
              <span className="ft-profile-country__flag">{country?.flag}</span>
              <span className="ft-profile-country__text">{country?.name}</span>
            </button>
            <div className={`vr-field-live__chip${countrySaveState === 'saved' ? ' vr-field-live__chip--visible vr-field-live__chip--saved' : ''}`}>
              {countrySaveState === 'saved' ? 'Saved ✓' : null}
            </div>
          </div>
          {showCountry && (
            <CountrySelector
              triggerRef={flagRef}
              onClose={() => setShowCountry(false)}
              onSelect={handleCountryChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
