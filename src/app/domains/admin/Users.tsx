/**──────────────────────────────────────────────────────────────────────┐
│  🔱 USERS - Sovereign Domain                                           │
│  /src/app/domains/admin/Users.tsx                                       │
│                                                                        │
│  FUSE 6.0: Pure client view that reads from FUSE store.                │
│  No server fetch. No RSC. Instant render.                              │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useAdminData } from '@/hooks/useAdminData';
import { usePageTiming } from '@/fuse/hooks/usePageTiming';
import { Tabs, Stack } from '@/prebuilts';
import UsersTab from './_tabs/UsersTab';
import DeletionsTab from './_tabs/DeletionsTab';

export default function Users() {
  useSetPageHeader(undefined, 'All current users who use the platform');
  usePageTiming('/admin/users');

  // 🚀 WARP: Get counts from FUSE store (server-preloaded)
  const { computed } = useAdminData();

  return (
    <Stack>
      <Tabs.panels
        tabs={[
          { id: 'users', label: 'All Users', count: computed.usersCount, content: <UsersTab /> },
          { id: 'deletelog', label: 'Deleted Users', count: computed.deletionLogsCount, content: <DeletionsTab /> }
        ]}
      />
    </Stack>
  );
}
