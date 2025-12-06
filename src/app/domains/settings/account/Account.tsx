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
import { Tabs, Stack } from '@/prebuilts';
import Profile from './_tabs/Profile';
import Email from './_tabs/Email';
import Security from './_tabs/Security';
import Genome from './_tabs/Genome';

export default function Account() {
  useSetPageHeader('Manage Account', 'These are your account details and settings');
  usePageTiming('/settings/account');

  const user = useFuse((s) => s.user);
  const setShadowKingActive = useFuse((s) => s.setShadowKingActive);

  const freeze = user?.setupStatus === 'pending';

  // If frozen, intercept ALL clicks and focus - block interaction, show modal
  const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    if (freeze) {
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
            { id: 'profile', label: 'Profile', content: <Profile /> },
            { id: 'email', label: 'Email', content: <Email /> },
            { id: 'security', label: 'Security', content: <Security /> },
            { id: 'genome', label: 'Professional Genome', content: <Genome /> },
          ]}
        />
      </div>
    </Stack>
  );
}
