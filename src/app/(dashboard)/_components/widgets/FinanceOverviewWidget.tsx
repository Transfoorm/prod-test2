/**──────────────────────────────────────────────────────────────────────┐
│  💰 FINANCE OVERVIEW WIDGET - Financial Summary Component             │
│  /src/app/dashboard/_components/widgets/FinanceOverviewWidget.tsx     │
│                                                                        │
│  Displays finance domain overview (revenue, expenses, invoices).      │
│  Zero data ownership - receives composed stats as props.              │
│  Captain+ only.                                                       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

interface FinanceOverviewWidgetProps {
  totalRevenue: number;
  totalExpenses: number;
  pendingInvoices: number;
  isReady: boolean;
}

/**
 * FinanceOverviewWidget - Financial overview
 *
 * Shows:
 * - Total revenue (org-scoped)
 * - Total expenses (org-scoped)
 * - Pending invoices count
 *
 * Data Source: Composed from useFinancialData() hook (WARP-primed)
 *
 * Rank Access: Captain, Commodore, Admiral
 */
export function FinanceOverviewWidget({
  totalRevenue,
  totalExpenses,
  pendingInvoices,
  isReady,
}: FinanceOverviewWidgetProps) {
  if (!isReady) {
    return (
      <div className="dashboard-widget finance-overview-widget loading">
        <div className="widget-header">
          <h3>💰 Finances</h3>
        </div>
        <div className="widget-body">
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  // Calculate net (revenue - expenses)
  const netIncome = totalRevenue - totalExpenses;
  const isPositive = netIncome >= 0;

  return (
    <div className="dashboard-widget finance-overview-widget">
      <div className="widget-header">
        <h3>💰 Finances</h3>
      </div>
      <div className="widget-body">
        <div className="stat-row">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value revenue">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value expense">
            ${totalExpenses.toLocaleString()}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Net Income</span>
          <span className={`stat-value ${isPositive ? 'positive' : 'negative'}`}>
            ${Math.abs(netIncome).toLocaleString()}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Pending Invoices</span>
          <span className="stat-value">{pendingInvoices}</span>
        </div>
      </div>
      <div className="widget-footer">
        <a href="/finance/overview" className="widget-link">
          View Finances →
        </a>
      </div>
    </div>
  );
}
