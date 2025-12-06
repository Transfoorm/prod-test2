/**──────────────────────────────────────────────────────────────────────┐
│  🔄 BEHAVIOR CAPSULE - Country Selector Live Wrapper                 │
│  /src/behaviors/live-fields/country/CountrySelectorLive.tsx          │
│                                                                        │
│  Wraps CountrySelector in Field.live VR shell with badge ceremony.   │
│  Does NOT know how to save - accepts onSave from caller.              │
│  Pure presentation + ceremony. CountrySelector stays untouched.       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef } from 'react';
import { useFuse } from '@/store/fuse';
import CountrySelector from '@/features/CountrySelector';
import { useCountryLiveBehavior } from './useCountryLiveBehavior';

const COUNTRIES: Record<string, { flag: string; name: string }> = {
  AU: { flag: '🇦🇺', name: 'Australia' },
  US: { flag: '🇺🇸', name: 'United States' },
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
};

interface CountrySelectorLiveProps {
  label: string;
  onSave: (country: string) => Promise<void>;
}

export function CountrySelectorLive({ label, onSave }: CountrySelectorLiveProps) {
  const user = useFuse((s) => s.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { saveState, handleChange } = useCountryLiveBehavior({ onSave });

  const country = user?.businessCountry ? COUNTRIES[user.businessCountry] : null;

  const handleSelect = (code: string) => {
    setShowDropdown(false);
    handleChange(code);
  };

  // VR classes
  const wrapperClass = [
    'vr-field-live',
    saveState === 'saved' && 'vr-field-live--saved',
    saveState === 'error' && 'vr-field-live--error',
  ].filter(Boolean).join(' ');

  const chipClass = [
    'vr-field-live__chip',
    saveState !== 'idle' && 'vr-field-live__chip--visible',
    saveState === 'saved' && 'vr-field-live__chip--saved',
    saveState === 'error' && 'vr-field-live__chip--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      <label className="vr-field-live__label">{label}</label>
      <div className="vr-field-live__input-wrapper">
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          className="vr-field-live__input ft-profile-country"
        >
          <span className="ft-profile-country__flag">{country?.flag}</span>
          <span className="ft-profile-country__text">{country?.name}</span>
        </button>
        <div className={chipClass}>
          {saveState === 'saved' ? 'Saved ✓' : saveState === 'error' ? 'Error' : null}
        </div>
      </div>
      {showDropdown && (
        <CountrySelector
          triggerRef={buttonRef}
          onClose={() => setShowDropdown(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
