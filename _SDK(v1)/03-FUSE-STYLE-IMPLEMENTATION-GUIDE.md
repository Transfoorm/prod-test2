# 🎯 FUSE-STYLE IMPLEMENTATION GUIDE
## Tactical Rules for CSS Architecture

---

## ABOUT THIS DOCUMENT

This is the **tactical companion** to `02-FUSE-STYLE-ARCHITECTURE.md`.

**That document explains WHY.** This document explains **HOW** and **WHERE**.

If you're asking:
- "Where does this CSS class go?"
- "What should I name this variable?"
- "Is this inline style allowed?"
- "Should this be a FUSE class or component class?"

**You're in the right place.**

---

## TABLE OF CONTENTS

1. [The Complete Taxonomy](#the-complete-taxonomy)
2. [Naming Conventions](#naming-conventions)
3. [File Location Requirements](#file-location-requirements)
4. [ISV Exception Policy](#isv-exception-policy)
5. [Component CSS Architecture](#component-css-architecture)
6. [Decision Trees](#decision-trees)
7. [Code Review Checklist](#code-review-checklist)
8. [Real-World Examples](#real-world-examples)
9. [Quick Reference Tables](#quick-reference-tables)
10. [Common Mistakes](#common-mistakes)

---

## THE COMPLETE TAXONOMY

FUSE-STYLE has **seven distinct layers**. Each layer has specific naming conventions, file locations, and purposes.

### The Seven-Layer Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  LAYER 1: DESIGN TOKENS (Foundation)                           │
│  Prefix: NONE (just --name)                                    │
│  Location: /fuse/style/tokens.css                              │
│  Purpose: Universal math - spacing, fonts, radius, shadows     │
│  Examples: --space-lg, --font-size-md, --radius-xl             │
│  Mutability: FROZEN (never changes)                            │
├────────────────────────────────────────────────────────────────┤
│  LAYER 2: LAYOUT CONTROL (Dashboard)                           │
│  Prefix: NONE (just --name)                                    │
│  Location: /fuse/style/overview.css                            │
│  Purpose: App-specific dimensions and layout tuning            │
│  Examples: --sidebar-width, --topbar-height, --content-padding │
│  Mutability: FREQUENT (tuned during development)               │
├────────────────────────────────────────────────────────────────┤
│  LAYER 3: THEME VARIABLES (Swappable Colors)                   │
│  Prefix: NONE (just --name)                                    │
│  Location: /fuse/style/themes/[theme].css                      │
│  Purpose: Semantic colors that change per theme                │
│  Examples: --bg-primary, --text-secondary, --brand-primary     │
│  Mutability: SWAPPABLE (entire file replaced per theme)        │
├────────────────────────────────────────────────────────────────┤
│  LAYER 4: COMPONENT INFRASTRUCTURE (Shared Component Vars)     │
│  Prefix: --component-[property]                                │
│  Location: /fuse/style/prebuilts.css                           │
│  Purpose: Shared variables for VR prebuilt components          │
│  Examples: --button-padding-y, --modal-max-width, --card-radius│
│  Mutability: OCCASIONAL (added when creating new prebuilts)    │
├────────────────────────────────────────────────────────────────┤
│  LAYER 5: FUSE UTILITY CLASSES (Site-wide Utilities)           │
│  Prefix: .fuse-                                                │
│  Location: /fuse/style/classes.css                             │
│  Purpose: Site-wide reusable utility classes                   │
│  Examples: .fuse-text-primary, .fuse-flex-center               │
│  Mutability: GROWS (new utilities added as needed)             │
├────────────────────────────────────────────────────────────────┤
│  LAYER 6: VR PREBUILT SYSTEM (Component Classes)               │
│  Class Prefix: .vr-                                            │
│  Location: /src/components/prebuilts/[name]/[variant].css      │
│  Purpose: Reusable component classes (buttons, cards, modals)  │
│  Examples: .vr-button, .vr-button--primary, .vr-card           │
│  Mutability: GROWS (new components added as needed)            │
├────────────────────────────────────────────────────────────────┤
│  LAYER 7: COMPONENT-SPECIFIC (Feature Styles)                  │
│  Prefix: .component-name-                                      │
│  Location: /src/components/[feature]/[name].css                │
│  Purpose: Feature-specific styles NOT reusable elsewhere       │
│  Examples: .vanish-drawer, .userbutton-menu, .country-selector │
│  Mutability: GROWS (created per-feature as needed)             │
└────────────────────────────────────────────────────────────────┘
```

### Layer Flow (Dependencies)

```
Layer 1: tokens.css (FOUNDATION)
         ↓ consumed by
Layer 2: overview.css (uses --space-*, --font-size-* from Layer 1)
         ↓ consumed by
Layer 3: themes/[theme].css (uses --radius-*, --shadow-* from Layer 1)
         ↓ consumed by
Layer 4: prebuilts.css (uses theme vars + tokens)
         ↓ consumed by
Layer 5: classes.css (uses theme vars + tokens)
         ↓ composed in
Layer 6: prebuilts/[name]/ (uses --component-* from Layer 4)
         ↓ composed in
Layer 7: components/[feature]/ (uses everything above)
```

### Layer 1: Theme Variables

**Naming Pattern**: `--[purpose]` (no prefix)

```css
/* /fuse/style/themes/transtheme.css */

[data-theme="transtheme"][data-theme-mode="light"] {
  /* Backgrounds */
  --body-bg: #ffffff;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;

  /* Text */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-disabled: #d1d5db;

  /* Borders */
  --border-light: #e5e7eb;
  --border-medium: #d1d5db;
  --border-heavy: #9ca3af;

  /* Brand */
  --brand-primary: #ff5020;
  --brand-hover: #ff6a3d;
  --brand-light: #ffece7;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

**Usage**: Referenced by everything else via `var(--bg-primary)`

**When to create**: When a color or contextual value changes between themes

**When NOT to create**: Static values like spacing, sizing that don't change per theme

---

### Layer 2: FUSE Utility Classes

**Naming Pattern**: `.fuse-[purpose]`

```css
/* /fuse/style/classes.css */

/* Text Colors */
.fuse-text-primary {
  color: var(--text-primary);
}

.fuse-text-secondary {
  color: var(--text-secondary);
}

/* Layout Utilities */
.fuse-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.fuse-flex-center-gap {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
}

/* Section Patterns */
.fuse-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

/* Table Actions */
.fuse-table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  color: var(--text-secondary);
}

.fuse-action-icon {
  cursor: pointer;
  color: var(--text-secondary);
}

.fuse-action-icon:hover {
  color: var(--text-primary);
}
```

**Usage**: Anywhere in the app where you need common utilities

**When to create**: When a pattern is used in 3+ places across different features

**When NOT to create**: Feature-specific styles used in one place only

**Think**: FUSE classes are like Tailwind utilities, but semantic and theme-aware

---

### Layer 3: VR Prebuilt System

**Naming Pattern**: `.vr-[component-type]` for classes, `--component-[property]` for variables

```css
/* /fuse/style/prebuilts.css - VARIABLES ONLY */
:root {
  /* Button Infrastructure */
  --button-padding-y: var(--space-sm);
  --button-padding-x: var(--space-lg);
  --button-radius: var(--radius-md);
  --button-font-size: var(--font-size-md);
  --button-font-weight: var(--font-weight-medium);
  --button-min-width: 100px;

  /* Card Infrastructure */
  --card-padding: var(--space-lg);
  --card-radius: var(--radius-lg);
  --card-shadow: var(--shadow-sm);
  --card-border-width: 1px;

  /* Modal Infrastructure */
  --modal-max-width: 480px;
  --modal-radius: var(--radius-xl);
  --modal-padding: var(--space-xl);
  --modal-backdrop-blur: 6px;
}

/* Base classes that use the variables */
.vr-button {
  padding: var(--button-padding-y) var(--button-padding-x);
  border-radius: var(--button-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  min-width: var(--button-min-width);
}

.vr-card {
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: var(--card-border-width) solid var(--border-light);
  background-color: var(--bg-secondary);
}

.vr-modal {
  max-width: var(--modal-max-width);
  border-radius: var(--modal-radius);
  padding: var(--modal-padding);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-xl);
}
```

**Usage**: By prebuilt components (Button.primary, Card.standard, Modal.alert)

**When to create**: When building reusable VR Prebuilt components

**When NOT to create**: For one-off feature components

---

### Layer 4: Component-Specific Classes

**Naming Pattern**: `.component-name-[element]`

```css
/* /vanish/vanish.css */

.vanish-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  transition: opacity 300ms ease-out;
}

.vanish-backdrop--visible {
  opacity: 1;
}

.vanish-backdrop--hidden {
  opacity: 0;
  pointer-events: none;
}

.vanish-drawer {
  background-color: #18181b;
  border-left: 2px solid #ef4444;
  box-shadow: -8px 0 24px rgba(239, 68, 68, 0.3);
  display: flex;
  flex-direction: column;
}

.vanish-header {
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.3);
}

.vanish-header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #ffffff;
}
```

**Usage**: Only within that specific feature component

**When to create**: For feature-specific styles not reused elsewhere

**When NOT to create**: If the pattern could be useful in other features (make it a FUSE class)

**Component-specific CSS files:**
- Contain ONLY classes (no `:root` variable declarations)
- Reference theme variables via `var(--name)`
- Use BEM-style naming: `.component-element--modifier`

---

## NAMING CONVENTIONS

### The Universal Rules

1. **Theme variables**: NO prefix, descriptive purpose
   - ✅ `--bg-primary`, `--text-secondary`, `--brand-primary`
   - ❌ `--fuse-bg-primary` (don't use `.fuse-` prefix for variables)
   - ❌ `--blue-500` (don't use color names)

2. **FUSE utility classes**: `.fuse-` prefix, purpose-based
   - ✅ `.fuse-text-primary`, `.fuse-flex-center`
   - ❌ `.text-primary` (missing prefix)
   - ❌ `.fuse-blue-text` (color-based, not purpose-based)

3. **VR Prebuilt classes**: `.vr-` prefix, component type
   - ✅ `.vr-button`, `.vr-card`, `.vr-modal`
   - ❌ `.button` (missing prefix)
   - ❌ `.prebuilt-button` (wrong prefix)

4. **VR Prebuilt variables**: `--component-` prefix, property name
   - ✅ `--button-padding-y`, `--modal-max-width`, `--card-radius`
   - ❌ `--vr-button-padding` (don't use `.vr-` prefix for variables)
   - ❌ `--padding-button` (property comes last, not first)

5. **Component-specific classes**: `.component-name-` prefix, element name
   - ✅ `.vanish-drawer`, `.userbutton-menu`, `.country-selector`
   - ❌ `.drawer-vanish` (component name comes first)
   - ❌ `.VanishDrawer` (use kebab-case, not PascalCase)

### Naming Pattern Examples

#### ✅ CORRECT Theme Variables
```css
--bg-primary          /* Primary background color */
--text-secondary      /* Secondary text color */
--brand-primary       /* Primary brand color */
--border-light        /* Light border color */
--shadow-md           /* Medium shadow */
--radius-lg           /* Large border radius */
--space-xl            /* Extra large spacing */
```

#### ❌ INCORRECT Theme Variables
```css
--fuse-bg-primary     /* Don't use .fuse- prefix */
--blue-500            /* Don't use color names */
--backgroundColor     /* Use kebab-case, not camelCase */
--primary             /* Too ambiguous */
```

#### ✅ CORRECT FUSE Classes
```css
.fuse-text-primary    /* Text with primary color */
.fuse-flex-center     /* Flex container centered */
.fuse-section-header  /* Section header pattern */
.fuse-action-icon     /* Action icon style */
```

#### ❌ INCORRECT FUSE Classes
```css
.text-primary         /* Missing .fuse- prefix */
.fuse-blue-text       /* Color-based, not purpose */
.fuseFlexCenter       /* Use kebab-case */
.FUSE-TEXT-PRIMARY    /* Don't use uppercase */
```

#### ✅ CORRECT Component Classes
```css
.vanish-drawer        /* Component base */
.vanish-header        /* Component element */
.vanish-header--close /* Element modifier */
.userbutton-menu      /* Component base */
.userbutton-avatar    /* Component element */
.userbutton-avatar--active /* Element with state */
```

#### ❌ INCORRECT Component Classes
```css
.drawer-vanish        /* Component name comes first */
.VanishDrawer         /* Use kebab-case */
.vanish_drawer        /* Use hyphens, not underscores */
.vanishdrawer         /* Separate words with hyphens */
```

### BEM Naming for Component Classes

Component-specific classes should follow **BEM-lite** (Block-Element-Modifier):

```css
/* Block: .component-name */
.userbutton { }

/* Element: .component-name-element */
.userbutton-menu { }
.userbutton-avatar { }
.userbutton-dropdown { }

/* Modifier: .component-name-element--modifier */
.userbutton-avatar--active { }
.userbutton-menu--open { }
.userbutton-dropdown--loading { }
```

**Rules:**
- **Block** = component base (`.userbutton`)
- **Element** = sub-part of component (`.userbutton-menu`)
- **Modifier** = state/variant (`.userbutton-menu--open`)
- Use **single hyphen** between block/element: `.userbutton-menu`
- Use **double hyphen** before modifier: `.userbutton-menu--open`

---

## FILE LOCATION REQUIREMENTS

### The FUSE-STYLE File Structure

```
/fuse/style/                     ← FUSE-STYLE Brain
├── tokens.css                   ← Design tokens (spacing, typography, shadows)
├── overview.css                 ← Layout control panel (dimensions)
├── themes/                      ← Theme-specific colors
│   ├── transtheme.css          ← Default theme
│   ├── ocean.css               ← Alternative theme
│   └── forest.css              ← Alternative theme
├── prebuilts.css                ← VR Prebuilt infrastructure (variables + base classes)
└── classes.css                  ← FUSE utility classes (site-wide)

/src/components/                 ← Component implementations
├── prebuilts/                   ← VR Prebuilt components
│   ├── button/
│   │   ├── primary/
│   │   │   ├── Button.tsx
│   │   │   └── button.css      ← Variant-specific classes
│   │   └── danger/
│   │       ├── Button.tsx
│   │       └── button.css
│   └── card/
│       ├── standard/
│       │   ├── Card.tsx
│       │   └── card.css
│       └── metric/
│           ├── Card.tsx
│           └── card.css
│
├── features/                    ← Feature components
│   ├── UserButton/
│   │   ├── UserButton.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── UserMenu.tsx
│   │   └── userbutton.css      ← Component-specific classes
│   ├── CountrySelector/
│   │   ├── CountrySelector.tsx
│   │   └── countryselector.css
│   └── ThemeToggle/
│       ├── ThemeToggle.tsx
│       └── themetoggle.css
│
└── vanish/                      ← Special feature (deletion system)
    ├── VanishDrawer.tsx
    ├── VanishDrawerAccess.tsx
    ├── VanishDrawerPortal.tsx
    └── vanishdrawer.css         ← Component-specific classes
```

### File Location Decision Tree

```
WHERE DOES THIS CSS GO?

1. Is it a color that changes between themes?
   → /fuse/style/themes/[theme].css (as CSS variable)

2. Is it a reusable utility used in 3+ features?
   → /fuse/style/classes.css (as .fuse- class)

3. Is it infrastructure for a VR Prebuilt?
   → /fuse/style/prebuilts.css (as --component- variable)
   → /src/components/prebuilts/[name]/[variant].css (as .vr- class)

4. Is it specific to one feature component?
   → /src/components/[feature]/[name].css (as .component-name- class)

5. Is it an inline style?
   → STOP. This is likely ISV (Inline Style Virus).
   → Only proceed if it qualifies as documented exception.
```

### Import Order

**In `/src/app/layout.tsx` (root layout):**

```tsx
// ═══════════════════════════════════════════════════════════════════════
// STYLING FOUNDATION - Import Order Matters
// ═══════════════════════════════════════════════════════════════════════

// 1. Reset first - Clean slate for all browsers
import '@/styles/globals.css';

// 2. FUSE Style Brain - Design system foundation
import '@/fuse/style/tokens.css';           // Design tokens (spacing, typography)
import '@/fuse/style/overview.css';         // Layout control panel
import '@/fuse/style/themes/transtheme.css'; // Theme colors
import '@/fuse/style/prebuilts.css';        // VR infrastructure + base classes
import '@/fuse/style/classes.css';          // FUSE utility classes

// 3. Component-specific CSS imported by components themselves
// (Each component imports its own CSS file as needed)
```

**Order matters:** Later files can reference variables from earlier files.

**In component files:**

```tsx
// Component-specific CSS imported at top of component file
import './userbutton.css';

export function UserButton() {
  // Component implementation
}
```

---

## ISV EXCEPTION POLICY

### The Universal Law

**NO INLINE STYLES. EVER.**

This is not a guideline. This is **architectural law**.

### The 99.9% vs 0.1% Rule

```
┌────────────────────────────────────────────────────────────────┐
│  ISV ERADICATION PROTOCOL                                      │
├────────────────────────────────────────────────────────────────┤
│  99.9% of inline styles are violations.                        │
│  0.1% are legitimate technical exceptions.                     │
│                                                                 │
│  If you can implement it in CSS, you MUST.                    │
│  If you're not sure, assume it can be in CSS.                 │
│  If you think it's an exception, document why.                │
└────────────────────────────────────────────────────────────────┘
```

### What Qualifies as an Exception?

**Only two scenarios qualify:**

#### ✅ Exception 1: React Portal Dynamic Positioning

```tsx
// ✅ LEGITIMATE EXCEPTION: Calculated from getBoundingClientRect()
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="dropdown-menu"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     *
     * Portal requires dynamic positioning calculated from button rect.
     * Values cannot be in static CSS as they depend on:
     * - Button position (getBoundingClientRect)
     * - Viewport boundaries
     * - Dynamic dropdown alignment
     *
     * All static styles extracted to .dropdown-menu CSS class.
     */
    position: 'fixed',
    top: buttonRect.top + buttonRect.height,
    left: buttonRect.left,
  }}
>
```

**Why legitimate**: Values are calculated at runtime from DOM measurements. Cannot be in static CSS.

#### ✅ Exception 2: Calculated Transform Animations

```tsx
// ✅ LEGITIMATE EXCEPTION: Calculated trajectory between DOM elements
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="phoenix-button"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: Phoenix Animation Transform
     *
     * Transform calculated from two DOM element positions (modal button → topbar).
     * Values depend on:
     * - Source element position (getBoundingClientRect)
     * - Target element position (getBoundingClientRect)
     * - Viewport scroll offset
     *
     * All static styles in .phoenix-button CSS class.
     * See /docs/PHOENIX-ANIMATION-PATTERN.md for architecture.
     */
    transform: `translate(${deltaX}px, ${deltaY}px)`,
  }}
>
```

**Why legitimate**: Transform values calculated from multiple DOM element positions at runtime.

### What Does NOT Qualify?

#### ❌ Violation 1: Static Styles

```tsx
// ❌ ISV VIOLATION
<div style={{ padding: '12px', backgroundColor: '#ffffff' }} />

// ✅ CORRECT
<div className="component-container" />
```

```css
.component-container {
  padding: var(--space-md);
  background-color: var(--bg-primary);
}
```

#### ❌ Violation 2: State-Dependent Styles

```tsx
// ❌ ISV VIOLATION
<div style={{
  backgroundColor: isActive ? 'blue' : 'gray',
  color: isOpen ? 'white' : 'black'
}} />

// ✅ CORRECT
<div className={`button ${isActive ? 'button--active' : ''}`} />
```

```css
.button {
  background-color: var(--button-bg);
  color: var(--button-text);
}

.button--active {
  background-color: var(--brand-primary);
  color: #ffffff;
}
```

#### ❌ Violation 3: Hover States as JavaScript

```tsx
// ❌ ISV VIOLATION
<button
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'red'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
/>

// ✅ CORRECT
<button className="button" />
```

```css
.button {
  background-color: white;
  transition: background-color 200ms ease;
}

.button:hover {
  background-color: red;
}
```

#### ❌ Violation 4: Size/Color Styles

```tsx
// ❌ ISV VIOLATION
<div style={{
  width: toggleSize,
  color: textColor,
  fontSize: '14px'
}} />

// ✅ CORRECT
<div
  className="toggle"
  data-size={size}
/>
```

```css
.toggle {
  width: var(--toggle-size);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.toggle[data-size="large"] {
  --toggle-size: 48px;
}

.toggle[data-size="small"] {
  --toggle-size: 32px;
}
```

### Exception Documentation Requirements

**Every exception MUST have:**

1. **Inline documentation comment**
```tsx
style={{
  /**
   * ⚠️ INLINE STYLE EXCEPTION: [Reason]
   *
   * [Detailed explanation of why this cannot be in CSS]
   * Values depend on:
   * - [Dependency 1]
   * - [Dependency 2]
   *
   * All static styles extracted to .[class-name] CSS class.
   */
  ...dynamic styles only...
}}
```

2. **ESLint disable comment**
```tsx
{/* eslint-disable-next-line react/forbid-dom-props */}
<div style={{ ... }} />
```

3. **Reference to architecture docs** (for complex patterns)
```tsx
/**
 * See /docs/PORTAL-POSITIONING.md for exception justification.
 */
```

### The VANISH Precedent

VANISH is the gold standard for ISV exception handling:

**Before refactor**: 33 inline style blocks
**After refactor**: 2 inline style blocks (Portal positioning only)

**Both exceptions:**
- ✅ React Portal positioning (legitimate technical exception)
- ✅ Fully documented with inline comments
- ✅ Marked with `eslint-disable-next-line`
- ✅ Extract ALL static styles to CSS classes

**Location**: `/vanish/Drawer.tsx`

---

## COMPONENT CSS ARCHITECTURE

### The Golden Rule

**Component CSS files contain CLASSES ONLY.**

**NO `:root` variable declarations.**

### Where Variables Belong

```
┌────────────────────────────────────────────────────────────────┐
│  VARIABLE LOCATION DECISION TREE                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Q: Is this variable reusable across multiple components?      │
│     YES → Put in /fuse/style/prebuilts.css (:root)            │
│     NO  → Continue...                                          │
│                                                                 │
│  Q: Is this variable a color that changes per theme?           │
│     YES → Put in /fuse/style/themes/[theme].css               │
│     NO  → Continue...                                          │
│                                                                 │
│  Q: Is this value calculated at runtime (DOM measurements)?    │
│     YES → Inline style in TSX (documented exception)           │
│     NO  → Hardcode in component CSS (or reference theme var)  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Component CSS Structure

```css
/* ✅ CORRECT: /src/components/features/UserButton/userbutton.css */

/* Classes only - no :root block */

.userbutton-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: var(--topbar-userbutton-padding); /* Reference theme var */
}

.userbutton-avatar {
  width: 40px;                               /* Component-specific hardcoded value */
  height: 40px;
  border-radius: var(--radius-full);         /* Reference theme var */
  border: 2px solid var(--border-light);     /* Reference theme var */
  transition: all var(--duration-fast) var(--easing); /* Reference theme vars */
}

.userbutton-avatar--active {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px var(--brand-light);
  transform: scale(1.05);
}

.userbutton-menu {
  position: fixed; /* Static value, not variable */
  background-color: var(--bg-primary);       /* Reference theme var */
  box-shadow: var(--shadow-xl);              /* Reference theme var */
  border: 1px solid var(--border-light);     /* Reference theme var */
  border-radius: var(--radius-lg);           /* Reference theme var */
  min-width: 320px;                          /* Component-specific hardcoded value */
  z-index: 50;
}

.userbutton-menu-item {
  padding: var(--space-sm) var(--space-md);  /* Reference theme vars */
  color: var(--text-primary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--easing);
}

.userbutton-menu-item:hover {
  background-color: var(--bg-secondary);
}
```

```css
/* ❌ INCORRECT: Component CSS with :root variables */

:root {
  --userbutton-width: 320px;    /* ❌ Don't put variables in component CSS */
  --userbutton-height: 40px;
}

.userbutton-menu {
  width: var(--userbutton-width);
}
```

### Pattern: Component-Specific Values

**When to hardcode vs create variable:**

```css
/* ✅ Hardcode component-specific values that won't be reused */
.userbutton-avatar {
  width: 40px;     /* Specific to this component */
  height: 40px;
}

.userbutton-menu {
  min-width: 320px; /* Specific to this component */
}

/* ✅ Reference theme variables for shared infrastructure */
.userbutton-menu {
  background-color: var(--bg-primary);  /* Shared color */
  padding: var(--space-lg);              /* Shared spacing */
  border-radius: var(--radius-lg);       /* Shared radius */
}

/* ❌ Don't create component-specific variables in CSS */
:root {
  --userbutton-menu-width: 320px;  /* Just hardcode 320px instead */
}
```

**Rule of thumb**: If it's used in 1 place only, hardcode it. If it's shared infrastructure, use theme variable.

### Pattern: Referencing Theme Variables

```css
/* Component CSS references theme infrastructure */

.component-card {
  /* Colors from theme */
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);

  /* Spacing from tokens */
  padding: var(--space-lg);
  gap: var(--space-md);

  /* Radius from tokens */
  border-radius: var(--radius-lg);

  /* Shadows from tokens */
  box-shadow: var(--shadow-md);

  /* Transitions from tokens */
  transition: all var(--duration-fast) var(--easing);
}

.component-card:hover {
  /* Hover state uses theme colors */
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-lg);
}
```

---

## DECISION TREES

### Decision Tree 1: FUSE Class vs Component Class?

```
START: You need to create a CSS class

Q1: Is this styling pattern used in 3+ different features?
    YES → Create FUSE class (.fuse-[name])
    NO  → Continue...

Q2: Is this a reusable utility (like flex-center, text-primary)?
    YES → Create FUSE class (.fuse-[name])
    NO  → Continue...

Q3: Is this specific to one feature component?
    YES → Create component class (.component-name-[element])
    NO  → Re-evaluate - you may need a FUSE class after all

RESULT:
- FUSE class → /fuse/style/classes.css
- Component class → /src/components/[feature]/[name].css
```

**Examples:**

```css
/* Pattern used in Users page, Clients page, Projects page */
.fuse-section-header { }  /* ✅ FUSE class - reusable */

/* Pattern used ONLY in UserButton component */
.userbutton-menu { }      /* ✅ Component class - feature-specific */

/* Pattern used ONLY in this one place in VANISH */
.vanish-drawer { }        /* ✅ Component class - feature-specific */
```

### Decision Tree 2: CSS Variable vs Hardcoded Value?

```
START: You have a value (color, size, spacing, etc.)

Q1: Does this value change between light/dark themes?
    YES → Theme variable in /fuse/style/themes/ (--[name])
    NO  → Continue...

Q2: Is this value shared by 3+ VR Prebuilt components?
    YES → Prebuilt variable in /fuse/style/prebuilts.css (--component-[name])
    NO  → Continue...

Q3: Is this value calculated at runtime from DOM measurements?
    YES → Inline style in TSX (documented exception)
    NO  → Continue...

Q4: Is this value specific to one component and won't be reused?
    YES → Hardcode in component CSS (e.g., width: 320px;)
    NO  → Re-evaluate - might need to be a theme/prebuilt variable

RESULT:
- Theme variable → /fuse/style/themes/[theme].css
- Prebuilt variable → /fuse/style/prebuilts.css
- Inline style → TSX file (with exception docs)
- Hardcoded → Component CSS file
```

**Examples:**

```css
/* Changes between themes */
--bg-primary: #ffffff;  /* ✅ Theme variable */

/* Shared by Button.primary, Button.danger, Button.secondary */
--button-padding-y: var(--space-sm);  /* ✅ Prebuilt variable */

/* Calculated from button position */
style={{ top: buttonRect.top + 10 }}  /* ✅ Inline (exception) */

/* Used only in UserButton, specific value */
.userbutton-menu { min-width: 320px; }  /* ✅ Hardcoded */
```

### Decision Tree 3: Inline Style - Violation or Exception?

```
START: You're about to write style={{ ... }}

Q1: Can this be implemented with a CSS class?
    YES → ISV VIOLATION - Use CSS class instead
    NO  → Continue...

Q2: Can this be implemented with conditional CSS classes?
    Example: className={isActive ? 'btn btn--active' : 'btn'}
    YES → ISV VIOLATION - Use conditional classes
    NO  → Continue...

Q3: Can this be implemented with CSS :hover pseudo-class?
    YES → ISV VIOLATION - Use CSS :hover
    NO  → Continue...

Q4: Is this a static value that never changes?
    YES → ISV VIOLATION - Extract to CSS class
    NO  → Continue...

Q5: Is this value calculated from DOM measurements (getBoundingClientRect)?
    YES → LEGITIMATE EXCEPTION - Document thoroughly
    NO  → Continue...

Q6: Is this a transform calculated between two DOM elements?
    YES → LEGITIMATE EXCEPTION - Document thoroughly
    NO  → ISV VIOLATION - Find CSS solution

RESULT:
- Violation → Extract to CSS
- Exception → Document with inline comment + eslint-disable
```

**Examples:**

```tsx
/* Q1: Can be CSS class? YES → Violation */
// ❌
<div style={{ padding: '12px' }} />
// ✅
<div className="component-container" />

/* Q2: Can be conditional classes? YES → Violation */
// ❌
<div style={{ color: isActive ? 'blue' : 'gray' }} />
// ✅
<div className={`btn ${isActive ? 'btn--active' : ''}`} />

/* Q3: Can be :hover? YES → Violation */
// ❌
<button onMouseOver={(e) => e.currentTarget.style.bg = 'red'} />
// ✅
.button:hover { background: red; }

/* Q5: Calculated from DOM? YES → Exception */
// ✅
{/* eslint-disable-next-line react/forbid-dom-props */}
<div style={{ top: buttonRect.top, left: buttonRect.left }} />
```

---

## CODE REVIEW CHECKLIST

### Pre-Commit Checklist

Before committing code with CSS changes, verify:

#### ✅ **Naming Conventions**
- [ ] Theme variables use no prefix: `--bg-primary` (not `--fuse-bg-primary`)
- [ ] FUSE classes use `.fuse-` prefix: `.fuse-text-primary`
- [ ] VR classes use `.vr-` prefix: `.vr-button`
- [ ] VR variables use `--component-` pattern: `--button-padding-y`
- [ ] Component classes use `.component-name-` pattern: `.userbutton-menu`
- [ ] All CSS uses kebab-case (not camelCase or PascalCase)

#### ✅ **File Locations**
- [ ] Theme colors in `/fuse/style/themes/[theme].css`
- [ ] FUSE utility classes in `/fuse/style/classes.css`
- [ ] VR variables in `/fuse/style/prebuilts.css`
- [ ] Component classes in `/src/components/[feature]/[name].css`
- [ ] No orphaned CSS files in random locations

#### ✅ **Component CSS Architecture**
- [ ] Component CSS files contain ONLY classes (no `:root` blocks)
- [ ] Component classes reference theme variables via `var(--name)`
- [ ] Component-specific values are hardcoded (not unnecessary variables)
- [ ] No duplicate class definitions across files

#### ✅ **ISV Eradication**
- [ ] No inline styles except documented exceptions
- [ ] All static styles extracted to CSS classes
- [ ] No inline hover handlers (use CSS `:hover`)
- [ ] No state-based inline styles (use conditional classes)
- [ ] Exceptions have inline documentation + eslint-disable
- [ ] Exception count is minimal (ideally 0-2 per component)

#### ✅ **Typography Compliance**
- [ ] No hardcoded font sizes (use `var(--font-size-[size])`)
- [ ] No hardcoded font weights (use `var(--font-weight-[weight])`)
- [ ] No hardcoded line heights (use `var(--line-height-[size])`)
- [ ] Typography components used where appropriate (Title, Body, Caption)

#### ✅ **Theme Variable Usage**
- [ ] Colors reference theme variables (not hardcoded hex)
- [ ] Spacing uses token variables (not hardcoded px)
- [ ] Border radius uses token variables
- [ ] Shadows use token variables
- [ ] Transitions use token variables

#### ✅ **BEM Compliance** (for component classes)
- [ ] Block: `.component-name`
- [ ] Element: `.component-name-element`
- [ ] Modifier: `.component-name-element--modifier`
- [ ] Single hyphen between block/element
- [ ] Double hyphen before modifier

### Code Review Questions

**For the author:**
1. Why did you choose this location for this CSS?
2. Could this be a FUSE utility class instead of component-specific?
3. Are there any inline styles? If yes, why are they exceptions?
4. Did you check for existing similar patterns before creating new classes?

**For the reviewer:**
1. Does the naming follow conventions?
2. Are files in correct locations?
3. Are inline styles properly documented as exceptions?
4. Could any patterns be extracted to FUSE classes for reuse?
5. Are theme variables used consistently?

---

## REAL-WORLD EXAMPLES

### Example 1: VANISH (Proper Exception Handling)

**File**: `/vanish/Drawer.tsx`

**Before refactor**: 33 inline style blocks
**After refactor**: 2 inline style blocks

**The 2 Exceptions (Portal Positioning):**

```tsx
{/* Exception #1: Backdrop positioning */}
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="vanish-backdrop"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     *
     * Portal requires fixed positioning that cannot be in CSS:
     * - position: fixed (creates overlay layer)
     * - top/left/right/bottom: 0 (full viewport coverage)
     * - zIndex: Stacking order below drawer
     *
     * All non-positioning styles extracted to vanishdrawer.css
     * See .vanish-backdrop classes for colors, transitions, etc.
     */
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998
  }}
/>

{/* Exception #2: Drawer positioning */}
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="vanish-drawer"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     *
     * Portal drawer requires dynamic positioning:
     * - position: fixed (overlay positioning)
     * - top/right/bottom: 0 (edge-aligned drawer)
     * - width: 80% with maxWidth (responsive sizing)
     * - zIndex: Above backdrop
     *
     * Transform animation handled by CSS classes
     * All styling (colors, borders, shadows) in vanishdrawer.css
     */
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    maxWidth: '1200px',
    zIndex: 9999
  }}
/>
```

**All 31 other styles extracted to** `/vanish/vanish.css`:

```css
.vanish-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  transition: opacity 300ms ease-out;
}

.vanish-drawer {
  background-color: #18181b;
  border-left: 2px solid #ef4444;
  box-shadow: -8px 0 24px rgba(239, 68, 68, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 300ms ease-out;
}

/* ... 30+ more classes */
```

**Key Lessons:**
- ✅ Only Portal positioning remains inline
- ✅ Both exceptions thoroughly documented
- ✅ All static styles extracted to CSS
- ✅ Component went from 33 → 2 inline styles

---

### Example 2: UserButton (Work In Progress)

**File**: `/src/components/features/UserButton.tsx`

**Current state**: 56 inline style violations
**Target state**: 2 inline style exceptions (menu + modal positioning)

**Violations to fix:**

```tsx
// ❌ VIOLATION: Static container styles
<div style={{
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  marginRight: 'var(--topbar-userbutton-padding)'
}}>

// ✅ SHOULD BE:
<div className="userbutton-container">
```

```css
/* userbutton.css */
.userbutton-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: var(--topbar-userbutton-padding);
}
```

```tsx
// ❌ VIOLATION: Inline hover handlers
<button
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>

// ✅ SHOULD BE:
<button className="userbutton-menu-item">
```

```css
/* userbutton.css */
.userbutton-menu-item {
  background-color: transparent;
  transition: background-color var(--duration-fast) var(--easing);
}

.userbutton-menu-item:hover {
  background-color: var(--bg-secondary);
}
```

**Legitimate exceptions (keep):**

```tsx
// ✅ EXCEPTION: Portal positioning
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="userbutton-menu"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     * Menu positioned relative to avatar button (calculated)
     */
    position: 'fixed',
    top: menuPosition.top,
    right: menuPosition.right,
  }}
>
```

---

### Example 3: CountrySelector (Portal Pattern)

**File**: `/src/components/features/CountrySelector.tsx`

**Current**: 12 inline styles
**Target**: 1 inline style (Portal positioning)

**The Pattern:**

```tsx
// ✅ CORRECT: Split static styles from dynamic positioning
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="country-dropdown"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     * Dropdown positioned relative to toggle button (calculated from rect)
     */
    top: dropdownPosition.top,
    left: align === 'left' ? dropdownPosition.left : undefined,
    right: align === 'right' ? dropdownPosition.right : undefined,
  }}
>
```

```css
/* countryselector.css - All static styles */
.country-dropdown {
  position: fixed;
  width: 192px;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-light);
  padding: var(--space-xs) 0;
  z-index: 1000;
}
```

**Key Lessons:**
- ✅ Only positioning values inline (top, left, right)
- ✅ All static values in CSS class
- ✅ Clear separation: dynamic (JSX) vs static (CSS)

---

### Example 4: ThemeToggle (No Exceptions Needed)

**File**: `/src/components/features/ThemeToggle.tsx`

**Current**: 13 inline styles
**Target**: 0 inline styles (all can be CSS)

**The Fix:**

```tsx
// ❌ VIOLATION: Inline transform based on state
<svg
  style={{
    transform: isDark ? 'rotate(90deg)' : 'rotate(40deg)',
  }}
>

// ✅ CORRECT: CSS classes with data attribute
<svg
  className="theme-toggle-svg"
  data-mode={isDark ? 'dark' : 'light'}
>
```

```css
/* themetoggle.css */
.theme-toggle-svg {
  transition: transform 0.4s ease;
  transform: rotate(40deg);
}

.theme-toggle-svg[data-mode="dark"] {
  transform: rotate(90deg);
}
```

**Key Lessons:**
- ✅ State-based transforms can be CSS with data attributes
- ✅ No inline styles needed for animation state changes
- ✅ CSS handles transition timing automatically

---

## QUICK REFERENCE TABLES

### Table 1: Naming Prefix Reference

| Layer | Class Prefix | Variable Prefix | Example |
|-------|-------------|-----------------|---------|
| **Theme Colors** | N/A | `--[name]` | `--bg-primary`, `--text-secondary` |
| **Design Tokens** | N/A | `--[category]-[size]` | `--space-lg`, `--font-size-md` |
| **FUSE Utilities** | `.fuse-` | N/A | `.fuse-text-primary`, `.fuse-flex-center` |
| **VR Prebuilts** | `.vr-` | `--component-[prop]` | `.vr-button`, `--button-padding-y` |
| **Components** | `.name-` | N/A (hardcode) | `.userbutton-menu`, `.vanish-drawer` |

### Table 2: File Location Reference

| What | Where | Naming Pattern | Contains |
|------|-------|----------------|----------|
| **Theme colors** | `/fuse/style/themes/[theme].css` | `--[purpose]` | CSS variables only |
| **Design tokens** | `/fuse/style/tokens.css` | `--[category]-[size]` | CSS variables only |
| **Layout dimensions** | `/fuse/style/overview.css` | `--[component]-[dimension]` | CSS variables only |
| **FUSE utilities** | `/fuse/style/classes.css` | `.fuse-[purpose]` | CSS classes only |
| **VR infrastructure** | `/fuse/style/prebuilts.css` | `--component-[prop]` + `.vr-[type]` | Variables + base classes |
| **VR variants** | `/src/components/prebuilts/[name]/[variant].css` | `.vr-[type]--[variant]` | CSS classes only |
| **Components** | `/src/components/[feature]/[name].css` | `.name-[element]` | CSS classes only |

### Table 3: ISV Exception Reference

| Scenario | Exception? | Solution |
|----------|-----------|----------|
| **Static padding/color** | ❌ No | Extract to CSS class |
| **State-based color** | ❌ No | Conditional CSS classes |
| **Hover state** | ❌ No | CSS `:hover` pseudo-class |
| **Size based on prop** | ❌ No | CSS classes with data attributes |
| **Portal positioning** | ✅ Yes | Document + eslint-disable |
| **Calculated transform** | ✅ Yes | Document + eslint-disable |
| **Dynamic width** | ❌ No | CSS custom property in inline style |

### Table 4: Decision Matrix

| Question | Answer | Action |
|----------|--------|--------|
| Used in 3+ features? | Yes | Create FUSE class |
| Used in 1 feature only? | Yes | Create component class |
| Changes between themes? | Yes | Create theme variable |
| Shared by VR components? | Yes | Create prebuilt variable |
| Calculated from DOM? | Yes | Inline style (exception) |
| Component-specific value? | Yes | Hardcode in component CSS |

---

## COMMON MISTAKES

### Mistake 1: Using .fuse- Prefix for Variables

```css
/* ❌ WRONG */
:root {
  --fuse-bg-primary: #ffffff;
  --fuse-text-color: #000000;
}

/* ✅ CORRECT */
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
}
```

**Why**: The `.fuse-` prefix is for CSS classes only, not variables.

---

### Mistake 2: Component CSS with :root Variables

```css
/* ❌ WRONG: /src/components/features/UserButton/userbutton.css */
:root {
  --userbutton-width: 320px;
  --userbutton-height: 40px;
}

