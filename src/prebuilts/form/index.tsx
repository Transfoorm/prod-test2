/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Form Component Registry                            │
│  /src/components/prebuilts/form/index.tsx                              │
│                                                                        │
│  Central dispatcher for all form variants.                             │
│  Each variant is a first-class, autonomous component.                  │
│                                                                        │
│  Usage:                                                                │
│  import { Form } from '@/prebuilts/form';                  │
│                                                                        │
│  <Form.standard onSubmit={...}>{fields}</Form.standard>               │
│  <Form.inline onSubmit={...}>{fields}</Form.inline>                   │
│  <Form.stacked onSubmit={...}>{fields}</Form.stacked>                 │
└────────────────────────────────────────────────────────────────────────┘ */


import StandardForm from './Standard';
import InlineForm from './Inline';
import StackedForm from './Stacked';

/**
 * Form Registry - All form variants as named exports
 *
 * Architecture benefits:
 * ✅ Each variant evolves independently
 * ✅ No conditional rendering mess
 * ✅ Tree-shakeable - unused forms aren't bundled
 * ✅ Testable in isolation
 * ✅ Self-documenting structure
 * ✅ AI/CLI friendly: "Give me a standard form" → Form.standard
 */
export const Form = {
  standard: StandardForm,
  inline: InlineForm,
  stacked: StackedForm,
} as const;

// Export individual components for direct import if needed
export {
  StandardForm,
  InlineForm,
  StackedForm
};

// Type exports for TypeScript users
export type { StandardFormProps } from './Standard';
export type { InlineFormProps } from './Inline';
export type { StackedFormProps } from './Stacked';

// Helper type for variant names
export type FormVariant = keyof typeof Form;
