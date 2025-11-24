/**──────────────────────────────────────────────────────────────────────┐
│  🔐 AUTH LAYOUT - Authentication Experience Region                    │
│  /src/app/(auth)/layout.tsx                                           │
│                                                                        │
│  Wraps all authentication routes with shared styling.                  │
│  Uses auth.css for domain-specific visual language.                    │
│                                                                        │
│  Architecture:                                                         │
│  - Composes: Controlmaster + VRS + auth.css                           │
│  - Co-located with auth routes                                         │
│  - Refactor-proof: No FUSE core dependencies                           │
└────────────────────────────────────────────────────────────────────────┘ */

import '@/app/(auth)/auth.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
