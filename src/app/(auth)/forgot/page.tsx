/**──────────────────────────────────────────────────────────────────────┐
│  🔐 FORGOT PASSWORD PAGE - Pure Declaration                           │
│  /src/app/(auth)/forgot/page.tsx                                       │
│                                                                        │
│  VR DOCTRINE: Page Layer                                               │
│  - ONE LINE import                                                     │
│  - ZERO state                                                          │
│  - ZERO callbacks                                                      │
│  - ZERO Clerk                                                          │
│  - Pure declaration                                                    │
│                                                                        │
│  All the dirty Clerk work lives in the Feature.                        │
│  Shell (logo, card, footer) is SSR via layout.tsx.                     │
└────────────────────────────────────────────────────────────────────────┘ */

import { ForgotPassword } from '@/features/auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
