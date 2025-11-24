/**──────────────────────────────────────────────────────────────────────┐
│  🔄 USER SYNC PROVIDER                                                │
│  /src/providers/UserSyncProvider.tsx                                  │
│                                                                        │
│  Wraps useCurrentUserSync hook to enable real-time user data sync    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useCurrentUserSync } from '@/hooks/useCurrentUserSync';

export function UserSyncProvider() {
  useCurrentUserSync();
  return null;
}
