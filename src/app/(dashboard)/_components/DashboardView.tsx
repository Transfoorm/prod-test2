/**──────────────────────────────────────────────────────────────────────┐
│  🎯 DASHBOARD VIEW - Composition Orchestrator                          │
│  /src/app/dashboard/_components/DashboardView.tsx                     │
│                                                                        │
│  Orchestrates dashboard layout and widget rendering.                  │
│  Composes data from domain slices via useDashboardData hook.          │
│  Zero data fetching - pure composition layer.                         │
│                                                                        │
│  References: TTT~DASHBOARD-IMPLEMENTATION-DOCTRINE.md §View            │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardActions } from '@/providers/DashboardProvider';
import { useFuse } from '@/store/fuse';
import { AdminStatsWidget } from './widgets/AdminStatsWidget';
import { WorkInboxWidget } from './widgets/WorkInboxWidget';
import { FinanceOverviewWidget } from './widgets/FinanceOverviewWidget';
import { ClientActivityWidget } from './widgets/ClientActivityWidget';
import { ProjectStatusWidget } from './widgets/ProjectStatusWidget';

/**
 * DashboardView - Main dashboard composition component
 *
 * Architecture:
 * - Reads dashboard UI preferences from FUSE (layout, visibleWidgets)
 * - Composes data from domain slices via useDashboardData
 * - Renders widgets based on rank and preferences
 * - Zero data fetching - all data from WARP-primed slices
 *
 * Layout Modes:
 * - classic: Traditional grid layout
 * - focus: Single-column focused view
 * - metrics: Dense metrics dashboard
 */
export function DashboardView() {
  const { data, computed, flags } = useDashboardData();
  const actions = useDashboardActions();
  const rank = useFuse((state) => state.rank);

  // Show loading state only if dashboard not hydrated
  if (!flags.isHydrated) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  const { layout, visibleWidgets } = data;
  const { stats, domainsReady, availableWidgets } = computed;

  // Widget visibility helpers
  const isWidgetVisible = (widgetId: string) => visibleWidgets.includes(widgetId);
  const isWidgetAvailable = (widgetId: string) => availableWidgets.includes(widgetId);

  // Layout class names
  const layoutClass = `dashboard-view dashboard-layout-${layout}`;

  return (
    <div className={layoutClass}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {rank === 'admiral' ? 'Fleet Command' :
           rank === 'commodore' ? 'Portfolio Dashboard' :
           rank === 'captain' ? 'Command Center' :
           'Dashboard'}
        </h1>

        {/* Layout Switcher */}
        <div className="dashboard-controls">
          <button
            onClick={() => actions.setLayout('classic')}
            className={layout === 'classic' ? 'active' : ''}
          >
            Classic
          </button>
          <button
            onClick={() => actions.setLayout('focus')}
            className={layout === 'focus' ? 'active' : ''}
          >
            Focus
          </button>
          <button
            onClick={() => actions.setLayout('metrics')}
            className={layout === 'metrics' ? 'active' : ''}
          >
            Metrics
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Admin Stats Widget (Admiral only) */}
        {isWidgetAvailable('admin-stats') && isWidgetVisible('admin-stats') && (
          <AdminStatsWidget
            totalUsers={stats.totalUsers}
            hasDeletionLogs={stats.hasDeletionLogs}
            isReady={domainsReady.admin}
          />
        )}

        {/* Work Inbox Widget (All ranks) */}
        {isWidgetAvailable('work-inbox') && isWidgetVisible('work-inbox') && (
          <WorkInboxWidget
            unreadEmails={stats.unreadEmails}
            upcomingEvents={stats.upcomingEvents}
            activeTasks={stats.activeTasks}
            isReady={domainsReady.work}
          />
        )}

        {/* Client Activity Widget (All ranks) */}
        {isWidgetAvailable('client-activity') && isWidgetVisible('client-activity') && (
          <ClientActivityWidget
            totalClients={stats.totalClients}
            activeSessions={stats.activeSessions}
            isReady={domainsReady.client}
          />
        )}

        {/* Finance Overview Widget (Captain+) */}
        {isWidgetAvailable('finance-overview') && isWidgetVisible('finance-overview') && (
          <FinanceOverviewWidget
            totalRevenue={stats.totalInvoices}
            totalExpenses={stats.totalBills}
            pendingInvoices={stats.totalTransactions}
            isReady={domainsReady.finance}
          />
        )}

        {/* Project Status Widget (Captain+) */}
        {isWidgetAvailable('project-status') && isWidgetVisible('project-status') && (
          <ProjectStatusWidget
            activeProjects={stats.activeProjects}
            isReady={domainsReady.project}
          />
        )}
      </div>

      {/* Widget Customization Panel (Optional) */}
      <div className="dashboard-footer">
        <button onClick={() => actions.resetToDefaults()}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
