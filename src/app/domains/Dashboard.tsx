/**──────────────────────────────────────────────────────────────────────┐
│  🔱 DASHBOARD - Sovereign Domain                                        │
│  /src/app/domains/Dashboard.tsx                                         │
│                                                                        │
│  VR-Sovereign: Pure declarative shell with ZERO ceremony logic.        │
│  SetupModal owns ALL behavior: visibility, animation, server actions.  │
│  FUSE 6.0: Pure client view that reads from FUSE store.                │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useFuse } from '@/store/fuse';
import SetupModal from '@/features/UserSetup/SetupModal';
import FlyingButton from '@/features/UserSetup/FlyingButton';
import { Card } from '@/prebuilts/card';
import { Grid } from '@/prebuilts/grid';
import { Button } from '@/prebuilts/button';

export default function Dashboard() {
  const user = useFuse((s) => s.user);

  useSetPageHeader(undefined, 'Coming soon');

  return (
    <Grid.verticalBig>
      {/* SetupModal - VR-Sovereign: owns ALL behavior */}
      <SetupModal />

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
