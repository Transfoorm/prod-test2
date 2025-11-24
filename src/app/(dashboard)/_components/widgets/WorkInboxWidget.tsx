/**──────────────────────────────────────────────────────────────────────┐
│  ⚡ WORK INBOX WIDGET - Productivity Overview Component               │
│  /src/app/dashboard/_components/widgets/WorkInboxWidget.tsx           │
│                                                                        │
│  Displays work domain overview (emails, events, tasks).               │
│  Zero data ownership - receives composed stats as props.              │
│  Available to all ranks.                                              │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

interface WorkInboxWidgetProps {
  unreadEmails: number;
  upcomingEvents: number;
  activeTasks: number;
  isReady: boolean;
}

/**
 * WorkInboxWidget - Work productivity overview
 *
 * Shows:
 * - Unread emails count
 * - Upcoming calendar events
 * - Active tasks
 *
 * Data Source: Composed from useProductivityData() hook (WARP-primed)
 */
export function WorkInboxWidget({
  unreadEmails,
  upcomingEvents,
  activeTasks,
  isReady,
}: WorkInboxWidgetProps) {
  if (!isReady) {
    return (
      <div className="dashboard-widget work-inbox-widget loading">
        <div className="widget-header">
          <h3>⚡ Work Inbox</h3>
        </div>
        <div className="widget-body">
          <p>Loading work data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-widget work-inbox-widget">
      <div className="widget-header">
        <h3>⚡ Work Inbox</h3>
      </div>
      <div className="widget-body">
        <div className="stat-row">
          <span className="stat-label">Unread Emails</span>
          <span className="stat-value">{unreadEmails}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Upcoming Events</span>
          <span className="stat-value">{upcomingEvents}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Active Tasks</span>
          <span className="stat-value">{activeTasks}</span>
        </div>
      </div>
      <div className="widget-footer">
        <a href="/work/email" className="widget-link">
          Go to Inbox →
        </a>
      </div>
    </div>
  );
}
