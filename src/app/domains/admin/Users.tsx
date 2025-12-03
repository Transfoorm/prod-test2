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
import { useAdminSync } from '@/hooks/useAdminSync';
import { usePageTiming } from '@/fuse/hooks/usePageTiming';
import { Tabs, Stack } from '@/prebuilts';
import ActiveUsers from './_tabs/ActiveUsers';
import DeletedUsers from './_tabs/DeletedUsers';

export default function Users() {
  useSetPageHeader("User Management", 'View, ammend or delete active platform users');
  usePageTiming('/admin/users');

  // 🔄 Real-time sync: Convex → FUSE (live subscription)
  useAdminSync();

  // 🚀 WARP: Get counts from FUSE store (server-preloaded)
  const { computed } = useAdminData();

  return (
    <Stack>
      <Tabs.panels
        tabs={[
          { id: 'users', label: 'Active Users', count: computed.usersCount, content: <ActiveUsers /> },
          { id: 'deletelog', label: 'Deleted Users', count: computed.deletionLogsCount, content: <DeletedUsers /> }
        ]}
      />
    </Stack>
  );
}
