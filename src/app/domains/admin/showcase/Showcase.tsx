'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';
import { Tabs } from '@/prebuilts/tabs';
import Buttons from './_tabs/Buttons';
import Cards from './_tabs/Cards';
import Fields from './_tabs/Fields';
import Radios from './_tabs/Radios';
import Guide from './_tabs/Guide';
import Tab6 from './_tabs/Tab6';
import Tab7 from './_tabs/Tab7';
import Tab8 from './_tabs/Tab8';
import Tab9 from './_tabs/Tab9';
import Tab10 from './_tabs/Tab10';

export default function Showcase() {
  useSetPageHeader('Showcase', 'Variant Robots (VR) - Discover the sites prebuilts component registry');

  return (
    <Tabs.panels
      tabs={[
        { id: 'guide', label: 'VR Guide', content: <Guide /> },
        { id: 'buttons', label: 'Buttons', content: <Buttons /> },
        { id: 'cards', label: 'Cards', content: <Cards /> },
        { id: 'fields', label: 'Fields', content: <Fields /> },
        { id: 'radios', label: 'Radios', content: <Radios /> },
        { id: 'tab6', label: 'Tab 6', content: <Tab6 /> },
        { id: 'tab7', label: 'Tab 7', content: <Tab7 /> },
        { id: 'tab8', label: 'Tab 8', content: <Tab8 /> },
        { id: 'tab9', label: 'Tab 9', content: <Tab9 /> },
        { id: 'tab10', label: 'Tab 10', content: <Tab10 /> },
      ]}
    />
  );
}
