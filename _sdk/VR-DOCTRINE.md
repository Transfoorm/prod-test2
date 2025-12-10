# VR DOCTRINE

## The Stack

```
VR → Feature → Tab
```

**VR** = Pure UI behavior (dumb shell)
**Feature** = VR + FUSE + business logic (smart wrapper)
**Tab/Page** = One line import (pure declaration)

---

## The Rules

### VRs (Prebuilts)
- Dumb visual shells
- Receive value, fire callback
- No FUSE imports
- No business logic
- Just states: idle, focused, dirty, saved, error
- Reusable DNA

### Features
- Import VRs
- Wire to FUSE
- Add transforms, validations, modals
- Handle all edge cases
- The sponge for dirt
- All complexity lives here

### Tabs/Pages (Domains)
- One line imports
- Zero FUSE
- Zero callbacks
- Zero state
- Pure declaration
- Just place Features on the page

---

## Example

### VR (prebuilts/field/Live.tsx)
```tsx
// Dumb shell - just UI states
export default function FieldLive({ value, onSave, label }) {
  // Visual states: focused, dirty, saved
  // Fires onSave callback
  // Knows nothing about FUSE
}
```

### Feature (features/account/ProfileFields/)
```tsx
// Smart wrapper - wires FUSE
import { Field } from '@/prebuilts';
import { useFuse } from '@/store/fuse';

export function ProfileFields() {
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  return (
    <>
      <Field.live
        label="First Name"
        value={user?.firstName ?? ''}
        onSave={(v) => updateUserLocal({ firstName: v })}
      />
      {/* More fields with all the FUSE wiring */}
    </>
  );
}
```

### Tab (domains/settings/account/_tabs/Profile.tsx)
```tsx
// Pure declaration - one line
import { ProfileFields } from '@/features/account/ProfileFields';

export default function Profile() {
  return <ProfileFields />;
}
```

---

## Why This Works

1. **VRs stay clean** - Reusable across any data source
2. **Features absorb dirt** - All edge cases, transforms, wiring
3. **Tabs stay pristine** - Just declarations, no logic
4. **Clear boundaries** - Know exactly where code belongs
5. **Testable** - VRs can be tested in isolation

---

## The Sponge Principle

Features are the sponge. They absorb:
- FUSE wiring
- Business logic
- Transforms
- Validations
- Modal flows
- Edge cases
- Animations
- All the dirt

VRs and Tabs stay dry. Features get wet.

---

## CSS Alignment

The TTT naming convention was always there:

### Class Prefixes
- `.vr-*` → VR classes (prebuilts)
- `.ft-*` → Feature classes (features)

### File Cascade
- `styles/prebuilts.css` → Imports all VR CSS
- `styles/features.css` → Imports all Feature CSS (largest by design)
- Tabs have no CSS - they just compose Features

### Example
```css
/* VR - dumb visual shell */
.vr-field-live { }
.vr-field-live--focused { }
.vr-field-live__input { }

/* Feature - specific wiring */
.vr-field-row { }
.ft-profile-country { }
.ft-setup-modal { }
```

The prefixes tell you exactly where the code belongs. `vr-` is reusable DNA. `ft-` is specific assembly.

---

⭐ THE VR STACK ONTOLOGY — FROM BYTE → VR → FEATURE → PAGE

VR → Pure UI behavior (dumb shell)
  Feature = VR + FUSE + business logic (smart wrapper)
  Tab/Page → One line import (pure declaration)

  The VR is reusable DNA. The Feature is the assembled organ. The Tab just places it on the page.

That's the ontology. Bottom up:

  | Level           | What                         |
  |-----------------|------------------------------|
  | byte            | Raw storage                  |
  | character       | Single symbol                |
  | token           | CSS variable, JS identifier  |
  | declaration     | color: var(--text-primary)   |
  | class           | .vr-field-live__helper       |
  | structure       | DOM tree                     |
  | behaviour       | State, events, lifecycle     |
  | variant surface | Props that modify appearance |
  | VR              | Complete unit (Field.live)   |
  | section         | Group of VRs (Profile tab)   |
  | screen          | Full page (Account)          |
  | app             | Transfoorm                   |

  | Level           | What                         | Example                                        |
  |-----------------|------------------------------|------------------------------------------------|
  | byte            | Raw storage                  | 0x48                                           |
  | character       | Single symbol                | H                                              |
  | token           | CSS variable, JS identifier  | --space-md                                     |
  | declaration     | Property + value             | gap: var(--space-md);                          |
  | class           | Selector + declarations      | .vr-field-live__helper { position: absolute; } |
  | structure       | DOM tree                     | <div><label/><input/></div>                    |
  | behavior        | State, events, lifecycle     | const [state, setState] = useState('idle')     |
  | variant surface | Props that modify appearance | helper="Letters only"                          |
  | VR              | Complete unit                | <Field.live label="Username" ... />            |
  | section         | Group of VRs                 | <div className="vr-field-row">...</div>        |
  | screen          | Full page                    | <Profile />                                    |
  | app             | Transfoorm                   | <Router />                                     |

  Field.live sits at the VR layer. Everything below it is encapsulated. Everything above it just composes it.

