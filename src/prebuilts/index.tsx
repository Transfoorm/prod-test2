/**──────────────────────────────────────────────────────────────────────┐
│  🤖 PREBUILTS - Central Export                                         │
│  /src/components/prebuilts/index.tsx                                   │
│                                                                        │
│  Single import for all prebuilt components across the entire app.      │
│                                                                        │
│  Usage:                                                                │
│  import { Card, Page, Modal, Button, Form, Table, Divider, Tabs, Search, Badge, Tooltip, Fieldbox, Input, Label, Checkbox } from '@/prebuilts'; │
│                                                                        │
│  TTT God Architecture (v2):                                            │
│  - Input: Interactive form controls (Input.text, Input.select, etc.)  │
│  - Fieldbox: Layout containers (Fieldbox.display, Fieldbox.row, etc.) │
│  - Label: Text decorations (Label.basic, Label.error, etc.)           │
└────────────────────────────────────────────────────────────────────────┘ */

// Prebuilt Component Variants
export { Page } from '@/prebuilts/page';
export { Card } from '@/prebuilts/card';
export { Modal, useSideDrawer } from '@/prebuilts/modal';
export { Button } from '@/prebuilts/button';
export { Form } from '@/prebuilts/form';
export { Table } from '@/prebuilts/table';
export { Divider } from '@/prebuilts/divider';
export { Tabs } from '@/prebuilts/tabs';
export { Search } from '@/prebuilts/search';
export { Badge } from '@/prebuilts/badge';
export { Tooltip } from '@/prebuilts/tooltip';
export { Actions } from '@/prebuilts/actions';
export { Stack } from '@/prebuilts/stack';

// TTT God Architecture v2
export { Fieldbox } from '@/prebuilts/fieldbox';
export { Input } from '@/prebuilts/input';
export { Label } from '@/prebuilts/label';
export { Checkbox } from '@/prebuilts/input/checkbox';

// Shared Utilities (re-exported for convenience)
export { Icon } from '@/prebuilts/icon/iconRegistry';
