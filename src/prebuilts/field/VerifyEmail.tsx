/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Field.verifyEmail                                 │
│  /src/prebuilts/field/VerifyEmail.tsx                                 │
│                                                                        │
│  Complete email verification field with modal choreography.            │
│  Encapsulates Field.verify + VerifyModal + FUSE sync.                 │
│                                                                        │
│  This is a COMPLETE behavioral unit:                                  │
│  - Renders Field.verify for editing                                   │
│  - Opens VerifyModal on commit                                        │
│  - Syncs FUSE → Convex → Cookie on success                           │
│  - Reverts on cancel                                                  │
│                                                                        │
│  SOVEREIGNTY: Lives in /prebuilts/ - uses VerifyModal from /features/│
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFuse } from '@/store/fuse';
import FieldVerify from './Verify';
import VerifyModal from '@/features/VerifyModal';
import { refreshSessionAfterUpload } from '@/app/actions/user-mutations';

export interface FieldVerifyEmailProps {
  /** Field label */
  label: string;
  /** FUSE field to sync: 'email' or 'secondaryEmail' */
  field: 'email' | 'secondaryEmail';
  /** Placeholder when empty */
  placeholder?: string;
  /** Helper text */
  helper?: string;
}

export default function FieldVerifyEmail({
  label,
  field,
  placeholder = '',
  helper,
}: FieldVerifyEmailProps) {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State (source of truth)
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const value = field === 'email' ? user?.email : user?.secondaryEmail;

  // ─────────────────────────────────────────────────────────────────────
  // Convex Mutations
  // ─────────────────────────────────────────────────────────────────────
  const updateUserSettings = useMutation(api.domains.settings.mutations.updateUserSettings);

  // ─────────────────────────────────────────────────────────────────────
  // Modal State (encapsulated)
  // ─────────────────────────────────────────────────────────────────────
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [modalResolver, setModalResolver] = useState<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handleCommit = useCallback(async (newEmail: string) => {
    // Store the pending email and show verification modal
    // Return a Promise that resolves/rejects when modal completes
    setPendingEmail(newEmail);

    return new Promise<void>((resolve, reject) => {
      setModalResolver({ resolve, reject });
      setShowVerifyModal(true);
    });
  }, []);

  const handleVerificationSuccess = useCallback(async () => {
    // VerifyModal already updated Clerk, now update FUSE and Convex
    const { user: currentUser, setUser } = useFuse.getState();
    if (currentUser && pendingEmail) {
      if (field === 'secondaryEmail') {
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
  }, [field, modalResolver, pendingEmail, updateUserSettings]);

  const handleVerificationClose = useCallback(() => {
    // Reject the promise so Field.verify reverts
    modalResolver?.reject(new Error('Verification cancelled'));

    // Clean up
    setShowVerifyModal(false);
    setPendingEmail(null);
    setModalResolver(null);
  }, [modalResolver]);

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  const mode = field === 'email' ? 'change' : 'secondary';
  const currentEmail = field === 'email' ? user?.email : user?.secondaryEmail;

  return (
    <>
      <FieldVerify
        label={label}
        value={value ?? ''}
        onCommit={handleCommit}
        type="email"
        placeholder={placeholder}
        helper={helper}
      />

      {/* Verification Modal - handles Clerk internally */}
      <VerifyModal
        isOpen={showVerifyModal}
        email={pendingEmail ?? ''}
        mode={mode}
        currentEmail={currentEmail ?? undefined}
        onSuccess={handleVerificationSuccess}
        onClose={handleVerificationClose}
      />
    </>
  );
}
