/**──────────────────────────────────────────────────────────────────────┐
│  📋 PROJECT STATUS WIDGET - Project Overview Component                │
│  /src/app/dashboard/_components/widgets/ProjectStatusWidget.tsx       │
│                                                                        │
│  Displays project domain overview (active projects).                  │
│  Zero data ownership - receives composed stats as props.              │
│  Captain+ only.                                                       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

interface ProjectStatusWidgetProps {
  activeProjects: number;
  isReady: boolean;
}

/**
 * ProjectStatusWidget - Project overview
 *
 * Shows:
 * - Active projects count
 * - Project health indicators
 * - Recent project activity
 *
 * Data Source: Composed from useProjectData() hook (WARP-primed)
 *
 * Rank Access: Captain, Commodore, Admiral
 */
export function ProjectStatusWidget({
  activeProjects,
  isReady,
}: ProjectStatusWidgetProps) {
  if (!isReady) {
    return (
      <div className="dashboard-widget project-status-widget loading">
        <div className="widget-header">
          <h3>📋 Projects</h3>
        </div>
        <div className="widget-body">
          <p>Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-widget project-status-widget">
      <div className="widget-header">
        <h3>📋 Projects</h3>
      </div>
      <div className="widget-body">
        <div className="stat-row">
          <span className="stat-label">Active Projects</span>
          <span className="stat-value">{activeProjects}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Status</span>
          <span className="stat-value">
            {activeProjects > 0 ? 'In Progress' : 'None'}
          </span>
        </div>
      </div>
      <div className="widget-footer">
        <a href="/project/overview" className="widget-link">
          View Projects →
        </a>
      </div>
    </div>
  );
}
