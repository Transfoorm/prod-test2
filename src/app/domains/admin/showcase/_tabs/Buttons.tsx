'use client';

import { Card } from '@/prebuilts/card';
import { Button } from '@/prebuilts/button';

export default function Buttons() {
  return (
    <Card.standard
      title="Buttons Sandbox"
      subtitle="Choose from these button VR's (Variant Robots)"
    >
      <div className="ft-showcase-grid-5">
        <Button.primary>Button.primary</Button.primary>
        <Button.secondary>Button.secondary</Button.secondary>
        <Button.ghost>Button.ghost</Button.ghost>
        <Button.danger>Button.danger</Button.danger>
        <Button.link>Button.link</Button.link>
        <Button.fire>Button.fire</Button.fire>
        <Button.outline>Button.outline</Button.outline>
        <Button.blue>Button.blue</Button.blue>
        <Button.green>Button.green</Button.green>
      </div>
    </Card.standard>
  );
}
