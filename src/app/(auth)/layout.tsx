/**──────────────────────────────────────────────────────────────────────┐
│  🔐 AUTH LAYOUT - TTT-CERTIFIED SERVER SHELL                         │
│  /src/app/(auth)/layout.tsx                                           │
│                                                                        │
│  SERVER COMPONENT (no "use client")                                   │
│  Renders instantly via SSR - NEVER blinks, NEVER collapses.           │
│                                                                        │
│  TTT Architecture:                                                     │
│  - Logo: SSR (stable, instant)                                         │
│  - Card shell: SSR (stable, instant)                                   │
│  - Footer: SSR (stable, instant)                                       │
│  - Form content: Client (hydrates in place)                            │
│                                                                        │
│  This eliminates:                                                      │
│  - Logo disappearing on refresh                                        │
│  - Form jumping upward                                                 │
│  - Layout collapse during hydration                                    │
│  - Blink on navigation between auth pages                              │
└────────────────────────────────────────────────────────────────────────┘ */

import '@/app/(auth)/auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo - SSR, never blinks */}
        <div className="auth-logo-wrapper">
          <img
            src="/images/brand/transfoorm.png"
            alt="Transfoorm"
            className="auth-logo"
          />
        </div>

        {/* Card Shell - SSR, never collapses */}
        <div className="auth-card-wrapper">
          <div className="auth-card-glow"></div>
          <div className="auth-card auth-card-stable">
            {/* Form content hydrates here - client component */}
            {children}
          </div>
        </div>

        {/* FUSE Note - SSR, never blinks */}
        <div className="auth-note">
          <p className="auth-note-text">
            Powered by FUSE • Instant Everything!
          </p>
        </div>
      </div>
    </div>
  );
}
