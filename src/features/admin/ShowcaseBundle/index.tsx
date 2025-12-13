/**──────────────────────────────────────────────────────────────────────┐
│  🎪 SHOWCASE FEATURE BUNDLE                                          │
│  /src/features/admin/ShowcaseBundle/index.tsx                        │
│                                                                       │
│  VR Doctrine: Feature Layer                                           │
│  - Holds throwaway demo state for VR showcases                        │
│  - NOT business logic - just fake state to make demos interactive     │
│  - Real pages wire VRs to FUSE, showcases wire VRs to useState        │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState } from 'react';
import { Card } from '@/prebuilts/card';
import { Input } from '@/prebuilts/input';

const RADIO_OPTIONS = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

/**
 * RadiosShowcase - Demo-wired radio inputs
 * Throwaway state for showcase interactivity
 */
export function RadiosShowcase() {
  const [value1, setValue1] = useState('option1');
  const [value2, setValue2] = useState('option1');
  const [value3, setValue3] = useState('option1');
  const [value4, setValue4] = useState('option1');
  const [value5, setValue5] = useState('option1');
  const [value6, setValue6] = useState('option1');

  return (
    <Card.standard
      title="Radios Showcase"
      subtitle="Choose from or sandbox the site's radio features"
    >
      <div className="ft-showcasetabs-grid-5">
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (vertical, sm)</p>
          <Input.radio value={value1} onChange={setValue1} options={RADIO_OPTIONS} direction="vertical" size="sm" />
        </div>
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (vertical, md)</p>
          <Input.radio value={value2} onChange={setValue2} options={RADIO_OPTIONS} direction="vertical" size="md" />
        </div>
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (vertical, lg)</p>
          <Input.radio value={value3} onChange={setValue3} options={RADIO_OPTIONS} direction="vertical" size="lg" />
        </div>
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (horizontal, sm)</p>
          <Input.radio value={value4} onChange={setValue4} options={RADIO_OPTIONS} direction="horizontal" size="sm" />
        </div>
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (horizontal, md)</p>
          <Input.radio value={value5} onChange={setValue5} options={RADIO_OPTIONS} direction="horizontal" size="md" />
        </div>
        <div>
          <p className="ft-showcasetabs-item-label">Input.radio (disabled)</p>
          <Input.radio value={value6} onChange={setValue6} options={RADIO_OPTIONS} direction="vertical" disabled />
        </div>
      </div>
    </Card.standard>
  );
}
