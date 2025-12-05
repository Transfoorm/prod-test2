/**──────────────────────────────────────────────────────────────────────┐
│  🔱 EMAIL TAB - Account Email Management                              │
│  /src/app/domains/settings/account/_tabs/Email.tsx                    │
│                                                                        │
│  Primary email uses Field.verify with Reveal choreography.            │
│  Email changes trigger verification flow via Server Action.           │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';
import { Field, Badge } from '@/prebuilts';

export default function Email() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State (source of truth)
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handlePrimaryEmailChange = async (newEmail: string) => {
    // TODO: Server Action to trigger Clerk email verification
    // For now, simulate the flow
    console.log('Sending verification to:', newEmail);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would:
    // 1. Call Server Action that triggers Clerk verification
    // 2. Clerk sends email to new address
    // 3. User clicks link in email
    // 4. Clerk updates primary email
    // 5. Cookie refreshes, FUSE hydrates new email

    // For demo: throw to show error state, or resolve to show success
    // throw new Error('Email verification not yet implemented');
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="vr-field-spacing">
      {/* Primary Email - Field.verify with Reveal choreography */}
      <Field.verify
        label="Primary Email"
        value={user?.email ?? ''}
        onCommit={handlePrimaryEmailChange}
        type="email"
        helper="Changes require email verification"
      />

      {/* Verification status badge */}
      {user?.emailVerified && (
        <div className="ft-email-status">
          <Badge.status variant="success">Email Verified</Badge.status>
        </div>
      )}

      {/* Secondary email section - future enhancement */}
      <Field.readonly label="Secondary Email (Optional)">
        <Field.display
          value={user?.secondaryEmail ?? undefined}
          emptyText="Not configured"
        />
      </Field.readonly>
    </div>
  );
}
