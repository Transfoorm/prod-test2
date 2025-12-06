/**──────────────────────────────────────────────────────────────────────┐
│  🔱 ACCOUNT - Sovereign Domain                                         │
│  /src/app/domains/settings/account/Account.tsx                         │
│                                                                        │
│  FUSE 6.0: Pure client view that reads from FUSE store.                │
│  No server fetch. No RSC. Instant render.                              │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { usePageTiming } from '@/fuse/hooks/usePageTiming';
import { Tabs, Stack } from '@/prebuilts';
import Profile from './_tabs/Profile';
import Email from './_tabs/Email';
import Security from './_tabs/Security';
import Genome from './_tabs/Genome';

export default function Account() {
  useSetPageHeader('Manage Account', 'These are your account details and settings');
  usePageTiming('/settings/account');

  return (
    <Stack>
      <Tabs.panels
        tabs={[
          { id: 'profile', label: 'Profile', content: <Profile /> },
          { id: 'email', label: 'Email', content: <Email /> },
          { id: 'security', label: 'Security', content: <Security /> },
          { id: 'genome', label: 'Professional Genome', content: <Genome /> },
        ]}
      />
    </Stack>
  );
}
