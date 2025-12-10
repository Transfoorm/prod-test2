# VRS Component System

> Variant Robot System: Each variant is a first-class citizen

---

## What is VRS?

**VRS (Variant Robot System)** is a component architecture where each component variant is a **first-class citizen** with its own identity, not a prop-driven derivative.

Traditional components:
```tsx
<Button variant="primary" size="large" />  // Props configure behavior
```

VRS components:
```tsx
<Button.primary />     // Variant IS the component
<Card.metric />        // Self-contained, prebuilt
<Input.search />       // No configuration needed
```

---

## Core Philosophy

### 1. Variants Are Components, Not Props

Each variant is a distinct, self-contained component:

```tsx
// VRS Pattern
Button.primary    // Primary button - standalone component
Button.secondary  // Secondary button - standalone component
Button.ghost      // Ghost button - standalone component

// Each is a first-class citizen with:
// - Its own styling (built-in)
// - Its own behavior (built-in)
// - Its own use case (documented)
```

### 2. Zero Configuration

Components arrive ready to use:

```tsx
// Traditional - requires configuration
<Button
  variant="primary"
  size="md"
  className="px-4 py-2"
  isLoading={loading}
>
  Submit
</Button>

// VRS - zero configuration
<Button.primary>Submit</Button.primary>
```

### 3. Self-Sufficient Styling

No external CSS required:

```tsx
// Traditional - external styling dependency
<div className="card card-metric bg-white shadow-md p-4 rounded-lg">

// VRS - styling built-in
<Card.metric>  // All styling encapsulated
```

---

## Component Namespace Pattern

### Button Variants
```tsx
Button.primary     // Main CTA, high emphasis
Button.secondary   // Alternative action
Button.ghost       // Low emphasis, icon-only capable
Button.danger      // Destructive actions
Button.success     // Confirmation actions
```

### Card Variants
```tsx
Card.metric        // Dashboard metrics display
Card.content       // General content container
Card.interactive   // Clickable/actionable cards
Card.feature       // Feature highlight cards
```

### Input Variants
```tsx
Input.text         // Standard text input
Input.search       // Search with icon
Input.password     // Password with toggle
Input.number       // Numeric input with controls
```

### Table Variants
```tsx
Table.data         // Full data table
Table.simple       // Minimal table
Table.interactive  // Sortable/filterable
```

---

## Implementation Pattern

### Defining VRS Components

```tsx
// components/Button/index.ts

import { ButtonPrimary } from './ButtonPrimary';
import { ButtonSecondary } from './ButtonSecondary';
import { ButtonGhost } from './ButtonGhost';
import { ButtonDanger } from './ButtonDanger';

export const Button = {
  primary: ButtonPrimary,
  secondary: ButtonSecondary,
  ghost: ButtonGhost,
  danger: ButtonDanger,
};
```

### Variant Implementation

```tsx
// components/Button/ButtonPrimary.tsx

import styles from './ButtonPrimary.module.css';

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function ButtonPrimary({
  children,
  onClick,
  disabled,
  type = 'button',
}: ButtonPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles.root}
    >
      {children}
    </button>
  );
}
```

### Variant Styles

```css
/* components/Button/ButtonPrimary.module.css */

.root {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-out);
}

.root:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.root:disabled {
  opacity: 0.5;
  /* NOTE: We do NOT use cursor: not-allowed - it's blocked globally in globals.css */
}
```

---

## Usage in Domain Views

```tsx
// app/domains/admin/users/page.tsx

import { Button, Card, Table } from '@/components';

export default function UsersPage() {
  const { data } = useAdminData();

  return (
    <div>
      <Card.metric>
        <h2>Total Users</h2>
        <span>{data.users.length}</span>
      </Card.metric>

      <Table.data
        data={data.users}
        onRowClick={handleRowClick}
      />

      <Button.primary onClick={handleCreate}>
        Add User
      </Button.primary>
    </div>
  );
}
```

---

## VRS Rules

### Rule 1: No className Props

VRS components don't accept external styling:

```tsx
// ❌ DON'T
<Button.primary className="mt-4 px-6">

// ✅ DO
<div className="mt-4">
  <Button.primary>
</div>
```

**Why?** External classNames break encapsulation and create styling conflicts.

### Rule 2: Behavior-Only Props

Props control behavior, not appearance:

```tsx
// ✅ Behavior props
<Button.primary
  onClick={handleClick}
  disabled={isLoading}
  type="submit"
>

// ❌ Appearance props
<Button.primary
  size="large"
  variant="outlined"
  color="blue"
>
```

### Rule 3: One Variant Per Use Case

Each variant has ONE purpose:

```tsx
Button.primary    // CTAs, primary actions
Button.secondary  // Secondary actions
Button.danger     // Delete, destructive actions

// Not: Button with 15 props to configure everything
```

### Rule 4: CSS Variables for Theming

All colors and sizes use CSS variables:

```css
.root {
  background: var(--color-primary);      /* Theme-aware */
  padding: var(--space-3);               /* Consistent spacing */
  border-radius: var(--radius-md);       /* Design system */
}
```

---

## Extending VRS

### Adding New Variants

1. Create variant component file
2. Add to namespace index
3. Create variant-specific styles
4. Document use case

```tsx
// components/Button/ButtonOutline.tsx
export function ButtonOutline({ children, onClick }) {
  return (
    <button className={styles.root} onClick={onClick}>
      {children}
    </button>
  );
}

// components/Button/index.ts
export const Button = {
  primary: ButtonPrimary,
  secondary: ButtonSecondary,
  outline: ButtonOutline,  // New variant
};
```

### Creating New Component Families

```tsx
// components/Alert/index.ts
import { AlertSuccess } from './AlertSuccess';
import { AlertError } from './AlertError';
import { AlertWarning } from './AlertWarning';
import { AlertInfo } from './AlertInfo';

export const Alert = {
  success: AlertSuccess,
  error: AlertError,
  warning: AlertWarning,
  info: AlertInfo,
};
```

---

## VRS Benefits

### 1. Reduced Cognitive Load
```tsx
// Know exactly what you're getting
<Button.danger>Delete</Button.danger>

// No need to remember prop combinations
<Button variant="filled" color="red" size="md">
```

### 2. Consistent Design
Every instance of `Button.primary` looks identical across the app.

### 3. Easy Maintenance
Change `ButtonPrimary` once, updates everywhere.

### 4. Self-Documenting
Component name tells you its purpose:
- `Card.metric` = displays a metric
- `Table.interactive` = has sorting/filtering

### 5. Type Safety
Each variant has its own TypeScript interface - no invalid prop combinations.

---

## TTT Compliance

VRS passes all 7 TTT tests:

1. **Architecture** - Static styling, no runtime computation
2. **Design** - CSS variables, theme-aware
3. **Maintainability** - Self-documenting, isolated
4. **Performance** - Zero runtime overhead
5. **Reversibility** - Delete variant, no cascade
6. **Consistency** - Same pattern everywhere
7. **Clarity** - Non-coder can understand usage

---

## Summary

**VRS** = Component variants as first-class citizens

- **Variants ARE components** (not props)
- **Zero configuration** (arrive ready)
- **Self-sufficient styling** (no external CSS)
- **Behavior-only props** (not appearance)
- **CSS variables for theming** (design system)

```tsx
// This is VRS
<Button.primary>Submit</Button.primary>
<Card.metric>Active Users: 1,234</Card.metric>
<Table.data data={users} />
```
