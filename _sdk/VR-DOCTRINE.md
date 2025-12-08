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
.ft-field-row { }
.ft-profile-country { }
.ft-setup-modal { }
```

The prefixes tell you exactly where the code belongs. `vr-` is reusable DNA. `ft-` is specific assembly.

---

## Summary

**VR** = The organ (dumb, reusable)
**Feature** = The assembly (smart, specific)
**Tab** = The placement (clean, declarative)

The Tab should never know about FUSE. The VR should never know about business logic. Features do all the work.
