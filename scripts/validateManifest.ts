/**──────────────────────────────────────────────────────────────────────┐
│  ✅ SMAC MANIFEST VALIDATOR - Build-Time Enforcement                  │
│  /scripts/validateManifest.ts                                         │
│                                                                        │
│  Validates that every route in manifests actually exists in codebase. │
│  Runs during prebuild to catch manifest drift before deployment.      │
│                                                                        │
│  SMAC Layer 2: Compile-Time Validation                                │
│  • Every allowed path must have a page.tsx file                       │
│  • Every home path must be in allowed list                            │
│  • Fails build if validation errors found                             │
│                                                                        │
│  References: TTT~BLUEPRINT-#3-UNIFIED-MASTER.md §Validation           │
└────────────────────────────────────────────────────────────────────────┘ */

import fs from 'node:fs';
import path from 'node:path';
import { ALL_MANIFESTS } from '@/rank/manifest';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src', 'app');

/**
 * Check if a route file exists
 */
function routeExists(routePath: string): boolean {
  // Handle route groups: /clients -> src/app/(modes)/(captain)/clients/page.tsx
  // Also check (shared) routes
  const trimmed = routePath.replace(/^\/+/, '');
  
  // Patterns to check (accommodate current structure)
  const patterns = [
    path.join(APP_DIR, `(modes)`, `(captain)`, trimmed, 'page.tsx'),
    path.join(APP_DIR, `(modes)`, `(shared)`, trimmed, 'page.tsx'),
    path.join(APP_DIR, `(modes)`, `(admiral)`, trimmed, 'page.tsx'),
    path.join(APP_DIR, trimmed, 'page.tsx'),
  ];

  return patterns.some(p => fs.existsSync(p));
}

/**
 * Main validation
 */
function validateManifests(): void {
  console.log('🔍 Validating SMAC manifests...\n');

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
