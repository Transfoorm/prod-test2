// Custom ESLint rule: no-runtime-rank-checks
// Prevents runtime rank checks - enforces SMAC compile-time authorization
// Ref: 13-SMAC-ARCHITECTURE.md

module.exports = {
  rules: {
    'no-runtime-rank-checks': {
      create(context) {
        return {
          IfStatement(node) {
            const source = context.getSourceCode();
            const testCode = source.getText(node.test);

            // Detect rank checks in conditionals
            const hasRankCheck =
              testCode.includes('rank ===') ||
              testCode.includes('rank !==') ||
              testCode.includes('rank ==') ||
              testCode.includes('rank !=') ||
              testCode.includes("rank === 'admiral'") ||
              testCode.includes("rank === 'captain'") ||
              testCode.includes("rank === 'commodore'") ||
              testCode.includes("rank === 'crew'") ||
              testCode.includes('effectiveRank ===') ||
              testCode.includes('userRank ===');

            if (hasRankCheck) {
              const filename = context.getFilename();

              // Allow in middleware, manifests, providers, scripts, Convex queries/mutations, API routes, and rank system
              const isAllowed =
                filename.includes('/middleware') ||
                filename.includes('/rank/manifests/') ||
                filename.includes('/rank/guards/') ||
                filename.includes('/rank/RankGate') ||
                filename.includes('/providers/') ||
                filename.includes('/scripts/') ||
                filename.includes('/convex/') ||  // Convex mutations/queries need rank checks
                filename.includes('/src/app/api/') ||  // API routes need rank checks
                filename.includes('rankAuth.ts') ||
                filename.includes('DashboardView.tsx');  // Legacy dashboard component

              if (!isAllowed) {
                context.report({
                  node,
                  message: '⛔ SMAC VIOLATION: Runtime rank checks are forbidden in components and pages. Rank authorization happens at compile-time via manifests and middleware. SMAC scopes data by rank BEFORE it reaches components - components should never branch on rank. Move logic to rank manifest or middleware. Ref: 13-SMAC-ARCHITECTURE.md Layer 2',
                });
              }
            }
          },
          ConditionalExpression(node) {
            const source = context.getSourceCode();
            const testCode = source.getText(node.test);

            // Detect rank checks in ternaries
            const hasRankCheck =
              testCode.includes('rank ===') ||
              testCode.includes('effectiveRank ===') ||
              testCode.includes('userRank ===');

            if (hasRankCheck) {
              const filename = context.getFilename();

              const isAllowed =
                filename.includes('/middleware') ||
                filename.includes('/rank/manifests/') ||
                filename.includes('/rank/guards/') ||
                filename.includes('/rank/RankGate') ||
                filename.includes('/providers/') ||
                filename.includes('/scripts/') ||
                filename.includes('/convex/') ||  // Convex mutations/queries need rank checks
                filename.includes('/src/app/api/') ||  // API routes need rank checks
                filename.includes('rankAuth.ts') ||
                filename.includes('DashboardView.tsx');  // Legacy dashboard component

              if (!isAllowed) {
                context.report({
                  node,
                  message: '⛔ SMAC VIOLATION: Runtime rank checks via ternary operators are forbidden. Use SMAC compile-time authorization (manifests + middleware). Ref: 13-SMAC-ARCHITECTURE.md',
                });
              }
            }
          }
        };
      }
    }
  }
};
