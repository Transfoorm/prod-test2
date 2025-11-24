/**──────────────────────────────────────────────────────────────────────┐
│  🤖 FIELDBOX VR - Export Hub                                           │
│  /src/prebuilts/fieldbox/index.ts                                      │
│                                                                        │
│  Layout containers for displaying and organizing data.                │
│                                                                        │
│  TTT God Architecture:                                                 │
│  - Fieldbox.display: Read-only data display box                       │
│  - Fieldbox.row: Horizontal layout container                          │
│  - Fieldbox.wrapper: Complete field with label and messages           │
│                                                                        │
│  CSS Utilities (from fieldbox-row.css):                               │
│  - .vr-fieldbox-spacings: Vertical spacing for multiple rows          │
└────────────────────────────────────────────────────────────────────────┘ */

import DisplayFieldbox from './Display';
import RowFieldbox from './Row';
import WrapperFieldbox from './Wrapper';

export const Fieldbox = {
  display: DisplayFieldbox,
  row: RowFieldbox,
  wrapper: WrapperFieldbox,
};

export default Fieldbox;
