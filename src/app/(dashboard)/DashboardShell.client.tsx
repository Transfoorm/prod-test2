/**──────────────────────────────────────────────────────────────────────┐
│  🎯 DASHBOARD SHELL - Client Wrapper with Provider                    │
│  /src/app/(dashboard)/DashboardShell.client.tsx                        │
│                                                                        │
│  'use client' wrapper that mounts DashboardProvider                   │
│  Manages UI preferences only (zero data ownership)                    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { ReactNode } from 'react';
import { DashboardProvider } from '@/providers/DashboardProvider';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * DashboardShell - Client boundary
 *
 * Architecture:
 * - Client component ('use client')
 * - Wraps children with DashboardProvider
 * - DashboardProvider syncs UI prefs to localStorage
 * - Zero UI - pure state management wrapper
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