0️⃣ BYTE

A byte is just machine storage.
It represents:
	•	a character
	•	a number
	•	part of a file
	•	part of compiled JS/CSS

A byte has no semantic meaning.
It is raw data.

But bytes compose…

⸻

1️⃣ BYTES → CHARACTERS

Text files (TSX, CSS, JSON) are sequences of bytes.

Characters form:
	•	variable names
	•	class names
	•	selectors
	•	JSX
	•	logic

This is the first human-readable layer.

⸻

2️⃣ CHARACTERS → TOKENS

A token is the smallest meaningful unit.

Examples:
	•	CSS variable: --space-md
	•	Class keyword: .vr-field-live
	•	JS identifier: Field
	•	JSX tag: <input>

Tokens are the atoms of your system.

⸻

3️⃣ TOKENS → DECLARATIONS

Tokens form rules.

Examples:

CSS rule:

--space-md: 12px;

Class definition:

.vr-field-live { display: flex; }

TypeScript declaration:

export interface FieldProps { ... }

These rules have meaning but no behavior.

⸻

4️⃣ DECLARATIONS → CLASSES (CSS)

Now you get styling objects:
	•	.vr-field-live
	•	.vr-field-row
	•	.vr-label
	•	.vr-input

Classes are the first level where UI shape is defined.

⸻

5️⃣ CLASSES → STRUCTURES (DOM NODES)

When classes attach to markup, structure appears.

Example:

<div className="vr-field-live">
  <label className="vr-label">Name</label>
  <input className="vr-input" />
</div>

This forms the physical UI skeleton of the VR.

But there is no behavior yet.

⸻

6️⃣ STRUCTURES → BEHAVIOR (LOGIC)

Now we add:
	•	state
	•	focus handling
	•	async save
	•	validation
	•	transitions
	•	verification flows

This is where the VR becomes “alive.”

Example:

const [value, setValue] = useState("");
const send = useMachine(fieldMachine);


⸻

7️⃣ BEHAVIOR → VARIANT SURFACE

This is where a component becomes a Variant Robot, not just a component.

Variants elevate the structure + behavior into a configurable unit:

<Field.live size="md" tone="neutral" helper="..." transform="username" />

Variants define the contract of the VR.

⸻

8️⃣ VARIANT SURFACE → VR (COMPLETE ROBOT)

This is the final organism in your architecture.

A VR is:
	•	styling system (classes)
	•	structural system (markup blueprint)
	•	behavioral system (state machine)
	•	variant system (configuration)
	•	edge contracts (spacing, rhythm)
	•	self-contained rules

A VR is the first truly complete, predictable, portable, sealed UI unit.

Examples:
	•	<Field.live />
	•	<Field.verifyEmail />
	•	<Tabs.panels />
	•	<ModalRobot />

⸻

9️⃣ VRs → SECTIONS

VRs assemble into coherent groups:
	•	settings panels
	•	form sections
	•	cards
	•	lists
	•	modals

This is not logic, just grouping.

⸻

🔟 SECTIONS → SCREENS (PAGES)

This is where domain composition happens.

A screen is:

<Tabs.panels>
  <ProfileTab />
  <EmailTab />
  <SecurityTab />
</Tabs.panels>

Screens contain no logic — just composition.

⸻

⭐ THE COMPLETE STACK (THE ONLY CORRECT ONE)**

byte
→ character
→ token
→ declaration
→ class
→ structure (DOM)
→ behavior (logic)
→ variant surface
→ VR
→ section
→ screen
→ app

THIS is how a VR is formed.
This is the actual ontology, from the lowest storage unit to the final UX.

If this matches what you were searching for, say “continue” and I will express it as a diagram or doctrine.

⸻

## Summary

**VR** = The organ (dumb, reusable)
**Feature** = The assembly (smart, specific)
**Tab** = The placement (clean, declarative)

The Tab should never know about FUSE. The VR should never know about business logic. Features do all the work.
