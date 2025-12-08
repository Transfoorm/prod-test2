/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - EmailActions                                      │
│  /src/prebuilts/field/EmailActions.tsx                                │
│                                                                        │
│  Action pills for secondary email management:                         │
│  - Make Primary: Swap secondary → primary (inline confirmation)       │
│  - Remove: Delete secondary email (inline confirmation)               │
│                                                                        │
│  Encapsulates all state + server actions + FUSE sync internally.      │
│  Only renders when secondaryEmail exists.                             │
│                                                                        │
│  SOVEREIGNTY: Uses Server Actions for Clerk operations.               │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFuse } from '@/store/fuse';
import { swapEmailsToPrimary, deleteSecondaryEmail } from '@/app/actions/email-actions';
import { refreshSessionAfterUpload } from '@/app/actions/user-mutations';

type ActionState = 'idle' | 'confirming' | 'executing';

export default function EmailActions() {
  // ─────────────────────────────────────────────────────────────────────
  // FUSE State (source of truth)
  // ─────────────────────────────────────────────────────────────────────
  const user = useFuse((s) => s.user);
  const secondaryEmail = user?.secondaryEmail;

  // ─────────────────────────────────────────────────────────────────────
  // Convex Mutations
  // ─────────────────────────────────────────────────────────────────────
  const updateUserSettings = useMutation(api.domains.settings.mutations.updateUserSettings);

  // ─────────────────────────────────────────────────────────────────────
  // Local State (encapsulated)
  // ─────────────────────────────────────────────────────────────────────
  const [swapState, setSwapState] = useState<ActionState>('idle');
  const [removeState, setRemoveState] = useState<ActionState>('idle');

  // ─────────────────────────────────────────────────────────────────────
  // Handlers: Make Primary
  // ─────────────────────────────────────────────────────────────────────

  const handleSwapClick = useCallback(async () => {
    if (swapState === 'executing' || removeState !== 'idle') return;

    if (swapState === 'idle') {
      setSwapState('confirming');
      return;
    }

    // Execute swap
    setSwapState('executing');
    try {
      const result = await swapEmailsToPrimary(secondaryEmail!);
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
          email: secondaryEmail!,
          secondaryEmail: oldPrimary,
        });
      }

      // Update Convex
      await updateUserSettings({
        email: secondaryEmail ?? undefined,
        secondaryEmail: user?.email ?? undefined,
      });

      // Refresh session cookie
      await refreshSessionAfterUpload();
    } catch (err) {
      console.error('Failed to swap emails:', err);
    } finally {
      setSwapState('idle');
    }
  }, [removeState, secondaryEmail, swapState, updateUserSettings, user?.email]);

  const handleSwapBlur = useCallback(() => {
    if (swapState === 'confirming') {
      setTimeout(() => setSwapState('idle'), 150);
    }
  }, [swapState]);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers: Remove
  // ─────────────────────────────────────────────────────────────────────

  const handleRemoveClick = useCallback(async () => {
    if (removeState === 'executing' || swapState !== 'idle') return;

    if (removeState === 'idle') {
      setRemoveState('confirming');
      return;
    }

    // Execute remove
    setRemoveState('executing');
    try {
      const result = await deleteSecondaryEmail(secondaryEmail!);
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
      setRemoveState('idle');
    }
  }, [removeState, secondaryEmail, swapState, updateUserSettings]);

  const handleRemoveBlur = useCallback(() => {
    if (removeState === 'confirming') {
      setTimeout(() => setRemoveState('idle'), 150);
    }
  }, [removeState]);

  // ─────────────────────────────────────────────────────────────────────
  // Render - only when secondary email exists
  // ─────────────────────────────────────────────────────────────────────

  if (!secondaryEmail) return null;

  const swapClasses = [
    'ft-field-action-pill',
    swapState === 'executing' && 'ft-field-action-pill--active',
    swapState === 'confirming' && 'ft-field-action-pill--confirm',
  ].filter(Boolean).join(' ');

  const removeClasses = [
    'ft-field-action-pill',
    removeState === 'executing' && 'ft-field-action-pill--active',
    removeState === 'confirming' && 'ft-field-action-pill--confirm',
  ].filter(Boolean).join(' ');

  return (
    <div className="ft-field-action-pills">
      <button
        type="button"
        onClick={handleSwapClick}
        onBlur={handleSwapBlur}
        disabled={swapState === 'executing' || removeState !== 'idle'}
        className={swapClasses}
      >
        {swapState === 'executing' ? (
          <span className="ft-field-action-pill__typing">Swapping...</span>
        ) : swapState === 'confirming' ? 'Confirm →' : 'Make Primary'}
      </button>
      <button
        type="button"
        onClick={handleRemoveClick}
        onBlur={handleRemoveBlur}
        disabled={removeState === 'executing' || swapState !== 'idle'}
        className={removeClasses}
      >
        {removeState === 'executing' ? (
          <span className="ft-field-action-pill__typing">Removing...</span>
        ) : removeState === 'confirming' ? 'Confirm →' : 'Remove'}
      </button>
    </div>
  );
}
