/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Table Component Registry                           │
│  /src/components/prebuilts/table/index.tsx                             │
│                                                                        │
│  Central dispatcher for all table variants.                            │
│  Each variant is a first-class, autonomous component.                  │
│                                                                        │
│  Usage:                                                                │
│  import { Table } from '@/prebuilts/table';                │
│                                                                        │
│  <Table.standard columns={cols} data={data} />                        │
│  <Table.sortable columns={cols} data={data} />                        │
│  <Table.paginated columns={cols} data={data} pageSize={10} />        │
└────────────────────────────────────────────────────────────────────────┘ */


import StandardTable from './Standard';
import SortableTable from './Sortable';
import PaginatedTable from './Paginated';

/**
 * Table Registry - All table variants as named exports
 *
 * Architecture benefits:
 * ✅ Each variant evolves independently
 * ✅ No conditional rendering mess
 * ✅ Tree-shakeable - unused tables aren't bundled
 * ✅ Testable in isolation
 * ✅ Self-documenting structure
 * ✅ AI/CLI friendly: "Give me a sortable table" → Table.sortable
 */
export const Table = {
  standard: StandardTable,
  sortable: SortableTable,
  paginated: PaginatedTable,
} as const;

// Export individual components for direct import if needed
export {
  StandardTable,
  SortableTable,
  PaginatedTable
};

// Type exports for TypeScript users
export type { StandardTableProps, Column } from './Standard';
export type { SortableTableProps, SortableColumn } from './Sortable';
export type { PaginatedTableProps, PaginatedColumn } from './Paginated';

// Helper type for variant names
export type TableVariant = keyof typeof Table;
