/**──────────────────────────────────────────────────────────────────────┐
│  ✅ SRS MANIFEST VALIDATOR - Build-Time Enforcement                   │
│  /scripts/validateManifest.ts                                         │
│                                                                        │
│  Validates that every route in rank manifests exists in codebase.     │
│  Runs during prebuild to catch manifest drift before deployment.      │
│                                                                        │
│  SRS Layer 1: Compile-Time Validation                                 │
│  • Every allowed path must have a domain view or page file            │
│  • Every home path must be in allowed list                            │
│  • Fails build if validation errors found                             │
│                                                                        │
│  Note: With Sovereign Router, "routes" are domain VIEWS rendered      │
│  by FuseApp, not Next.js file-based routes. Middleware only runs      │
│  on initial load - navigate() bypasses it entirely.                   │
│                                                                        │
│  References: SRS-ARCHITECTURE.md                                      │
└────────────────────────────────────────────────────────────────────────┘ */

import fs from 'node:fs';
import path from 'node:path';
import { ALL_MANIFESTS } from '@/rank/manifest';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src', 'app');

/**
 * Check if a route file exists
 * Note: With Sovereign Router, routes are in /app/domains/{domain}/
 * The Router.tsx switch handles navigation, not file-based routing
 */
function routeExists(routePath: string): boolean {
  const trimmed = routePath.replace(/^\/+/, '');

  // Patterns to check (Sovereign Router structure)
  const patterns = [
    path.join(APP_DIR, 'domains', trimmed, 'index.tsx'),  // Domain view file
    path.join(APP_DIR, 'domains', trimmed + '.tsx'),       // Direct domain file
    path.join(APP_DIR, trimmed, 'page.tsx'),               // Legacy page route
  ];

  return patterns.some(p => fs.existsSync(p));
}

/**
 * Main validation
 */
function validateManifests(): void {
  console.log('🔍 Validating SRS rank manifests...\n');

  let errors = 0;

  for (const manifest of ALL_MANIFESTS) {
    console.log(`📋 Checking ${manifest.label} (${manifest.id})...`);

    // Check home is in allowed
    if (!manifest.allowed.includes(manifest.home)) {
      console.error(`  ❌ Home route not in allowed list: ${manifest.home}`);
      errors++;
    }

    // Check all allowed routes exist
    for (const route of manifest.allowed) {
      if (!routeExists(route)) {
        console.error(`  ❌ Route missing: ${route}`);
        errors++;
      }
    }

    if (errors === 0) {
      console.log(`  ✅ All ${manifest.allowed.length} routes validated\n`);
    }
  }

  if (errors > 0) {
    console.error(`\n⛔ Manifest validation FAILED: ${errors} errors found`);
    console.error('Fix all violations before building.\n');
    process.exit(1);
  }

  console.log('✅ Manifest validation PASSED\n');
}

// Run validation
validateManifests();
