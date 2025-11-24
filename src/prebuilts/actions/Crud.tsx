/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - CRUD Actions                                       │
│  /src/prebuilts/actions/Crud.tsx                                       │
│                                                                         │
│  Standard CRUD action icons: Edit + Delete                             │
│  VR renders icons, page provides behavior via props.                   │
└─────────────────────────────────────────────────────────────────────────┘ */

import { Icon } from '@/prebuilts/icon/iconRegistry';

import { Tooltip } from '@/prebuilts';

export interface CrudActionsProps<TRow = Record<string, unknown>> {
  row: TRow;
  onEdit?: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
  disableEdit?: boolean | ((row: TRow) => boolean);
  disableDelete?: boolean | ((row: TRow) => boolean);
  // Smart tooltip behavior - VR handles tooltip rendering
  editTooltip?: string | ((row: TRow) => string);
  deleteTooltip?: string | ((row: TRow) => string);
  // Auto-detection: Current user for self-protection (VR auto-disables self rows)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUserId?: any;  // Accept both string and Id<table> types
}

export default function CrudActions<TRow = Record<string, unknown>>({
  row,
  onEdit,
  onDelete,
  disableEdit,
  disableDelete,
  editTooltip,
  deleteTooltip,
  currentUserId
}: CrudActionsProps<TRow>) {
  // VR auto-detects self row if currentUserId provided
  // Convert both IDs to strings for comparison (handles Convex Id<table> types)
  const rowId = String((row as Record<string, unknown>).id);
  const userId = String(currentUserId);
  const isSelfRow = currentUserId && rowId === userId;

  const editDisabled = typeof disableEdit === 'function' ? disableEdit(row) : disableEdit;

  // VR auto-disables delete for self rows
  const deleteDisabled = isSelfRow
    ? true
    : (typeof disableDelete === 'function' ? disableDelete(row) : disableDelete);

  // Compute tooltip text (VR auto-generates for self rows)
  const editTooltipText = typeof editTooltip === 'function'
    ? editTooltip(row)
    : editTooltip || (editDisabled ? "Cannot edit" : "Edit");

  const deleteTooltipText = isSelfRow
    ? "You cannot delete yourself"
    : (typeof deleteTooltip === 'function'
        ? deleteTooltip(row)
        : deleteTooltip || (deleteDisabled ? "Cannot delete" : "Delete"));

  const editIcon = (
    <span
      onClick={() => !editDisabled && onEdit?.(row)}
      data-disabled={editDisabled || undefined}
    >
      <Icon variant="pencil" size="xs" />
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
      <Tooltip.basic content={editTooltipText}>
        {editIcon}
      </Tooltip.basic>
      <Tooltip.basic content={deleteTooltipText}>
        {deleteIcon}
      </Tooltip.basic>
    </>
  );
}
