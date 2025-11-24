/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Metric Card                                        │
│  /src/components/prebuilts/card/metric/index.tsx                       │
│                                                                        │
│  Dashboard metric display card. Big number. Trend indicator. Context.  │
│                                                                        │
│  Usage:                                                                │
│  import { CardVC } from '@/prebuilts/card';                │
│  <CardVC.metric                                                       │
│    title="Active Sessions"                                            │
│    value={127}                                                        │
│    trend={12}                                                          │
│    trendDirection="up"                                                │
│    context="from last week"                                           │
│  />                                                                    │
└────────────────────────────────────────────────────────────────────────┘ */


export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'flat';
  context?: string;
  className?: string;
}

/**
 * MetricCard - Key performance indicator display
 *
 * Features:
 * - Large prominent value display
 * - Optional trend indicator with direction
 * - Context text for time periods
 * - Automatic number formatting
 * - Color-coded trends
 *
 * Perfect for:
 * - KPI dashboards
 * - Analytics overviews
 * - Performance metrics
 * - Business intelligence displays
 */
export default function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'flat',
  context,
  className = ''
}: MetricCardProps) {
  const trendIcon = {
    up: '↑',
    down: '↓',
    flat: '→'
  }[trendDirection];

  const trendClass = `trend-${trendDirection}`;

  return (
    <div className={`vr-card vr-card-metric ${className}`}>
      <h3 className="vr-card-metric-title">{title}</h3>

      <p className="vr-card-metric-value">
        {typeof value === 'number' && value > 1000
          ? value.toLocaleString()
          : value}
      </p>

      {trend !== undefined && (
        <p className={`vr-card-metric-trend ${trendClass}`}>
          {trendIcon} {Math.abs(trend)}%
          {context && <span className="vr-card-metric-context"> {context}</span>}
        </p>
      )}

      {!trend && context && (
        <p className="vr-card-metric-context">{context}</p>
      )}
    </div>
  );
}