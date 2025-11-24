// Custom ESLint rule: enforce-smac-routes
// Enforces SMAC architecture route structure
// Ref: 13-SMAC-ARCHITECTURE.md Layer 1

module.exports = {
  rules: {
    'enforce-smac-routes': {
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();

            // Skip non-app files
            if (!filename.includes('/app/')) return;

            // Check if in (dashboard) route group
            if (filename.includes('/app/(dashboard)/')) {
              // Allowed in (dashboard):
              // - page.tsx (root only)
              // - layout.tsx (root only)
              // - _components/ (underscore prefix = private, not routes)
              // - *.client.tsx components (root only)

              const isAllowed =
                filename.match(/\/app\/\(dashboard\)\/page\.tsx$/) ||
                filename.match(/\/app\/\(dashboard\)\/layout\.tsx$/) ||
                filename.includes('/_components/') ||
                filename.match(/\/app\/\(dashboard\)\/[^\/]+\.client\.tsx$/) ||
                filename.match(/\/app\/\(dashboard\)\/[^\/]+\.server\.tsx$/);

              if (!isAllowed) {
                context.report({
                  node,
                  message: '🚫 SMAC VIOLATION: (dashboard) route group can ONLY contain page.tsx, layout.tsx, and _components/. Business domains must be in (domains)/ route group. Ref: 13-SMAC-ARCHITECTURE.md Layer 1',
                });
              }
            }

            // Check if business domain in wrong location (nested under dashboard)
            const businessDomains = ['client', 'clients', 'finance', 'finances', 'work', 'project', 'projects', 'settings', 'admin', 'system', 'dashboard'];

            businessDomains.forEach(domain => {
              // Check if domain is nested under (dashboard) as a route
              const wrongPattern = new RegExp(`/app/\\(dashboard\\)/${domain}/`);

              if (wrongPattern.test(filename)) {
                context.report({
                  node,
                  message: `🚫 SMAC VIOLATION: /${domain} is a business domain and must be in (domains)/ route group, not (dashboard)/. Move to src/app/(domains)/${domain}/. Dashboard route group is for landing page ONLY. Ref: 13-SMAC-ARCHITECTURE.md Layer 1`,
                });
              }
            });
          }
        };
      }
    }
  }
};
