/**
 * TTTS ESLint Plugin - Triple-T Sovereignty Enforcement
 *
 * This plugin enforces FUSE/ADP/PRISM/WARP architectural sovereignty.
 * It is not optional. It is not advisory. It is sovereign.
 *
 * Rules:
 *   - no-direct-convex-in-pages: Enforces Golden Bridge pattern
 *   - no-cross-domain-imports: Enforces domain sovereignty
 *   - enforce-slice-shape: Enforces FUSE/ADP slice contract
 *
 * When these rules pass:
 *   - No one can bypass Golden Bridge
 *   - No domain can leak into another
 *   - No slice can drift from ADP contract
 *   - Strategy 1 (full domain preload) becomes impossible to break
 *
 * Ref: TTTS-ENFORCEMENT-PACK-(v1.0).md
 *
 * ██████████████████████████████████████████████
 * ⚠️  TTTS GOD IS WATCHING
 * Only ONE correct path exists.
 * Clean your code and honor the Triple Ton Law.
 * ██████████████████████████████████████████████
 */

const noDirectConvexInPages = require('./no-direct-convex-in-pages.js');
const noCrossDomainImports = require('./no-cross-domain-imports.js');
const enforceSliceShape = require('./enforce-slice-shape.js');

module.exports = {
  rules: {
    'no-direct-convex-in-pages': noDirectConvexInPages.rules['no-direct-convex-in-pages'],
    'no-cross-domain-imports': noCrossDomainImports.rules['no-cross-domain-imports'],
    'enforce-slice-shape': enforceSliceShape.rules['enforce-slice-shape'],
  },
};
