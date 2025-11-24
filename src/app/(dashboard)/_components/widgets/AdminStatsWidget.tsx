/**──────────────────────────────────────────────────────────────────────┐
│  🛡️ ADMIN STATS WIDGET - Admiral Dashboard Component                 │
│  /src/app/dashboard/_components/widgets/AdminStatsWidget.tsx          │
│                                                                        │
│  Displays platform-wide admin statistics.                             │
│  Zero data ownership - receives composed stats as props.              │
│  Admiral rank only.                                                   │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import Link from 'next/link';

interface AdminStatsWidgetProps {
  totalUsers: number;
  hasDeletionLogs: boolean;
  isReady: boolean;
}

/**
 * AdminStatsWidget - Platform admin overview
 *
 * Shows:
 * - Total users across platform
 * - Deletion log alerts
 * - System health indicators
 *
 * Data Source: Composed from useAdminData() hook (WARP-primed)
 */
export function AdminStatsWidget({
  totalUsers,
  hasDeletionLogs,
  isReady,
}: AdminStatsWidgetProps) {
  if (!isReady) {
    return (
      <div className="dashboard-widget admin-stats-widget loading">
        <div className="widget-header">
          <h3>🛡️ Platform Admin</h3>
        </div>
        <div className="widget-body">
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-widget admin-stats-widget">
      <div className="widget-header">
        <h3>🛡️ Platform Admin</h3>
      </div>
      <div className="widget-body">
        <div className="stat-row">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{totalUsers}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Deletion Logs</span>
          <span className={`stat-value ${hasDeletionLogs ? 'alert' : ''}`}>
            {hasDeletionLogs ? 'Active' : 'None'}
          </span>
        </div>
      </div>
      <div className="widget-footer">
        <Link href="/admin/users" className="widget-link">
          View Admin Panel →
        </Link>
      </div>
    </div>
  );
}
