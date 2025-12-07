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
import { swapEmailsToPrimary, deleteSecondaryEmail } from '@/app/actions/email-actions';

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
  const [isSwapping, setIsSwapping] = useState(false);
  const [confirmingSwap, setConfirmingSwap] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

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

  const handleMakePrimaryClick = () => {
    if (isSwapping) return;

    if (!confirmingSwap) {
      // First click - enter confirmation mode
      setConfirmingSwap(true);
      return;
    }

    // Second click - execute swap
    executeSwap();
  };

  const executeSwap = async () => {
    const secondaryEmail = user?.secondaryEmail;
    if (!secondaryEmail) return;

    setIsSwapping(true);
    setConfirmingSwap(false);

    try {
      // Swap in Clerk
      const result = await swapEmailsToPrimary(secondaryEmail);
      if (result.error) {
        console.error('Swap error:', result.error);
        return;
      }

      // Swap in FUSE store
      const { user: currentUser, setUser } = useFuse.getState();
      if (currentUser) {
        const oldPrimary = currentUser.email;
        setUser({
          ...currentUser,
          email: secondaryEmail,
          secondaryEmail: oldPrimary,
        });
      }

      // Update Convex
      await updateUserSettings({
        email: secondaryEmail,
        secondaryEmail: user?.email,
      });

      // Refresh session cookie
      await refreshSessionAfterUpload();
    } catch (err) {
      console.error('Failed to swap emails:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapBlur = () => {
    // Cancel confirmation if user clicks away
    setTimeout(() => setConfirmingSwap(false), 150);
  };

  const handleRemoveClick = () => {
    if (isRemoving) return;

    if (!confirmingRemove) {
      // First click - enter confirmation mode
      setConfirmingRemove(true);
      return;
    }

    // Second click - execute remove
    executeRemove();
  };

  const executeRemove = async () => {
    const secondaryEmail = user?.secondaryEmail;
    if (!secondaryEmail) return;

    setIsRemoving(true);
    setConfirmingRemove(false);

    try {
      // Delete from Clerk
      const result = await deleteSecondaryEmail(secondaryEmail);
      if (result.error) {
        console.error('Remove error:', result.error);
        return;
      }

      // Clear in FUSE store
      const { user: currentUser, setUser } = useFuse.getState();
      if (currentUser) {
        setUser({
          ...currentUser,
          secondaryEmail: null,
        });
      }

      // Update Convex
      await updateUserSettings({
        secondaryEmail: null,
      });

      // Refresh session cookie
      await refreshSessionAfterUpload();
    } catch (err) {
      console.error('Failed to remove email:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveBlur = () => {
    // Cancel confirmation if user clicks away
    setTimeout(() => setConfirmingRemove(false), 150);
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
          helper="* Email updates will require verification"
        />

        {/* Secondary Email - Field.verify with same flow */}
        <div className="ft-field-with-action">
          <Field.verify
            label="Secondary Email (Optional)"
            value={user?.secondaryEmail ?? ''}
            onCommit={handleSecondaryEmailChange}
            type="email"
            placeholder="Add a backup email"
          />
          {/* Action pills - only show when secondary email exists */}
          {user?.secondaryEmail && (
            <div className="ft-field-action-pills">
              <button
                type="button"
                onClick={handleMakePrimaryClick}
                onBlur={handleSwapBlur}
                disabled={isSwapping || isRemoving || confirmingRemove}
                className={`ft-field-action-pill ${isSwapping ? 'ft-field-action-pill--active' : ''} ${confirmingSwap ? 'ft-field-action-pill--confirm' : ''}`}
              >
                {isSwapping ? (
                  <span className="ft-field-action-pill__typing">Swapping...</span>
                ) : confirmingSwap ? 'Confirm' : 'Make Primary'}
              </button>
              <button
                type="button"
                onClick={handleRemoveClick}
                onBlur={handleRemoveBlur}
                disabled={isSwapping || isRemoving || confirmingSwap}
                className={`ft-field-action-pill ${isRemoving ? 'ft-field-action-pill--active' : ''} ${confirmingRemove ? 'ft-field-action-pill--confirm' : ''}`}
              >
                {isRemoving ? (
                  <span className="ft-field-action-pill__typing">Removing...</span>
                ) : confirmingRemove ? 'Confirm' : 'Remove'}
              </button>
            </div>
          )}
        </div>
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
