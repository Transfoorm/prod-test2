/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Rank Card                                         │
│  /src/prebuilts/rank/Card.tsx                                         │
│                                                                        │
│  TRUE VR: Self-contained rank statistics card.                        │
│  Fetches its own data, displays count, handles everything.            │
│                                                                        │
│  Usage:                                                               │
│  <RankCard rank="captain" />                                          │
│  That's it. No props for data, no state management.                   │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { RANK_METADATA } from '@/fuse/constants/ranks';

export interface RankCardProps {
  rank: 'admiral' | 'commodore' | 'captain' | 'crew';
}

/**
 * RankCard - Intelligent rank statistics display
 *
 * TRUE VR Features:
 * - Fetches its own data from Convex
 * - Displays rank-specific styling
 * - Shows count and percentage
 * - Zero configuration needed
 * - TTT Gap Model compliant
 */
export default function RankCard({ rank }: RankCardProps) {
  // VR manages its own data fetching
  const rankDist = useQuery(api.domains.admin.users.queries.subscriptionStats.getRankDistribution);

  if (!rankDist) {
    return (
      <div className="vr-rank-card vr-vr-rank-card--loading">
        <div className="vr-rank-card-shimmer" />
      </div>
    );
  }

  const meta = RANK_METADATA[rank];
  const count = rankDist[rank] || 0;
  const percentage = rankDist.total > 0
    ? ((count / rankDist.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div
      className="vr-rank-card"
      // Dynamic CSS custom property bridge (FUSE-STYLE Dynamic Law)
      style={{
        '--rank-color': meta.color,
        '--rank-bg': meta.bgColor,
      } as React.CSSProperties}
    >
      <div className="vr-rank-card-header">
        { }
        <img src={meta.icon} alt={meta.label} className="vr-rank-card-icon" />
        <span className="vr-rank-card-label">{meta.label}</span>
      </div>

      <div className="vr-rank-card-count">
        {count}
      </div>

      <div className="vr-rank-card-footer">
        <span className="vr-rank-card-percentage">{percentage}%</span>
        <span className="vr-rank-card-description">of all users</span>
      </div>
    </div>
  );
}
