/**──────────────────────────────────────────────────────────────────────┐
│  🎖️ COMMODORE NAVIGATION                                              │
│  /src/shell/Sidebar/navigation/commodore.ts                          │
│                                                                        │
│  Navigation structure for Commodore rank (upgraded captain)        │
│  DRY: Uses ROUTES constant for all paths                             │
└────────────────────────────────────────────────────────────────────────┘ */

import { ROUTES } from '@/rank/routes';
import type { NavSection } from './types';

export const commodoreNav: NavSection[] = [
  {
    label: 'Dashboard',
    icon: 'layout-dashboard',
    path: ROUTES.dashboard
  },
  {
    label: 'Productivity',
    icon: 'send',
    children: [
      { path: ROUTES.productivity.email, label: 'Email' },
      { path: ROUTES.productivity.calendar, label: 'Calendar' },
      { path: ROUTES.productivity.meetings, label: 'Meetings' }
    ]
  },
  {
    label: 'Clients',
    icon: 'handshake',
    children: [
      { path: ROUTES.clients.people, label: 'People' },
      { path: ROUTES.clients.pipeline, label: 'Pipeline' },
      { path: ROUTES.clients.sessions, label: 'Sessions' }
    ]
  },
  {
    label: 'Projects',
    icon: 'chart-bar-stacked',
    children: [
      { path: ROUTES.projects.overview, label: 'Overview' },
      { path: ROUTES.projects.tracking, label: 'Tracking' }
    ]
  },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      { path: ROUTES.settings.account, label: 'Account' },
      { path: ROUTES.settings.preferences, label: 'Preferences' }
    ]
  }
];
