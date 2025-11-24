/**──────────────────────────────────────────────────────────────────────┐
│  👥 CLIENT ACTIVITY WIDGET - Client Overview Component                │
│  /src/app/dashboard/_components/widgets/ClientActivityWidget.tsx      │
│                                                                        │
│  Displays client domain overview (clients, sessions).                 │
│  Zero data ownership - receives composed stats as props.              │
│  Available to all ranks (scoped per rank).                            │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

interface ClientActivityWidgetProps {
  totalClients: number;
  activeSessions: number;
  isReady: boolean;
}

/**
 * ClientActivityWidget - Client relationship overview
 *
 * Shows:
 * - Total clients (scoped by rank)
 * - Active client sessions
 * - Recent client activity
 *
 * Data Source: Composed from useClientData() hook (WARP-primed)
 *
 * Rank Scoping:
 * - Crew: Assigned clients only
 * - Captain/Commodore: Org-scoped clients
 * - Admiral: Platform-wide clients
 */
export function ClientActivityWidget({
  totalClients,
  activeSessions,
  isReady,
}: ClientActivityWidgetProps) {
  if (!isReady) {
    return (
      <div className="dashboard-widget client-activity-widget loading">
        <div className="widget-header">
          <h3>👥 Client Activity</h3>
        </div>
        <div className="widget-body">
          <p>Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-widget client-activity-widget">
      <div className="widget-header">
        <h3>👥 Client Activity</h3>
      </div>
      <div className="widget-body">
        <div className="stat-row">
          <span className="stat-label">Total Clients</span>
          <span className="stat-value">{totalClients}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Active Sessions</span>
          <span className="stat-value">{activeSessions}</span>
        </div>
      </div>
      <div className="widget-footer">
        <a href="/client/people" className="widget-link">
          View All Clients →
        </a>
      </div>
    </div>
  );
}
