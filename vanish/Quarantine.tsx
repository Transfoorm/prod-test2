/**──────────────────────────────────────────────────────────────────────┐
│  ☢️ VANISH QUARANTINE - The Contaminated Zone                        │
│  /src/components/vanish/Quarantine.tsx                                │
│                                                                        │
│  ⚠️ CLERK SDK INTEGRATION - QUARANTINED CODE                          │
│  This component imports Clerk SDK and must remain isolated.           │
│  Dynamically imported by Drawer.tsx to prevent contaminating FUSE.    │
│                                                                        │
│  Contains:                                                             │
│  - Deletion form UI                                                    │
│  - Clerk API calls                                                     │
│  - Batch deletion logic                                                │
│  - Audit trail notices                                                 │
│                                                                        │
│  See /docs/CLERK-EXCEPTIONS.md for architectural justification.       │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icon, Badge } from '@/prebuilts';
import { useVanish } from '@/vanish/Drawer';

// Type for deletion target
type DeletionTarget = {
  clerkId: string;
  name: string;
  email: string;
  rank: 'admiral' | 'commodore' | 'captain' | 'crew';
  setupStatus: 'complete' | 'pending' | 'invited' | 'abandon' | 'revoked' | null | undefined | string;
};

/**
 * VANISH Quarantine Component
 *
 * ☢️ CONTAMINATED: Contains Clerk SDK integration
 * This component is dynamically imported to maintain quarantine.
 * Manages its own animation state to prevent flicker on mount.
 */