.userbutton-menu {
  width: var(--userbutton-width);
}

/* ✅ CORRECT */
.userbutton-menu {
  width: 320px; /* Just hardcode component-specific values */
}
```

**Why**: Component CSS should contain only classes. Variables belong in theme/prebuilt files.

---

### Mistake 3: Creating FUSE Class for Single Use

```css
/* ❌ WRONG: FUSE class used in only one place */
/* /fuse/style/classes.css */
.fuse-vanish-header {
  /* Only used in VANISH component */
}

/* ✅ CORRECT: Component class for single use */
/* /vanish/vanish.css */
.vanish-header {
  /* Feature-specific, not reusable */
}
```

**Why**: FUSE classes are for reusable patterns. Single-use styles belong in component CSS.

---

### Mistake 4: Inline Style for Static Value

```tsx
{/* ❌ WRONG */}
<div style={{ padding: '12px', backgroundColor: '#ffffff' }} />

{/* ✅ CORRECT */}
<div className="component-container" />
```

```css
.component-container {
  padding: var(--space-md);
  background-color: var(--bg-primary);
}
```

**Why**: Static values belong in CSS, not inline styles. ISV violation.

---

### Mistake 5: JavaScript Hover Handler

```tsx
{/* ❌ WRONG */}
<button
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'red'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
/>

