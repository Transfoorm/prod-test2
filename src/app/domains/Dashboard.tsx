/**──────────────────────────────────────────────────────────────────────┐
│  🔱 DASHBOARD - Sovereign Domain                                        │
│  /src/app/domains/Dashboard.tsx                                         │
│                                                                        │
│  VR-Sovereign: Pure declarative shell with ZERO ceremony logic.        │
│  SetupModal owns all visibility, animation, and skip behavior.         │
│  FUSE 6.0: Pure client view that reads from FUSE store.                │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useFuse } from '@/store/fuse';
import SetupModal from '@/features/UserSetup/SetupModal';
import FlyingButton from '@/features/UserSetup/FlyingButton';
import { completeSetupAction } from '@/app/actions/user-mutations';
import { Card } from '@/prebuilts/card';
import { Grid } from '@/prebuilts/grid';
import { Button } from '@/prebuilts/button';

export default function Dashboard() {
  const user = useFuse((s) => s.user);
  const updateUser = useFuse((s) => s.updateUser);

  useSetPageHeader(undefined, 'Coming soon');

  // ─────────────────────────────────────────────────────────────────────
  // Setup Complete Handler (server action + FUSE update)
  // ─────────────────────────────────────────────────────────────────────
  const handleSetupComplete = async (data: {
    firstName: string;
    lastName: string;
    entityName: string;
    socialName: string;
    orgSlug: string;
    businessCountry: string;
  }) => {
    try {
      // Update FUSE store optimistically
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        businessCountry: data.businessCountry,
        setupStatus: 'complete',
        emailVerified: true,
      });

      // Call server action to persist to database and update session cookie
      const result = await completeSetupAction({
        firstName: data.firstName,
        lastName: data.lastName,
        entityName: data.entityName,
        socialName: data.socialName,
        orgSlug: data.orgSlug,
        businessCountry: data.businessCountry,
        emailVerified: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      // Update store with fresh data from server (DB → Cookie → Store → UI)
      if (result.user) {
        updateUser({
          emailVerified: result.user.emailVerified,
          setupStatus: result.user.setupStatus as 'pending' | 'complete',
          firstName: result.user.firstName || undefined,
          lastName: result.user.lastName || undefined,
          entityName: result.user.entityName || undefined,
          socialName: result.user.socialName || undefined,
          businessCountry: result.user.businessCountry || undefined,
        });
      }

      console.log('✅ Setup completed successfully');
    } catch (error) {
      console.error('Setup failed:', error);
      // Revert optimistic update
      updateUser({ setupStatus: 'pending' });
      throw error; // Re-throw to let modal handle error display
    }
  };

  return (
    <Grid.verticalBig>
      {/* SetupModal - VR owns all visibility/animation/skip behavior */}
      <SetupModal onComplete={handleSetupComplete} />

      {/* FlyingButton - VR owns Phoenix animation */}
      <FlyingButton />

      {/* Dashboard content */}
      <Grid.cards>
        <Card.metric
          title="Your Account"
          value={user?.email || ''}
          context="Logged in"
        />
        <Card.metric
          title="Build Milestone"
          value="3 Dec 2025 @ 2:38pm"
          context="🔒 LOCKDOWN TEST · Brisbane UTC+10"
        />
        <Card.showcase title="Button Showcase">
          <Grid.vertical>
            <Button.primary>Primary</Button.primary>
            <Button.secondary>Secondary</Button.secondary>
            <Button.ghost>Ghost</Button.ghost>
            <Button.danger>Danger</Button.danger>
            <Button.link>Link</Button.link>
            <Button.fire>Fire</Button.fire>
            <Button.outline>Outline</Button.outline>
            <Button.blue>Blue</Button.blue>
            <Button.green>Green</Button.green>
          </Grid.vertical>
        </Card.showcase>
        <Card.inputShowcase />
      </Grid.cards>
    </Grid.verticalBig>
  );
}
