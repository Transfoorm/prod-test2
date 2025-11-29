/**
 * TTTS Rule: no-direct-convex-in-pages
 *
 * Enforces Golden Bridge pattern - components must read from FUSE store,
 * not directly from Convex via useQuery.
 *
 * VIOLATION:
 *   import { useQuery } from 'convex/react';
 *   const data = useQuery(api.domains.clients.getAllPeople);
 *
 * CORRECT:
 *   import { useFuse } from '@/fuse/store';
 *   const { clients } = useFuse();
 *
 * Exception zones:
 *   - Golden Bridge hooks (src/fuse/hooks/*) - they bridge Convex → FUSE
 *   - Domain providers that auto-sync Convex → FUSE
 *
 * Ref: TTTS-ENFORCEMENT-PACK-(v1.0).md, 04-ADP-PATTERN.md
 */

module.exports = {
  rules: {
    'no-direct-convex-in-pages': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct Convex useQuery in page/component files',
          category: 'TTTS Golden Bridge',
        },
        messages: {
          noDirectConvex: `⛔ TTTS GOLDEN BRIDGE VIOLATION: Components may NEVER call useQuery() directly.

All reads MUST flow through FUSE store:
  1. WARP preloads data → /api/warp/{domain}
  2. PRISM triggers on intent → preloadOnIntent()
  3. Data hydrates into FUSE → hydrateDomain()
  4. Component reads from FUSE → useFuse()

If you need real-time updates, use a Golden Bridge hook that:
  - Subscribes to Convex internally
  - Auto-syncs to FUSE store
  - Exposes data via useFuse()

See: 04-ADP-PATTERN.md, TTTS-ENFORCEMENT-PACK-(v1.0).md`,
        },
      },
      create(context) {
        const filename = context.getFilename();

        // Exception zones - these files ARE the Golden Bridge
        const exceptionPatterns = [
          /\/fuse\/hooks\//,           // Golden Bridge hooks
          /\/fuse\/warp\//,            // WARP orchestrator
          /\/providers\//,             // Domain providers (bridge Convex → FUSE)
          /\/fuse\/hydration\//,       // Hydration utilities
          /\.test\.(ts|tsx|js|jsx)$/,  // Test files
          /\.spec\.(ts|tsx|js|jsx)$/,  // Spec files
        ];

        const isException = exceptionPatterns.some(pattern => pattern.test(filename));
        if (isException) {
          return {};
        }

        // Only enforce in page/component files
        const enforcePatterns = [
          /\/app\/.*\/page\.tsx$/,           // Page components
          /\/app\/.*\/.*\.tsx$/,             // App directory components
          /\/components\/.*\.tsx$/,          // Component files
          /\/features\/.*\.tsx$/,            // Feature components
          /\/prebuilts\/.*\.tsx$/,           // Prebuilt components
        ];

        const shouldEnforce = enforcePatterns.some(pattern => pattern.test(filename));
        if (!shouldEnforce) {
          return {};
        }

        return {
          ImportDeclaration(node) {
            // Check for useQuery import from convex/react
            if (node.source.value === 'convex/react') {
              const hasUseQuery = node.specifiers.some(
                spec => spec.imported && spec.imported.name === 'useQuery'
              );

              if (hasUseQuery) {
                context.report({
                  node,
                  messageId: 'noDirectConvex',
                });
              }
            }
          },

          CallExpression(node) {
            // Also catch useQuery calls even if imported differently
            if (
              node.callee.name === 'useQuery' ||
              (node.callee.type === 'MemberExpression' &&
               node.callee.property.name === 'useQuery')
            ) {
              context.report({
                node,
                messageId: 'noDirectConvex',
              });
            }
          },
        };
      },
    },
  },
};
