/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Backdrop                                          │
│  /src/prebuilts/backdrop/index.tsx                                    │
│                                                                        │
│  Unified dim layer for attention-capture overlays.                    │
│  Used by: Drawer, SetupModal, VerifyModal, any modal/overlay.         │
│                                                                        │
│  ONE backdrop. ONE opacity. ONE blur. Site-wide consistency.          │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import './backdrop.css';

interface BackdropProps {
  /** Called when backdrop is clicked (usually to close modal) */
  onClick?: () => void;
  /** Whether backdrop is visible */
  visible?: boolean;
}

export default function Backdrop({ onClick, visible = true }: BackdropProps) {
  if (!visible) return null;

  return (
    <div
      className="vr-backdrop"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
