/**──────────────────────────────────────────────────────────────────────┐
│  🪞 MIROR AI TAB FEATURE                                             │
│  /src/features/preferences/miror-ai-tab/index.tsx                    │
│                                                                       │
│  VR Doctrine: Feature Layer                                           │
│  - Imports VRs (Card, Input.toggle, Input.radio)                     │
│  - Wires FUSE (user state, updateMirorLocal)                         │
│  - Handles all transforms and callbacks                               │
│  - The sponge that absorbs all dirt                                  │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/prebuilts';
import { Input } from '@/prebuilts/input';
import { useFuse } from '@/store/fuse';
import { ENCHANTMENT_TIMINGS } from '@/fuse/constants/enchantment';
import { MIROR_DEFAULTS } from '@/fuse/constants/coreThemeConfig';
import './miror-ai-tab.css';

// ─────────────────────────────────────────────────────────────────────
// Avatar Profile Options (9 avatars: gender × skin tone)
// f = female, m = male, i = inclusive
// 1 = caucasian, 2 = dark skin, 3 = oriental
// ─────────────────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  'f_1', 'f_2', 'f_3',  // Female: caucasian, dark, oriental
  'm_1', 'm_2', 'm_3',  // Male: caucasian, dark, oriental
  'i_1', 'i_2', 'i_3',  // Inclusive: caucasian, dark, oriental
] as const;

type AvatarOption = typeof AVATAR_OPTIONS[number];

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function MirorAiTabFeature() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE wiring - all state access lives here in the Feature
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const updateMirorLocal = useFuse((s) => s.updateMirorLocal);

  // Current values with defaults
  const avatarProfile = user?.mirorAvatarProfile ?? MIROR_DEFAULTS.DEFAULT_AVATAR;
  const enchantmentEnabled = user?.mirorEnchantmentEnabled ?? MIROR_DEFAULTS.DEFAULT_ENCHANTMENT_ENABLED;
  const enchantmentTiming = user?.mirorEnchantmentTiming ?? MIROR_DEFAULTS.DEFAULT_ENCHANTMENT;

  // ─────────────────────────────────────────────────────────────────────
  // Live preview enchantment animation state
  // ─────────────────────────────────────────────────────────────────────
  const [showStar, setShowStar] = useState(false);
  const [starKey, setStarKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [starHop, setStarHop] = useState(false);

  // Mount detection for client-side only animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Random star hop animation - only when enchantment is OFF
  useEffect(() => {
    if (!mounted || enchantmentEnabled) {
      setStarHop(false);
      return;
    }

    let timeout: NodeJS.Timeout;
    let isCancelled = false;

    const scheduleHop = () => {
      if (isCancelled) return;
      // Random delay between 2-6 seconds
      const delay = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        if (isCancelled) return;
        setStarHop(true);
        // Hop lasts 150ms
        setTimeout(() => {
          if (isCancelled) return;
          setStarHop(false);
          scheduleHop();
        }, 150);
      }, delay);
    };

    scheduleHop();

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [mounted, enchantmentEnabled]);

  // Enchantment animation cycle (mirrors AISidebar logic)
  useEffect(() => {
    if (!mounted || !enchantmentEnabled) {
      setShowStar(false);
      return;
    }

    const currentTimingConfig = ENCHANTMENT_TIMINGS[enchantmentTiming];
    let onTimeout: NodeJS.Timeout;
    let offTimeout: NodeJS.Timeout;
    let isCancelled = false;

    const cycle = () => {
      if (isCancelled) return;

      // Show star
      setShowStar(true);
      setStarKey(prev => prev + 1);
      const randomOnDuration = currentTimingConfig.onDurations[
        Math.floor(Math.random() * currentTimingConfig.onDurations.length)
      ];

      onTimeout = setTimeout(() => {
        if (isCancelled) return;
        setShowStar(false);

        const randomOffDuration = currentTimingConfig.offDurations[
          Math.floor(Math.random() * currentTimingConfig.offDurations.length)
        ];
        offTimeout = setTimeout(cycle, randomOffDuration);
      }, randomOnDuration);
    };

    cycle();

    return () => {
      isCancelled = true;
      clearTimeout(onTimeout);
      clearTimeout(offTimeout);
    };
  }, [mounted, enchantmentEnabled, enchantmentTiming]);

  return (
    <div className="ft-miror-ai-tab">
      <Card.standard
        title="Miror AI Assistant"
        subtitle="Customise your AI assistant's appearance and enchantment effects"
      >
        {/* Avatar Grid + Preview wrapper */}
          <div className="ft-miror-ai-tab-avatar-row">
            {/* Avatar Grid */}
            <div className="ft-miror-ai-tab-avatar-grid">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`ft-miror-ai-tab-avatar-option ${avatarProfile === option ? 'ft-miror-ai-tab-avatar-option--active' : ''}`}
                  onClick={() => updateMirorLocal({ mirorAvatarProfile: option as AvatarOption })}
                >
                  <img
                    src={`/images/ai/miror_${option}.png`}
                    alt={option}
                    className="ft-miror-ai-tab-avatar-image"
                  />
                </button>
              ))}
            </div>

          {/* Live Preview */}
          <div className="ft-miror-ai-tab-preview-wrapper">
            <div className="ft-miror-ai-tab-preview-label"></div>
            <div className="ft-miror-ai-tab-preview">
              <div className="ft-miror-ai-tab-preview-avatar-container">
                <img
                  src={`/images/ai/miror_${avatarProfile}.png`}
                  alt="Preview"
                  className="ft-miror-ai-tab-preview-avatar"
                />
                {mounted && enchantmentEnabled && showStar && (
                  <img
                    key={starKey}
                    src={`/images/sitewide/twinkle.webp?v=${starKey}`}
                    alt=""
                    className="ft-miror-ai-tab-preview-twinkle"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Star Toggle - standalone item for space-evenly */}
          <div className="ft-miror-ai-tab-star-wrapper">
            <label title="Star" className={`ft-star-toggle ft-star-toggle--enchantment ${starHop ? 'ft-star-toggle--hop' : ''}`}>
              <input
                className="ft-star-checkbox"
                type="checkbox"
                checked={enchantmentEnabled}
                onChange={(e) => updateMirorLocal({ mirorEnchantmentEnabled: e.target.checked })}
              />
              <div className="ft-star-svg-container">
                {/* White background star (solid) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ft-star-svg-bg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.5L9.45 8.5L3 9.06L7.725 13.39L6.25 19.82L12 16.5L17.75 19.82L16.275 13.39L21 9.06L14.55 8.5L12 2.5Z" />
                </svg>
                {/* Grey outline star (ring shape) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ft-star-svg-outline"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.5L9.45 8.5L3 9.06L7.725 13.39L6.25 19.82L12 16.5L17.75 19.82L16.275 13.39L21 9.06L14.55 8.5L12 2.5ZM12 4.75L14 9.33L18.7 9.75L15 13.07L16.18 17.75L12 15.16L7.82 17.75L9 13.07L5.3 9.75L10 9.33L12 4.75Z" />
                </svg>
                {/* Gold filled star (on state) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ft-star-svg-filled"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.5L9.45 8.5L3 9.06L7.725 13.39L6.25 19.82L12 16.5L17.75 19.82L16.275 13.39L21 9.06L14.55 8.5L12 2.5Z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="100"
                  width="100"
                  className="ft-star-svg-celebrate"
                >
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <circle r="2" cy="50" cx="50" className="ft-star-particle" style={{ opacity: 0 }} />
                </svg>
              </div>
            </label>
            <span className="ft-miror-ai-tab-star-label">On / off</span>
          </div>

          {/* Radio options - standalone item for space-evenly */}
          <div className={`ft-enchant-radio-container ${enchantmentEnabled ? 'ft-enchant-radio-container--active' : ''}`}>
            <span className="ft-miror-ai-tab-enchantment-label"></span>
            <Input.radioFancy
              value={enchantmentTiming}
              onChange={(val) => updateMirorLocal({ mirorEnchantmentTiming: val as 'subtle' | 'magical' | 'playful' })}
              options={[
                { value: 'subtle', label: 'Subtle', description: 'Rare and understated' },
                { value: 'magical', label: 'Magical', description: 'Special and delightful' },
                { value: 'playful', label: 'Playful', description: 'Frequent and lively' },
              ]}
              name="enchantment"
            />
          </div>
        </div>
      </Card.standard>
    </div>
  );
}
