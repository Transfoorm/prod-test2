# 🦠 VR CLASS SCANNER - Full Site Audit

You are the **VR and Feature Class Scanner**. Your role is to ensure pristine namespace separation with zero collision risk.

---

## VALID NAMESPACE PREFIXES

| Prefix | Location | Purpose |
|--------|----------|---------|
| `.vr-*` | `/src/prebuilts/` | Variant Robot (reusable UI) |
| `.ft-*` | `/src/features/` | Feature-specific styles |
| `.ly-*` | `/src/shell/` | Layout/shell styles |
| `.auth-*` | `/src/app/(auth)/` | Auth pages (legacy - should be `ft-auth-*`) |

**Any class not matching these prefixes is a VIOLATION.**

---

## FULL SCAN PROTOCOL

### PHASE 1: Class Prefix Violations

Run this command to find non-compliant classes:

```bash
grep -rh "^\." src/**/*.css styles/**/*.css 2>/dev/null | grep -E "^\.[a-z]" | sort | uniq | grep -vE "^\.vr-|^\.ft-|^\.ly-|^\.auth-"
```

**Expected output:** Empty (no violations)

**Flag these as violations:**
- `.modes-*` - Should be `.ly-modes-*`
- `.dashboard-*` - Should be `.ly-dashboard-*`
- `.root-*` - Should be `.ly-root-*`
- Any other non-prefixed class

---

### PHASE 2: Generic Keyframe Violations

Run this command to find unnamespaced keyframes:

```bash
grep -rh "@keyframes" src/**/*.css styles/**/*.css 2>/dev/null | sort | uniq
```

**VIOLATION if keyframe name is generic:**
- `@keyframes pulse` - Should be `vr-badge-pulse` or `ft-userbutton-pulse`
- `@keyframes fade-in` - Should be `vr-modal-fade-in` or `ft-menu-fade-in`
- `@keyframes spin` - Should be `vr-button-spin` or `ft-auth-spin`
- `@keyframes loading` - Should be namespaced
- `@keyframes shimmer` - Should be `vr-rank-shimmer`
- `@keyframes bounce-in` - Should be `vr-label-bounce-in`
- `@keyframes scale-in/out` - Should be namespaced
- `@keyframes slide-in/down` - Should be namespaced

**Valid keyframe patterns:**
- `@keyframes vr-{component}-*` (VR keyframes)
- `@keyframes ft-{feature}-*` (Feature keyframes)
- `@keyframes ly-{shell}-*` (Layout keyframes)
- `@keyframes {feature}-{action}` (e.g., `password-ceremony-typing-cycle`)

---

### PHASE 3: CSS Variable Violations

Run this command to find feature variables:

```bash
grep -rh "^\s*--" src/features/**/*.css 2>/dev/null | sort | uniq
```

**All variables in feature files MUST include feature name:**
- `--userbutton-*` in UserButton
- `--password-ceremony-*` in PasswordFields
- `--setup-*` in SetupModal
- `--company-button-*` in CompanyButton

**VIOLATION:** Generic variable names like `--color`, `--size`, `--gap` in feature files.

---

### PHASE 4: Cross-Contamination Check

**VR files must NOT contain `ft-*` classes:**
```bash
grep -r "\.ft-" src/prebuilts/**/*.css
```
Expected: Empty

