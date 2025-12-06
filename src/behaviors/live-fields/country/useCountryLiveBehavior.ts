/**──────────────────────────────────────────────────────────────────────┐
│  🔄 BEHAVIOR CAPSULE - Country Live Field                            │
│  /src/behaviors/live-fields/country/useCountryLiveBehavior.ts        │
│                                                                        │
│  Pure ceremony hook for Field.live-style save behavior.               │
│  Does NOT know how to save - accepts onSave from caller.              │
│  Handles: saveState, badge fade, error handling.                      │
└────────────────────────────────────────────────────────────────────────┘ */

import { useState, useCallback, useRef } from 'react';

type SaveState = 'idle' | 'saved' | 'error';

interface UseCountryLiveBehaviorProps {
  onSave: (country: string) => Promise<void>;
}

export function useCountryLiveBehavior({ onSave }: UseCountryLiveBehaviorProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const badgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(async (country: string) => {
    // Clear any existing badge timeout
    if (badgeTimeoutRef.current) {
      clearTimeout(badgeTimeoutRef.current);
    }

    // Optimistic: show badge immediately (speedster UX)
    setSaveState('saved');

    // Badge fades after 1s
    badgeTimeoutRef.current = setTimeout(() => {
      setSaveState('idle');
    }, 1000);

    // Fire save in background - error overrides badge if it fails
    try {
      await onSave(country);
    } catch {
      setSaveState('error');
    }
  }, [onSave]);

  return {
    saveState,
    handleChange,
  };
}
