/**──────────────────────────────────────────────────────────────────────┐
│  👥 ACTIVE USERS - Living Users Tab                                    │
│  /src/app/domains/admin/_tabs/ActiveUsers.tsx                          │
│                                                                        │
│  All current platform users. VANISH opens deletion portal.            │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useMemo } from 'react';
import { Search, Table, Badge, Modal, Stack } from '@/prebuilts';
import { useSideDrawer } from '@/prebuilts/modal';
import { useTableSearch } from '@/prebuilts/table';
import type { SortableColumn } from '@/prebuilts/table/Sortable';
import type { RankType } from '@/prebuilts/badge/Rank';
import type { SetupStatusType } from '@/prebuilts/badge/Setup';
import { useVanish } from '@/vanish/Drawer';
import { useAdminData } from '@/hooks/useAdminData';
import { useFuse } from '@/store/fuse';

type UserData = Record<string, unknown> & { id: string };

export default function ActiveUsers() {
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());

  // 🚀 WARP: Instant data access from FUSE store (server-preloaded)
  const { data } = useAdminData();
  const users = data.users;
  const { openDrawer: openVanishDrawer } = useVanish();
  const { openDrawer } = useSideDrawer();

  // Get current user for self-deletion protection
  const fuseUser = useFuse((state) => state.user);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const handleHeaderCheckbox = () => {
    setCheckedRows(new Set());
  };

  const handleRowCheckbox = (id: string) => {
    setCheckedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleViewUser = () => {
    openDrawer({
      content: <div>User details placeholder</div>,
      title: 'User Details'
    });
  };

  const handleDeleteUser = (row: UserData) => {
    openVanishDrawer({ target: row.id }, (result) => {  // row.id is the Convex _id
      if (result.success) {
        const deletedUser = result.deletedUsers?.[0];
        const userName = deletedUser?.name && deletedUser.name.trim() !== '-' && deletedUser.name.trim() !== ''
          ? deletedUser.name
          : '';
        setModalState({
          isOpen: true,
          title: 'Success',
          message: `User ${userName ? userName + ' - ' : ''}${deletedUser?.email || ''} was successfully deleted`,
          variant: 'success'
        });
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? `\n\n${result.errors[0]}`
          : '';
        setModalState({
          isOpen: true,
          title: 'Deletion Failed',
          message: `Failed to delete user${errorMsg}`,
          variant: 'error'
        });
      }
    });
  };

  // Handler for batch deleting users
  const handleBatchDelete = () => {
    // Filter out self (can't delete yourself)
    const userIds = Array.from(checkedRows).filter(id => id !== fuseUser?.id);
    if (userIds.length === 0) return;

    openVanishDrawer({ targets: userIds }, (result) => {
      if (result.success) {
        const count = result.deletedUsers?.length || userIds.length;
        setModalState({
          isOpen: true,
          title: 'Success',
          message: `Successfully deleted ${count} user${count === 1 ? '' : 's'}`,
          variant: 'success'
        });
        setCheckedRows(new Set());
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? `\n\n${result.errors[0]}`
          : '';
        setModalState({
          isOpen: true,
          title: 'Batch Deletion Failed',
          message: `Failed to delete users${errorMsg}`,
          variant: 'error'
        });
      }
    });
  };

  // Column definitions (needed before useTableSearch)
  const columns: SortableColumn<UserData>[] = [
    { key: 'select', variant: 'checkbox', checked: checkedRows, onCheck: handleRowCheckbox, onHeaderCheck: handleHeaderCheckbox, getRowLabel: (row) => `${row.firstName}`, currentUserId: fuseUser?.id, sortable: false },
    { key: 'createdAt', header: 'Created', sortable: true, width: '11%' },
    { key: 'firstName', header: 'First', sortable: true, width: '9%' },
    { key: 'lastName', header: 'Last', sortable: true, width: '12%' },
    { key: 'email', header: 'Email', sortable: true, width: '17%' },
    { key: 'setupStatus', header: 'Setup', sortable: true, width: '10%', render: (_value, row) => <Badge.setup status={row.setupStatus as SetupStatusType} /> },
    { key: 'entityName', header: 'Entity', sortable: true, width: '12%' },
    { key: 'socialName', header: 'Social', sortable: true, width: '12%' },
    { key: 'rank', header: 'Rank', sortable: true, width: '10%', render: (_value, row) => <Badge.rank rank={row.rank as RankType} /> },
    { key: 'actions', header: 'Actions', sortable: false, variant: 'view', currentUserId: fuseUser?.id, onView: handleViewUser, onDelete: handleDeleteUser },
  ];

  // Transform raw user data for table display
  const tableData = useMemo(() => users?.map(user => ({
    id: String(user._id),
    createdAt: user.createdAt ? new Date(user.createdAt as number).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
    firstName: user.firstName as string,
    lastName: user.lastName as string,
    email: user.email as string,
    setupStatus: user.setupStatus as SetupStatusType,
    entityName: user.entityName as string,
    socialName: user.socialName as string,
    rank: user.rank as RankType
  })) || [], [users]);

  // 🔍 Auto-search: filters all columns except checkbox & actions
  const { searchTerm, setSearchTerm, filteredData, totalCount, resultsCount } = useTableSearch({
    data: tableData,
    columns,
  });

  return (
    <Stack>
      {/* Table.toolbar: Search left, batch actions right - TTT compliant layout */}
      <Table.toolbar
        search={
          <Search.bar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
            resultsCount={resultsCount}
            totalCount={totalCount}
          />
        }
        actions={
          <Table.batchActions
            selectedCount={checkedRows.size}
            onDelete={handleBatchDelete}
            label="user/users"
          />
        }
      />

      <Table.sortable
        columns={columns}
        data={filteredData}
        defaultSortKey={null}
        striped
        bordered
      />

      {modalState.isOpen && (
        <Modal.alert
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          title={modalState.title}
          message={modalState.message}
          variant={modalState.variant}        />
      )}
    </Stack>
  );
}
