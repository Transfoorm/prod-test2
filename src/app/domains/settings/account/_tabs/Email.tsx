/**──────────────────────────────────────────────────────────────────────┐
│  🔱 EMAIL TAB - Account Email Management                              │
│  /src/app/domains/settings/account/_tabs/Email.tsx                    │
│                                                                        │
│  Primary email uses Field.verify with Reveal choreography.            │
│  Email changes trigger VerifyModal (prebuilt handles Clerk internally)│
│                                                                        │
│  SOVEREIGNTY: No Clerk imports in domains - Golden Bridge enforced    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFuse } from '@/store/fuse';
import { Field, VerifyModal } from '@/prebuilts';
import { refreshSessionAfterUpload } from '@/app/actions/user-mutations';

export default function Email() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State (source of truth)
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);

  // ─────────────────────────────────────────────────────────────────────
  // Convex Mutations
  // ─────────────────────────────────────────────────────────────────────
  const updateUserSettings = useMutation(api.domains.settings.mutations.updateUserSettings);

  // ─────────────────────────────────────────────────────────────────────
  // Local State
  // ─────────────────────────────────────────────────────────────────────
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState<'change' | 'secondary'>('change');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [modalResolver, setModalResolver] = useState<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handlePrimaryEmailChange = async (newEmail: string) => {
    // Store the pending email and show verification modal
    // Return a Promise that resolves/rejects when modal completes
    setPendingEmail(newEmail);
    setEmailMode('change');

    return new Promise<void>((resolve, reject) => {
      setModalResolver({ resolve, reject });
      setShowVerifyModal(true);
    });
  };

  const handleSecondaryEmailChange = async (newEmail: string) => {
    // Store the pending email and show verification modal for secondary
    setPendingEmail(newEmail);
    setEmailMode('secondary');

    return new Promise<void>((resolve, reject) => {
      setModalResolver({ resolve, reject });
      setShowVerifyModal(true);
    });
  };

  const handleVerificationSuccess = async () => {
    // VerifyModal already updated Clerk, now update FUSE and Convex
    const { user: currentUser, setUser } = useFuse.getState();
    if (currentUser && pendingEmail) {
      if (emailMode === 'secondary') {
        // Secondary email - update secondaryEmail field
        setUser({ ...currentUser, secondaryEmail: pendingEmail });
        try {
          await updateUserSettings({ secondaryEmail: pendingEmail });
        } catch (err) {
          console.error('Failed to update secondary email in Convex:', err);
        }
      } else {
        // Primary email - update email field
        setUser({ ...currentUser, email: pendingEmail });
        try {
          await updateUserSettings({ email: pendingEmail });
        } catch (err) {
          console.error('Failed to update email in Convex:', err);
        }
      }

      // Refresh session cookie so changes persist across page refresh
      try {
        await refreshSessionAfterUpload();
      } catch (err) {
        console.error('Failed to refresh session cookie:', err);
      }
    }

    // Resolve the promise so Field.verify knows we succeeded
    modalResolver?.resolve();

    // Clean up
    setShowVerifyModal(false);
    setPendingEmail(null);
    setModalResolver(null);
  };

  const handleVerificationClose = () => {
    // Reject the promise so Field.verify reverts
    modalResolver?.reject(new Error('Verification cancelled'));

    // Clean up
    setShowVerifyModal(false);
    setPendingEmail(null);
    setModalResolver(null);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="vr-field-spacing">
      <div className="ft-field-row">
        {/* Primary Email - Field.verify with Reveal choreography */}
        <Field.verify
          label="Primary Email"
          value={user?.email ?? ''}
          onCommit={handlePrimaryEmailChange}
          type="email"
          helper="* Changing will require a new email verification"
        />

        {/* Secondary Email - Field.verify with same flow */}
        <Field.verify
          label="Secondary Email (Optional)"
          value={user?.secondaryEmail ?? ''}
          onCommit={handleSecondaryEmailChange}
          type="email"
          placeholder="Add a backup email"
          helper="* Secondary email will require email verification"
          helperOnFocus
        />
      </div>

      {/* Verification Modal - handles Clerk internally */}
      <VerifyModal
        isOpen={showVerifyModal}
        email={pendingEmail ?? ''}
        mode={emailMode}
        currentEmail={emailMode === 'change' ? (user?.email ?? undefined) : (user?.secondaryEmail ?? undefined)}
        onSuccess={handleVerificationSuccess}
        onClose={handleVerificationClose}
      />
    </div>
  );
}
