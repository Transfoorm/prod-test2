/**──────────────────────────────────────────────────────────────────────┐
│  ⭐ ADMIRAL NAVIGATION                                                │
│  /src/shell/Sidebar/navigation/admiral.ts                            │
│                                                                        │
│  Navigation structure for Admiral rank (platform administrator)      │
└────────────────────────────────────────────────────────────────────────┘ */

import type { NavSection } from './types';

export const admiralNav: NavSection[] = [
  {
    label: 'Dashboard',
    icon: 'layout-dashboard',
    path: '/'
  },
  {
    label: 'Admin',
    icon: 'user-star',
    children: [
      { path: '/admin/users', label: 'Users' },
      { path: '/admin/plans', label: 'Plans' },
      { path: '/admin/features', label: 'Features' }
    ]
  },
  {
    label: 'System',
    icon: 'activity',
    children: [
      { path: '/system/ai', label: 'AI' },
      { path: '/system/ranks', label: 'Ranks' }
    ]
  },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      { path: '/settings/account', label: 'Account' },
      { path: '/settings/preferences', label: 'Preferences' }
    ]
  }
];