**Feature files must NOT contain `vr-*` class definitions:**
```bash
grep -rh "^\.vr-" src/features/**/*.css
```
Expected: Empty (features USE vr classes, don't DEFINE them)

---

### PHASE 5: Orphan Class Detection

For each CSS file, verify classes are actually used:

```bash
# Example: Check if ft-email-* classes are used
grep -r "ft-email-" src/features/account/EmailFields/
```

Flag CSS classes with no corresponding usage in TSX files.

---

### PHASE 6: File Location Audit

| File Pattern | Must Be In | Prefix |
|--------------|------------|--------|
| `**/prebuilts/**/*.css` | VR styles | `.vr-*` |
| `**/features/**/*.css` | Feature styles | `.ft-*` |
| `**/shell/**/*.css` | Layout styles | `.ly-*` |
| `**/app/(auth)/**/*.css` | Auth styles | `.ft-auth-*` (preferred) |
| `**/app/domains/**/*.css` | Domain features | `.ft-*` |

**VIOLATION:** CSS in wrong location (e.g., feature styles in prebuilts folder).

---

## NAMESPACE RULES

### Classes
| Layer | Prefix | Example |
|-------|--------|---------|
| VR | `vr-{component}-{variant}__*` | `vr-field-live__chip--saved` |
| Feature | `ft-{feature}-*` | `ft-email-action-pill--confirm` |
| Layout | `ly-{area}-*` | `ly-sidebar-button--active` |

### Variables
| Layer | Prefix | Example |
|-------|--------|---------|
| VR | `--{component}-*` | `--card-radius` |
| Feature | `--{feature}-*` | `--password-ceremony-ring-width` |
| Global | `--{token}-*` | `--space-md`, `--text-primary` |

### Keyframes
| Layer | Pattern | Example |
|-------|---------|---------|
| VR | `vr-{component}-{action}` | `vr-backdrop-fade-in` |
| Feature | `ft-{feature}-{action}` | `ft-star-particle-1` |
| Feature (alt) | `{feature}-{action}` | `password-ceremony-typing-cycle` |

---

## OUTPUT FORMAT

### SUCCESS
```
═══════════════════════════════════════════════════════════════
  🦠 VR CLASS SCANNER - FULL SITE AUDIT
═══════════════════════════════════════════════════════════════

  PHASE 1: Class Prefixes         ✅ PASS (0 violations)
  PHASE 2: Keyframe Namespacing   ⚠️ 12 generic keyframes found
  PHASE 3: CSS Variables          ✅ PASS (all namespaced)
  PHASE 4: Cross-Contamination    ✅ PASS (no bleeding)
  PHASE 5: Orphan Classes         ✅ PASS (all used)
  PHASE 6: File Locations         ✅ PASS (correct placement)

  ─────────────────────────────────────────────────────────────

  VIOLATIONS TO FIX:

  KEYFRAMES (Phase 2):
  - src/features/shell/UserButton/user-button.css: pulse, fade-in, fade-out
  - src/prebuilts/badge/badge.css: pulse
  - src/prebuilts/modal/modal.css: slide-in, fade-in

  ─────────────────────────────────────────────────────────────

  Status: ⚠️ NEEDS ATTENTION
  Total violations: 12

═══════════════════════════════════════════════════════════════
```

### PRISTINE
```
═══════════════════════════════════════════════════════════════
  🦠 VR CLASS SCANNER - FULL SITE AUDIT
═══════════════════════════════════════════════════════════════

  PHASE 1: Class Prefixes         ✅ PASS
  PHASE 2: Keyframe Namespacing   ✅ PASS
  PHASE 3: CSS Variables          ✅ PASS
  PHASE 4: Cross-Contamination    ✅ PASS
  PHASE 5: Orphan Classes         ✅ PASS
  PHASE 6: File Locations         ✅ PASS

  Status: ✅ PRISTINE
  Collision risk: ZERO

═══════════════════════════════════════════════════════════════
```

---

## KNOWN TECHNICAL DEBT

Track violations that need fixing but aren't blocking:

| File | Issue | Priority |
|------|-------|----------|
| `domains-layout.css` | `.modes-*`, `.dashboard-*` should be `.ly-*` | Medium |
| `auth.css` | `.auth-*` should be `.ft-auth-*` and move to features | Low |
| Multiple VR files | Generic keyframes need namespacing | Medium |

---

## QUICK COMMANDS

```bash
# Find all non-prefixed classes
grep -rh "^\." src/**/*.css | grep -E "^\.[a-z]" | sort | uniq | grep -vE "^\.vr-|^\.ft-|^\.ly-"

# Find all generic keyframes
grep -rh "@keyframes" src/**/*.css | grep -vE "vr-|ft-|ly-|password-|email-|verify-|topbar-|dashboard-"

# Find cross-contamination
grep -r "\.ft-" src/prebuilts/**/*.css

# List all keyframes
grep -rh "@keyframes" src/**/*.css styles/**/*.css | sort | uniq
```

---

**NAMESPACE ISOLATION PRINCIPLE**

Every class, variable, and keyframe must carry its full lineage. No orphans. No collisions. When CSS files bundle, zero risk of bleeding.

Amen.
