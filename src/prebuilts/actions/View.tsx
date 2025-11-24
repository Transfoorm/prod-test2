/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - View Actions                                       │
│  /src/prebuilts/actions/View.tsx                                       │
│                                                                         │
│  Read-only action icons: View + Delete                                 │
│  VR renders icons, page provides behavior via props.                   │
└─────────────────────────────────────────────────────────────────────────┘ */

import { Icon } from '@/prebuilts/icon/iconRegistry';
import { Tooltip } from '@/prebuilts';

export interface ViewActionsProps<TRow = Record<string, unknown>> {
  row: TRow;
  onView?: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
  disableView?: boolean | ((row: TRow) => boolean);
  disableDelete?: boolean | ((row: TRow) => boolean);
  // Smart tooltip behavior - VR handles tooltip rendering
  viewTooltip?: string | ((row: TRow) => string);
  deleteTooltip?: string | ((row: TRow) => string);
  // Auto-detection: Current user for self-protection (VR auto-disables self rows)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUserId?: any;  // Accept both string and Id<table> types
}

export default function ViewActions<TRow = Record<string, unknown>>({
  row,
  onView,
  onDelete,
  disableView,
  disableDelete,
  viewTooltip,
  deleteTooltip,
  currentUserId
}: ViewActionsProps<TRow>) {
  // VR auto-detects self row if currentUserId provided
  // Convert both IDs to strings for comparison (handles Convex Id<table> types)
  const rowId = String((row as Record<string, unknown>).id);
  const userId = String(currentUserId);
  const isSelfRow = currentUserId && rowId === userId;

  const viewDisabled = typeof disableView === 'function' ? disableView(row) : disableView;

  // VR auto-disables delete for self rows
  const deleteDisabled = isSelfRow
    ? true
    : (typeof disableDelete === 'function' ? disableDelete(row) : disableDelete);

  // Compute tooltip text (VR auto-generates for self rows)
  const viewTooltipText = typeof viewTooltip === 'function'
    ? viewTooltip(row)
    : viewTooltip || (viewDisabled ? "Cannot view" : "View details");

  const deleteTooltipText = isSelfRow
    ? "You cannot delete yourself"
    : (typeof deleteTooltip === 'function'
        ? deleteTooltip(row)
        : deleteTooltip || (deleteDisabled ? "Cannot delete" : "Delete"));

  const viewIcon = (
    <span
      onClick={() => !viewDisabled && onView?.(row)}
      data-disabled={viewDisabled || undefined}
    >
      <Icon variant="search" size="xs" />
    </span>
  );

  const deleteIcon = (
    <span
      onClick={() => !deleteDisabled && onDelete?.(row)}
      data-disabled={deleteDisabled || undefined}
    >
      <Icon variant="trash" size="xs" />
    </span>
  );

  return (
    <>
      <Tooltip.basic content={viewTooltipText}>
        {viewIcon}
      </Tooltip.basic>
      <Tooltip.basic content={deleteTooltipText}>
        {deleteIcon}
      </Tooltip.basic>
    </>
  );
}
