/**──────────────────────────────────────────────────────────────────────┐
│  🗑️ DELETIONS TAB - VANISH Journal (VR-Compliant)                     │
│  /src/app/domains/admin/_tabs/DeletionsTab.tsx                         │
│                                                                        │
│  VR Gospel compliant deletion logs tab. Zero CSS files.               │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { Table, Badge, Modal, Search, Stack } from '@/prebuilts';
import type { RankType } from '@/prebuilts/badge/Rank';
import type { SetupStatusType } from '@/prebuilts/badge/Setup';
import type { CascadeStatusType } from '@/prebuilts/badge/Cascade';
import type { SortableColumn } from '@/prebuilts/table/Sortable';
import { useAdminData } from '@/hooks/useAdminData';

type DeletionLog = Doc<"admin_users_DeletionLogs">;

export default function DeletionsTab() {

  // 🚀 WARP: Instant data access from FUSE store (server-preloaded)
  const { data } = useAdminData();
  const deletionLogsRaw = data.deletionLogs;

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Pre-format table data (like UsersTab pattern)
  const tableData = useMemo(() => {
    if (!deletionLogsRaw) return [];

    return deletionLogsRaw.map(log => {
      const logData = log as DeletionLog;
      const date = new Date(logData._creationTime);
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const name = logData.firstName && logData.lastName
        ? `${logData.firstName} ${logData.lastName}`
        : '—';

      return {
        ...logData,
        id: logData._id,  // Add explicit id field for Actions component
        dateDisplay: `${dateStr} ${timeStr}`,
        nameDisplay: name,
        emailDisplay: logData.email || '—',
        recordsDisplay: logData.recordsDeleted || 0
      };
    });
  }, [deletionLogsRaw]);

  // Filter formatted data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;

    const term = searchTerm.toLowerCase();
    return tableData.filter((log) => {
      return (
        log.nameDisplay.toLowerCase().includes(term) ||
        log.emailDisplay.toLowerCase().includes(term) ||
        log.rank?.toLowerCase().includes(term) ||
        log.status?.toLowerCase().includes(term) ||
        log.dateDisplay.includes(term)
      );
    });
  }, [tableData, searchTerm]);

  // Selection state for deletion logs
  const [selectedLogs, setSelectedLogs] = useState<Set<Id<"admin_users_DeletionLogs">>>(new Set());

  // Modal state for viewing log details
  const [selectedLog, setSelectedLog] = useState<DeletionLog | null>(null);

  // Modal state for confirmations and alerts
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    alertMode: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    alertMode: false
  });

  // Mutation for deleting journal entries
  const deleteJournalEntry = useMutation(api.domains.admin.users.api.deleteDeletionLog);

  // Checkbox handlers - DeletionsTab allows select-all (audit logs safe to bulk delete)
  const handleHeaderCheckbox = useCallback(() => {
    if (selectedLogs.size === filteredData.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredData.map(log => log._id)));
    }
  }, [selectedLogs.size, filteredData]);

  const handleRowCheckbox = useCallback((logId: Id<"admin_users_DeletionLogs">) => {
    setSelectedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  }, []);

  // Handler for deleting single journal entry
  const handleDeleteJournalEntry = useCallback(async (logId: Id<"admin_users_DeletionLogs">) => {
    setModalState({
      isOpen: true,
      title: 'Delete VANISH Journal Entry?',
      message: 'This will permanently delete this audit log entry. This action cannot be undone.\n\nAre you sure?',
      variant: 'error',
      alertMode: false,
      onConfirm: async () => {
        try {
          const result = await deleteJournalEntry({ logId });
          if (result.success) {
            setModalState({
              isOpen: true,
              title: 'Success',
              message: 'Journal entry deleted successfully',
              variant: 'success',
              alertMode: true
            });
            setSelectedLog(null);
          }
        } catch (error) {
          setModalState({
            isOpen: true,
            title: 'Error',
            message: `Failed to delete journal entry:\n${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: 'error',
            alertMode: true
          });
        }
      }
    });
  }, [deleteJournalEntry]);

  // Handler for bulk deleting journal entries (called by VR with selected IDs)
  const handleBulkDeleteLogs = useCallback(async (logIds: Id<"admin_users_DeletionLogs">[]) => {

    setModalState({
      isOpen: true,
      title: 'Delete Selected Journal Entries?',
      message: `This will permanently delete ${logIds.length} audit log ${logIds.length === 1 ? 'entry' : 'entries'}. This action cannot be undone.\n\nAre you sure?`,
      variant: 'error',
      alertMode: false,
      onConfirm: async () => {
        try {
          const results = await Promise.all(
            logIds.map(logId => deleteJournalEntry({ logId }))
          );

          const successCount = results.filter((r: {success: boolean}) => r.success).length;

          if (successCount === logIds.length) {
            setModalState({
              isOpen: true,
              title: 'Success',
              message: `Successfully deleted ${successCount} journal ${successCount === 1 ? 'entry' : 'entries'}`,
              variant: 'success',
              alertMode: true
            });
            setSelectedLogs(new Set());
          } else {
            setModalState({
              isOpen: true,
              title: 'Partial Success',
              message: `Deleted ${successCount} of ${logIds.length} entries. Some deletions failed.`,
              variant: 'warning',
              alertMode: true
            });
            setSelectedLogs(new Set());
          }
        } catch (error) {
          setModalState({
            isOpen: true,
            title: 'Error',
            message: `Failed to delete journal entries:\n${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: 'error',
            alertMode: true
          });
        }
      }
    });
  }, [deleteJournalEntry]);

  type FormattedLog = (typeof tableData)[number];

  const deletionColumns: SortableColumn<FormattedLog>[] = useMemo(() => [
    { key: 'select', variant: 'checkbox', checked: selectedLogs, onCheck: handleRowCheckbox, onHeaderCheck: handleHeaderCheckbox, getRowId: (log) => log._id, getRowLabel: (log) => log.emailDisplay, onBatchDelete: handleBulkDeleteLogs, batchLabel: 'entry/entries', sortable: false },
    { key: 'dateDisplay', header: 'Date', sortable: true, width: '16%' },
    { key: 'nameDisplay', header: 'User', sortable: true, width: '15%' },
    { key: 'emailDisplay', header: 'Email', sortable: true, width: '20%' },
    { key: 'rank', header: 'Rank', sortable: true, render: (_value, row) => <Badge.rank rank={(row.rank || 'crew') as RankType} /> },
    { key: 'setupStatus', header: 'Setup', sortable: true, width: '10%', render: (_value, row) => <Badge.setup status={row.setupStatus as SetupStatusType} /> },
    {
      key: 'status',
      header: 'Cascade',
      sortable: true,
      render: (_value, row) => <Badge.cascade status={row.status as CascadeStatusType} />
    },
    { key: 'recordsDisplay', header: 'Records', sortable: true, width: '8%', cellAlign: 'center' },
    { key: 'actions', header: 'Actions', sortable: false, variant: 'view', onView: (log) => setSelectedLog(log), onDelete: (log) => handleDeleteJournalEntry(log._id) }
  ], [selectedLogs, handleRowCheckbox, handleHeaderCheckbox, handleBulkDeleteLogs, handleDeleteJournalEntry]);

  return (
    <Stack>
      <Search.bar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search deletion logs..."
        resultsCount={filteredData.length}
        totalCount={tableData.length}
      />

      {/* VR auto-renders batch actions when checkbox selected */}
      <Table.sortable
        columns={deletionColumns}
        data={filteredData}
        defaultSortKey={null}
        striped
        bordered
      />

      {/* VANISH Journal Detail Modal */}
      {selectedLog && (
        <Modal.alert
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="VANISH Journal Entry"
          message="Audit trail details"
          details={[
            `Name: ${selectedLog.firstName && selectedLog.lastName ? `${selectedLog.firstName} ${selectedLog.lastName}` : '—'}`,
            `User ID: ${selectedLog.userId}`,
            `Clerk ID: ${selectedLog.clerkId}`,
            `Email: ${selectedLog.email}`,
            ...(selectedLog.entityName ? [`Entity Name: ${selectedLog.entityName}`] : []),
            ...(selectedLog.socialName ? [`Social Name: ${selectedLog.socialName}`] : []),
            '---',
            `Rank: ${selectedLog.rank || 'unknown'}`,
            `Subscription: ${selectedLog.subscriptionStatus || '—'}`,
            `Status: ${selectedLog.status}`,
            `Records Deleted: ${selectedLog.recordsDeleted || 0}`,
            '---',
            `Deleted: ${new Date(selectedLog._creationTime).toLocaleString()}`,
            '---',
            `Entry ID: ${selectedLog._id}`,
            ...(selectedLog.reason ? [`Reason: ${selectedLog.reason}`] : [])
          ]}
          variant="info"
        />
      )}

      {/* Confirmation/Alert Modal */}
      {modalState.isOpen && (
        modalState.alertMode ? (
          <Modal.alert
            isOpen={modalState.isOpen}
            onClose={() => setModalState({ ...modalState, isOpen: false })}
            title={modalState.title}
            message={modalState.message}
            variant={modalState.variant}
          />
        ) : (
          <Modal.confirmation
            isOpen={modalState.isOpen}
            onCancel={() => setModalState({ ...modalState, isOpen: false })}
            onConfirm={() => {
              if (modalState.onConfirm) {
                modalState.onConfirm();
              }
              setModalState({ ...modalState, isOpen: false });
            }}
            title={modalState.title}
            message={modalState.message}
            variant={modalState.variant === 'error' ? 'danger' : 'default'}
          />
        )
      )}
    </Stack>
  );
}
