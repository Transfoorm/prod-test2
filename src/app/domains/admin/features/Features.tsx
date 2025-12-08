'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { useFuse } from '@/store/fuse';
import { Card } from '@/prebuilts/card';
import { Grid } from '@/prebuilts/grid';
import { Button } from '@/prebuilts/button';

export default function Features() {
  const user = useFuse((s) => s.user);

  useSetPageHeader('Features', 'Component showcase');

  return (
    <Grid.verticalBig>
      <Grid.cards>
        <Card.metric
          title="Your Account"
          value={user?.email || ''}
          context="Logged in"
        />
        <Card.showcase title="Buttons (Primary)">
          <Grid.vertical>
            <Button.primary>Primary</Button.primary>
            <Button.secondary>Secondary</Button.secondary>
            <Button.ghost>Ghost</Button.ghost>
            <Button.danger>Danger</Button.danger>
            <Button.link>Link</Button.link>
          </Grid.vertical>
        </Card.showcase>
        <Card.showcase title="Buttons (Accent)">
          <Grid.vertical>
            <Button.fire>Fire</Button.fire>
            <Button.outline>Outline</Button.outline>
            <Button.blue>Blue</Button.blue>
            <Button.green>Green</Button.green>
          </Grid.vertical>
        </Card.showcase>
      </Grid.cards>
    </Grid.verticalBig>
  );
}