{/* ✅ CORRECT */}
<button className="button" />
```

```css
.button {
  background-color: white;
  transition: background-color 200ms ease;
}

.button:hover {
  background-color: red;
}
```

**Why**: CSS `:hover` is more performant than JavaScript handlers. ISV violation.

---

### Mistake 6: Color-Based Variable Names

```css
/* ❌ WRONG */
:root {
  --blue: #007bff;
  --green: #28a745;
  --red: #dc3545;
}

/* ✅ CORRECT */
:root {
  --brand-primary: #007bff;
  --color-success: #28a745;
  --color-error: #dc3545;
}
```

**Why**: Purpose-based names allow color changes without renaming variables.

---

### Mistake 7: Missing Exception Documentation

```tsx
{/* ❌ WRONG: Exception without docs */}
<div style={{ top: position.top, left: position.left }} />

{/* ✅ CORRECT: Exception with full docs */}
{/* eslint-disable-next-line react/forbid-dom-props */}
<div
  className="dropdown"
  style={{
    /**
     * ⚠️ INLINE STYLE EXCEPTION: React Portal Positioning
     * Values calculated from button rect (getBoundingClientRect)
     */
    top: position.top,
    left: position.left,
  }}
/>
```

**Why**: All exceptions must be documented to prevent ISV spread.

---

### Mistake 8: Wrong File Location

```
❌ WRONG:
/src/components/UserButton.css (orphaned in components root)

