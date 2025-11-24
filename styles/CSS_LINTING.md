# 🛡️ CSS Linting - VRP CSS Guard

## Overview

The VRP CSS Guard enforces CSS code quality and prevents theme bypasses through automated linting.

## Features

### ✅ Enforced Rules

1. **Color Consistency**
   - ✅ No named colors (`red`, `blue` → use hex or CSS variables)
   - ✅ Standardized hex format (`#ffffff` → `#fff`)
   - ✅ Modern color functions (`rgba(255,255,255,0.5)` → `rgb(255 255 255 / 50%)`)

2. **Code Quality**
   - ✅ No `!important` (except where necessary with disable comments)
   - ✅ No redundant longhand properties
   - ✅ Zero-length units removed (`0px` → `0`)
   - ✅ Max specificity: `0,4,0`
   - ✅ Max nesting depth: 4

3. **Naming Conventions**
   - ✅ CSS variables: kebab-case (`--my-variable`)
   - ✅ Classes: BEM-compatible (`block__element--modifier`)

4. **Formatting**
   - ✅ Empty lines before comments
   - ✅ Comment whitespace (`/* comment */`)
   - ✅ Consistent indentation

## Usage

### Manual Linting

```bash
# Check all CSS files
npm run vrp:css

# Auto-fix issues
npx stylelint "**/*.css" --fix
```

### Automatic (Pre-commit)

CSS linting runs automatically via `lint-staged` when you commit `.css` files.

### Integration

- **Part of VRP**: Included in `npm run vrp:all`
- **Pre-commit hooks**: Auto-fixes on commit via husky
- **Build validation**: Ensures clean CSS before deployment

## Exceptions

### Legitimate Use Cases

Some violations are intentional and can be disabled:

```css
/* Disable specific rule for one line */
color: red; /* stylelint-disable-line color-named */

/* Disable for entire block */
/* stylelint-disable declaration-no-important */
.user-select-none {
  user-select: none !important;
  -webkit-user-select: none !important;
}
/* stylelint-enable declaration-no-important */

/* Disable for entire file */
/* stylelint-disable */
```

### Common Exceptions

1. **`!important` for user-select prevention** - Intentional override
2. **Vendor prefixes for `user-select`** - Not fully standardized
3. **Root variable definitions** - Can contain any valid CSS values

## Configuration

Config file: `.stylelintrc.json`

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-named": "never",
    "declaration-no-important": true,
    // ...
  }
}
```

## Future Enhancements

Potential strict rules to add:

```json
{
  "color-no-hex": true,                    // Force CSS variables for all colors
  "function-disallowed-list": ["rgb"],     // Force var() for colors
  "number-leading-zero": "always",         // 0.5 instead of .5
}
```

These require infrastructure but would enforce:
- **100% CSS variable usage** for colors
- **Zero hardcoded colors** outside `:root`
- **Complete theme compliance**

## Architecture

```
CSS Linting System
├── .stylelintrc.json          # Configuration
├── scripts/checkCSS.ts        # VRP CSS Guard script
├── package.json               # npm run vrp:css
└── lint-staged               # Auto-fix on commit
```

## VRP Integration

Part of the Virgin Repo Protocol (VRP) - prevents CSS regressions:

```bash
npm run vrp:all  # Runs all VRP checks including CSS
```

Ensures world-class CSS quality from development through deployment.
