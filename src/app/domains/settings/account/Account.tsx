/**──────────────────────────────────────────────────────────────────────┐
│  🔱 ACCOUNT - Sovereign Domain                                         │
│  /src/app/domains/settings/account/Account.tsx                         │
│                                                                        │
│  FUSE 6.0: Pure client view that reads from FUSE store.                │
│  No server fetch. No RSC. Instant render.                              │
│                                                                        │
│  Shadow King Integration:                                              │
│  When setupStatus === 'pending', clicking any tab or field activates   │
│  Shadow King. User can view the page but interaction triggers invite.  │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { usePageTiming } from '@/fuse/hooks/usePageTiming';
import { useFuse } from '@/store/fuse';
import { Tabs, Stack, Icon } from '@/prebuilts';
import Profile from './_tabs/Profile';
import Email from './_tabs/Email';
import Security from './_tabs/Security';
import Genome from './_tabs/Genome';

export default function Account() {
  useSetPageHeader('Manage Account', 'These are your account details and settings');
  usePageTiming('/settings/account');

  const user = useFuse((s) => s.user);
  const genome = useFuse((s) => s.genome);
  const setShadowKingActive = useFuse((s) => s.setShadowKingActive);

  const freeze = user?.setupStatus === 'pending';
  const genomePercent = genome?.completionPercent ?? 0;

  // If frozen, intercept field interactions only - tabs are allowed
  const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    if (!freeze) return;

    const target = e.target as HTMLElement;

    // Allow tab clicks - only block input/field interactions
    const isTabClick = target.closest('[role="tab"]') || target.closest('.vr-tabs-tab');
    if (isTabClick) return;

    // Allow Email and Security tabs - entice interaction
    const isEmailTab = target.closest('.ft-email-field-with-action') || target.closest('.vr-field-row');
    const isSecurityTab = target.closest('.ft-password-ceremony');
    if (isEmailTab || isSecurityTab) return;

    // Block field interactions and show Shadow King
    const isFieldInteraction = target.closest('.vr-field') ||
                               target.closest('input') ||
                               target.closest('textarea') ||
                               target.closest('select') ||
                               target.closest('.vr-dropdown-simple') ||
                               target.closest('.ft-country-selector');

    if (isFieldInteraction) {
      e.preventDefault();
      e.stopPropagation();
      // Blur any focused element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setShadowKingActive(true);
    }
  };

  return (
    <Stack>
      <div
        onClickCapture={handleInteraction}
        onFocusCapture={handleInteraction}
      >
        <Tabs.panels
          tabs={[
            { id: 'profile', label: 'Profile', icon: <Icon variant="user" />, content: <Profile /> },
            { id: 'email', label: 'Email', icon: <Icon variant="send" />, content: <Email /> },
            { id: 'security', label: 'Security', icon: <Icon variant="lock" />, content: <Security /> },
            { id: 'genome', label: <>Genome <span className="vr-tabs-panels-label-sm">{genomePercent}%</span></>, icon: <Icon variant="dna" />, content: <Genome />, highlight: genomePercent < 100 },
          ]}
        />
      </div>
    </Stack>
  );
}
