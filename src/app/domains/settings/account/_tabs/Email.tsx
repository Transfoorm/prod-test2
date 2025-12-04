/**──────────────────────────────────────────────────────────────────────┐
│  🔱 EMAIL TAB - Account Email Management                              │
│  /src/app/domains/settings/account/_tabs/Email.tsx                    │
│                                                                        │
│  Displays primary and secondary email with verification status.       │
│  Email changes require verification - handled via Clerk.              │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useFuse } from '@/store/fuse';
import { Field, Button, Badge } from '@/prebuilts';

export default function Email() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State (source of truth)
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers (placeholder - email changes require Clerk verification flow)
  // ─────────────────────────────────────────────────────────────────────
  const handleChangePrimary = () => {
    // TODO: Open Clerk email change flow
    console.log('Change primary email - Clerk flow');
  };

  const handleAddSecondary = () => {
    // TODO: Open secondary email add flow
    console.log('Add secondary email');
  };

  const handleDeleteSecondary = () => {
    // TODO: Delete secondary email
    console.log('Delete secondary email');
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="vr-field-spacing">
      {/* Row 1: Primary Email + Secondary Email */}
      <Field.row>
        <Field.wrapper label="Primary Email">
          <div className="ft-email-display">
            <Field.display value={user?.email ?? ''} />
            <div className="ft-email-badges">
              {user?.emailVerified && (
                <Badge.status variant="success">Verified</Badge.status>
              )}
              <Badge.status variant="info">Primary</Badge.status>
            </div>
          </div>
        </Field.wrapper>

        <Field.wrapper label="Secondary Email (Optional)">
          <Field.display
            value={user?.secondaryEmail ?? undefined}
            emptyText="Not set"
          />
        </Field.wrapper>
      </Field.row>

      {/* Row 2: Action Buttons */}
      <Field.row>
        <div>
          <Button.secondary onClick={handleChangePrimary}>
            Change Primary
          </Button.secondary>
        </div>

        <div className="ft-email-actions">
          <Button.secondary onClick={handleAddSecondary}>
            + Add Secondary
          </Button.secondary>
          <Button.ghost
            onClick={handleDeleteSecondary}
            disabled={!user?.secondaryEmail}
          >
            Delete Secondary
          </Button.ghost>
        </div>
      </Field.row>
    </div>
  );
}
