// app/(auth)/sign-out/page.tsx
'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useFuse } from '@/store/fuse';
import { Button } from '@/prebuilts/button';

export default function SignOutPage() {

  const { signOut } = useClerk();
  const clearUser = useFuse((s) => s.clearUser);
  const setAISidebarState = useFuse((s) => s.setAISidebarState);

  useEffect(() => {
    async function run() {
      // FUSE 4.0: Delete session cookie
      await fetch('/api/session', { method: 'DELETE' });

      // Sign out from Clerk and redirect to root (which redirects to landing)
      // Note: SignOutGuard will handle clearing user data when Clerk fires the sign-out event
      await signOut({ redirectUrl: '/' });

      // Fallback: Clear data after redirect (in case SignOutGuard doesn't fire)
      clearUser();
      setAISidebarState('closed');
    }
    run();
  }, [signOut, clearUser, setAISidebarState]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-centered-content">
          <Button.fire
                disabled
                icon={<span className="auth-spinner" />}
                iconPosition="left"
                fullWidth
              >
                Signing out...
              </Button.fire>
        </div>
      </div>
    </div>
  );
}
