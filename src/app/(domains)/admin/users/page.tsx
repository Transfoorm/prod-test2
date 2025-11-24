'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useAdminData } from '@/hooks/useAdminData';
import { Tabs, Stack } from '@/prebuilts';
import UsersTab from './_tabs/UsersTab';
import DeletionsTab from './_tabs/DeletionsTab';

export default function AdminUsersPage() {
  useSetPageHeader(undefined, 'All current users who use the platform');

  // 🚀 WARP: Get counts from FUSE store (server-preloaded)
  const { computed } = useAdminData();

  return (
    <Stack>
      <Tabs.panels      /* <-- Tabs Wrapper  */
        tabs={[
          { id: 'users', label: 'All Users', count: computed.usersCount, content: <UsersTab /> /* <-- Holds the Fragment */  },
          { id: 'deletelog', label: 'Deleted Users', count: computed.deletionLogsCount, content: <DeletionsTab /> /* <-- Holds the Fragment */ }
        ]}
      />
    </Stack>
  );
}
