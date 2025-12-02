'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { Card } from '@/prebuilts/card';
import { Grid } from '@/prebuilts/grid';

export default function Account() {
  useSetPageHeader('Account', 'Manage your profile and preferences');

  return (
    <Grid.verticalBig>
      <Grid.cards>
        <Card.metric
          title="Login Sessions"
          value={3}
          trend={0}
          trendDirection="flat"
          context="active devices"
        />
        <Card.metric
          title="Storage Used"
          value="2.4 GB"
          trend={12}
          trendDirection="up"
          context="of 10 GB"
        />
        <Card.metric
          title="API Calls"
          value="8,240"
          trend={340}
          trendDirection="up"
          context="this month"
        />
      </Grid.cards>
    </Grid.verticalBig>
  );
}