✅ CORRECT:
/src/components/features/UserButton/userbutton.css
```

**Why**: Component CSS must be colocated with component code.

---

### Mistake 9: Duplicate Class Names

```css
/* ❌ WRONG: Same class in two files */

/* /src/components/features/UserButton/userbutton.css */
.menu { }

/* /src/components/features/Dropdown/dropdown.css */
.menu { } /* Name collision! */

/* ✅ CORRECT: Prefixed with component name */

/* /src/components/features/UserButton/userbutton.css */
.userbutton-menu { }

/* /src/components/features/Dropdown/dropdown.css */
.dropdown-menu { }
```

**Why**: Component-prefixed classes prevent naming collisions.

---

### Mistake 10: Not Using Theme Variables

```css
/* ❌ WRONG: Hardcoded colors */
.button {
  background-color: #ff5020;
  color: #ffffff;
  border: 1px solid #e5e7eb;
}

/* ✅ CORRECT: Theme variables */
.button {
  background-color: var(--brand-primary);
  color: #ffffff;
  border: 1px solid var(--border-light);
}
```

**Why**: Theme variables enable theme switching and consistency.

---

## CONCLUSION

This guide provides the **tactical implementation rules** for FUSE-STYLE architecture.

**Key Takeaways:**

1. **Four-layer taxonomy** - Theme, FUSE, VR, Component
2. **Clear naming conventions** - Each layer has distinct prefixes
3. **Strict file locations** - Everything has a home
4. **ISV exception policy** - 99.9% violation, 0.1% exception
5. **Component CSS = classes only** - No variables in component files
6. **Decision trees** - Clear logic for every styling decision
7. **Code review checklist** - Enforce standards before merge
8. **Real-world examples** - Learn from actual codebase patterns

**When in doubt:**
- Can it be CSS? → It should be CSS
- Is it reusable? → FUSE class
- Is it feature-specific? → Component class
- Is it inline? → Probably ISV violation

**Remember**: FUSE-STYLE is not just a styling system. It's architectural discipline that scales to 100K users.

---

*This document complements [02-FUSE-STYLE-ARCHITECTURE.md](./02-FUSE-STYLE-ARCHITECTURE.md) - the philosophical foundation of FUSE-STYLE.*

🎯 **FUSE-STYLE Implementation Guide: Know exactly where your CSS belongs.** 🎯