export function VanishQuarantine() {
  const { config, closeDrawer, triggerComplete } = useVanish();
  const [isVisible, setIsVisible] = useState(false);

  // Query all users to resolve target data
  const allUsers = useQuery(api.domains.admin.users.api.getAllUsers);

  /**
   * ⚠️ CLERK API INTEGRATION POINT
   *
   * This action calls Clerk's API to delete user authentication records.
   * This is the ONLY place in VANISH that directly touches Clerk.
   */
  const deleteUser = useAction(api.domains.admin.users.api.deleteAnyUserWithClerk);

  // Deletion state
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger entrance animation with requestAnimationFrame
  // Component mounts with isVisible=false, then transitions to true
  useEffect(() => {
    // Double rAF ensures browser paint happens before animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }, []);

  // Reset form state when drawer closes
  useEffect(() => {
    if (!isVisible) {
      setDeleteReason('');
      setConfirmText('');
      setIsDeleting(false);
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for exit animation before calling closeDrawer (300ms)
    setTimeout(() => {
      closeDrawer();
    }, 300);
  }, [closeDrawer]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isDeleting) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, isDeleting, handleClose]);

  const handleDeleteConfirm = async () => {
    if (confirmText !== 'DELETE') {
      alert('You must type DELETE to confirm');
      return;
    }
    if (!deleteReason.trim()) {
      alert('Deletion reason is required');
      return;
    }

    if (!targets || targets.length === 0) {
      alert('No targets specified');
      return;
    }

    setIsDeleting(true);

    if (isBatch) {
      // Batch deletion
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const target of targets) {
        try {
          const result = await deleteUser({
            targetClerkId: target.clerkId,
            reason: deleteReason
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${target.name}: ${result.message}`);
          }
        } catch (error) {
          failCount++;
          errors.push(`${target.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setIsDeleting(false);

      // Trigger completion callback
      triggerComplete({
        success: failCount === 0,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
        deletedUsers: targets.map((t: DeletionTarget) => ({ name: t.name, email: t.email }))
      });

      handleClose();
    } else {
      // Single deletion
      try {
        const result = await deleteUser({
          targetClerkId: targets[0].clerkId,
          reason: deleteReason
        });

        if (result.success) {
          const deletedUser = targets[0];

          // Trigger completion callback
          triggerComplete({
            success: true,
            successCount: 1,
            deletedUsers: [{ name: deletedUser.name, email: deletedUser.email }]
          });

          handleClose();
        } else {
          // Trigger failure callback
          triggerComplete({
            success: false,
            successCount: 0,
            failCount: 1,
            errors: [result.message]
          });
        }
      } catch (error) {
        // Trigger error callback
        triggerComplete({
          success: false,
          successCount: 0,
          failCount: 1,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
        setIsDeleting(false);
      }
    }
  };

  // Resolve targets from config
  if (!config || !allUsers) {
    return null;
  }

  // Build target array from config (supports both Convex IDs and Clerk IDs)
  const targetIds: string[] = [];
  if (config.target) {
    targetIds.push(config.target);
  }
  if (config.targets) {
    targetIds.push(...config.targets);
  }

  // Resolve user data for targets (check both _id and clerkId for compatibility)
  const targets: DeletionTarget[] = allUsers
    .filter((u) => targetIds.includes(u._id) || targetIds.includes(u.clerkId))
    .map((u) => ({
      clerkId: u.clerkId,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
      email: u.email,
      rank: (u.rank || 'crew') as 'admiral' | 'commodore' | 'captain' | 'crew',
      setupStatus: (u.setupStatus || 'unknown') as string
    }));

  if (targets.length === 0) {
    return null;
  }

  const isBatch = targets.length > 1;

  // Get portal target element
  const portalTarget = document.getElementById('vanish-drawer-portal');
  if (!portalTarget) {
    console.error('[VanishQuarantine] Portal target #vanish-drawer-portal not found');
    return null;
  }

  // Render drawer via React Portal
  return createPortal(
    <>
      {/* Backdrop - Dims FUSE organism (visible threshold) */}
      <div
        onClick={!isDeleting ? handleClose : undefined}
        className={`ft-vanish-backdrop ${isVisible ? 'ft-vanish-backdrop--visible' : 'ft-vanish-backdrop--hidden'} ${isDeleting ? 'ft-vanish-backdrop--deleting' : 'ft-vanish-backdrop--interactive'}`}
      />

      {/* The Drawer Portal - VANISH Realm */}
      <div
        className={`ft-vanish-drawer ${isVisible ? 'ft-vanish-drawer--visible' : 'ft-vanish-drawer--hidden'}`}
      >
        {/* VANISH Protocol Header - The Threshold Marker */}
        <div className="ft-vanish-header">
          <div className="ft-vanish-header-content">
            <span className="ft-vanish-header-icon">🔥</span>
            <div>
              <div className="ft-vanish-header-title">
                VANISH PROTOCOL (Clerk Quarantine)
              </div>
              <div className="ft-vanish-header-subtitle">
                You have moved out of FUSE • Deletions are Irreversible • Deleted users are recorded in the <em><b>Deleted Users</b></em> tab
              </div>
            </div>
          </div>

          {/* Close Portal Button */}
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="ft-vanish-header-close"
          >
            🔥 Exit Vanish Portal
          </button>
        </div>

        {/* Deletion Form - The Ritual */}
        <div className="ft-vanish-form">
          <h2 className="ft-vanish-form-title">
            <Icon variant="trash" size="md" />
            Delete User Account{isBatch ? 's' : ''}
          </h2>

          <div className="ft-vanish-target-card">
            <div className="ft-vanish-target-label">
              You are about to permanently delete {isBatch ? `${targets.length} users` : ''}:
            </div>

            {isBatch ? (
              // Batch: Show scrollable list
              <div className="ft-vanish-target-list">
                {targets.map((target: DeletionTarget) => (
                  <div
                    key={target.clerkId}
                    className="ft-vanish-target-item"
                  >
                    <div className="ft-vanish-target-name">
                      {target.name}
                    </div>
                    <div className="ft-vanish-target-details">
                      <span>{target.email}</span>
                      <span>•</span>
                      <Badge.rank rank={target.rank} />
                      <span>•</span>
                      <Badge.setup status={target.setupStatus as 'complete' | 'pending' | 'invited' | 'abandon' | 'revoked' | null | undefined} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single: Show detailed card
              <>
                <div className="ft-vanish-target-single-name">
                  {targets[0].name}
                </div>
                <div className="ft-vanish-target-single-email">
                  {targets[0].email}
                </div>
                <div className="ft-vanish-target-single-badges">
                  <Badge.rank rank={targets[0].rank} />
                  <Badge.setup status={targets[0].setupStatus as 'complete' | 'pending' | 'invited' | 'abandon' | 'revoked' | null | undefined} />
                </div>
              </>
            )}
          </div>

          {/* Deletion Reason */}
          <div className="ft-vanish-field">
            <label className="ft-vanish-label">
              Reason for deletion <span className="ft-vanish-label-required">*</span>
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="e.g., Account violation, User request, Data cleanup, etc."
              className="ft-vanish-textarea"
            />
          </div>

          {/* Confirmation Field */}
          <div className="ft-vanish-field">
            <label className="ft-vanish-label">
              Type <span className="ft-vanish-confirmation-code">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="ft-vanish-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="ft-vanish-actions">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="ft-vanish-button-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting || confirmText !== 'DELETE' || !deleteReason.trim()}
              className="ft-vanish-button-delete"
            >
              {isDeleting
                ? (isBatch ? `Deleting ${targets.length} Users...` : 'Deleting...')
                : (isBatch ? `Delete ${targets.length} Users Permanently` : 'Delete User Permanently')
              }
            </button>
          </div>

          {/* Audit Trail Notice */}
          <div className="ft-vanish-audit-notice">
            <div className="ft-vanish-audit-title">
              🔎 Audit Trail Notice
            </div>
            This deletion will create an audit log entry:
            <ul className="ft-vanish-audit-list">
              <li>Who deleted who (an Admiral account)</li>
              <li>When the deletion occurred (UTC timestamp)</li>
              <li>Why it happened (your stated reason)</li>
              <li>Cascade scope (all affected tables and records)</li>
            </ul>
            This action cannot be undone. The audit trail is permanent.
          </div>
        </div>
      </div>
    </>,
    portalTarget
  );
}
