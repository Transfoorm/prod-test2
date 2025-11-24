import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import customRules from "./eslint-custom-rules/class-prefix.js";
import smacRoutes from "./eslint-custom-rules/smac-routes.js";
import noComponentCss from "./eslint-custom-rules/no-component-css.js";
import noUseStateForData from "./eslint-custom-rules/no-usestate-for-data.js";
import noRuntimeRankChecks from "./eslint-custom-rules/no-runtime-rank-checks.js";
import noHardcodedSecrets from "./eslint-custom-rules/no-hardcoded-secrets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".ops/**",
      "convex/_generated/**",
      ".archive/**",  // Archived legacy code - reference only
    ],
  },
  // Register custom VRP enforcement plugins
  {
    plugins: {
      "class-prefix": customRules,
      "smac-routes": smacRoutes,
      "no-component-css": noComponentCss,
      "no-usestate-for-data": noUseStateForData,
      "no-runtime-rank-checks": noRuntimeRankChecks,
      "no-hardcoded-secrets": noHardcodedSecrets,
    },
  },
  // Global lint configuration + Superior VRP Layer 2 Rules
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "@next/next/no-img-element": "off", // Performance suggestion, not required
      "@typescript-eslint/no-unused-vars": "error", // ✅ RE-ENABLED 2025-11-09 - Dead code prevention
      "@typescript-eslint/no-explicit-any": "error", // 🛡️ TAV PROTECTION - Enabled 2025-11-04 - See TAV-EXCEPTIONS.md
      "react-hooks/exhaustive-deps": "error", // ✅ RE-ENABLED 2025-11-09 - Stale closure prevention

      // ═══════════════════════════════════════════════════════════
      // VRP LAYER 2: SUPERIOR DOCTRINE ENFORCEMENT (from transfoormv2)
      // ═══════════════════════════════════════════════════════════

      // SMAC ARCHITECTURE ENFORCEMENT
      "smac-routes/enforce-smac-routes": "error",
      "no-runtime-rank-checks/no-runtime-rank-checks": "error",

      // FUSE DOCTRINE ENFORCEMENT
      "no-usestate-for-data/no-usestate-for-data": "error",

      // SECURITY ENFORCEMENT
      "no-hardcoded-secrets/no-hardcoded-secrets": "error",

      // NOTE: class-prefix and no-component-css DISABLED for now
      // Legacy uses VR architecture, not 5-file system yet
      // "class-prefix/enforce-class-prefix": "error",  // DISABLED
      // "no-component-css/no-component-css": "error",  // DISABLED
    },
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ VRP 2.0 - FUSE STACK ARCHITECTURAL PURITY - VRP (Virgin Repo Protocol)
  // ═══════════════════════════════════════════════════════════════════
  // Enforce FUSE Stack architecture: WARP preloading + Golden Bridge + Zero waterfalls
  {
    files: ["src/**/*.{ts,tsx,js,jsx}", "convex/**/*.{ts,tsx}", "scripts/**/*.{ts,js}"],
    rules: {
      // FUSE Rule 1: Ban loading states (architectural cancer)
      "no-restricted-syntax": [
        "error",
        {
          selector: "VariableDeclarator[id.name=/^(is)?loading$/i][init.callee.name='useState']",
          message: "⛔ FUSE VIOLATION: Loading states are bugs. Data is preloaded via WARP pattern before render. Read from useFuse() state, never fetch in components."
        },
        {
          selector: "VariableDeclarator[id.name=/^isPending$/i][init.callee.name='useState']",
          message: "⛔ FUSE VIOLATION: Pending states are bugs. Use optimistic updates or WARP preloading instead of loading indicators."
        }
      ],

      // FUSE Rule 2: Ban client-side fetch() (violates Golden Bridge)
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "⛔ FUSE VIOLATION: Components never fetch(). READS: use useFuse() - data preloaded via WARP. WRITES: use Convex mutations → cookie update → ClientHydrator refresh → FUSE state auto-updates."
        }
      ],

      // FUSE Rule 3: Ban axios + relative imports
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "⛔ FUSE VIOLATION: No HTTP libraries allowed. READS: useFuse() (WARP preloaded). WRITES: Convex mutations."
            }
          ],
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*", "!../*.css", "!../*.module.css"],
              message: "⛔ ARCHITECTURAL CANCER: Relative imports hide domain structure. Use @ aliases:\n  • src: @/components, @/store, @/fuse\n  • convex: @/convex/_generated, @/convex/vanish\n  Example: @/convex/vanish/cascade not ../../../vanish/cascade"
            }
          ]
        }
      ]
    },
  },
  // Exception: Allow isSubmitting for optimistic UI feedback (not loading states)
  {
    files: [
      "src/app/(auth)/sign-in/page.tsx",
      "src/app/(auth)/sign-up/page.tsx",
    ],
    rules: {
      "no-restricted-syntax": "off"  // isSubmitting is optimistic UI, not loading
    }
  },
  // Exception: Allow fetch in API routes (server-side only)
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "no-restricted-globals": "off"  // Server-side fetch is acceptable
    }
  },
  // Exception: Allow fetch for Convex file uploads (official Convex pattern)
  {
    files: ["src/components/features/UserButton/index.tsx"],
    rules: {
      "no-restricted-globals": "off"  // Convex storage upload to generated URL
    }
  },
  // Exception: Allow fetch for Clerk admin operations (must be server-side)
  // NOTE: Uses filename patterns - if files are renamed, update this list!
  // Search: grep -r "EmailTab\|SecurityTab\|ProfileTab" eslint.config.mjs
  {
    files: [
      "**/*EmailTab.tsx",    // Any file ending with EmailTab.tsx (Shared & Admiral)
      "**/*SecurityTab.tsx",  // Any file ending with SecurityTab.tsx (Shared & Admiral)
      "**/*ProfileTab.tsx",   // Any file ending with ProfileTab.tsx (Admiral only)
    ],
    rules: {
      "no-restricted-globals": "off"  // Clerk admin API operations (email/password management)
    }
  },
  // Exception: Allow fetch for session cleanup on logout
  {
    files: ["**/sign-out/page.tsx"],
    rules: {
      "no-restricted-globals": "off"  // Server-side session cookie deletion
    }
  },
  // Exception: Allow fetch in Convex actions (server-side external API calls)
  {
    files: ["convex/**/*Action.ts"],
    rules: {
      "no-restricted-globals": "off"  // Convex actions are server-side
    }
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ WCCC PROTECTION - PREVENT PAGE-SPECIFIC CSS FILES
  // ═══════════════════════════════════════════════════════════════════
  // Enforce 5-hub system: prebuilts, shell, features, layout, auth ONLY
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/page.css", "./page.css"],
              message: "⛔ WCCC VIOLATION: Page-specific CSS files are forbidden. Use prebuilts or create a feature component instead.\n\nAllowed CSS hubs:\n  • /styles/prebuilts.css (vr-* components)\n  • /styles/features.css (ft-* components)\n  • /styles/layout.css (ly-* shell + layouts)\n\nIf you need custom styling:\n  1. Check if a prebuilt variant exists\n  2. Create new prebuilt variant in /src/prebuilts/\n  3. Last resort: Create feature component in /src/features/\n\nSee TTT-WCCC-PROTOCOL.md for details."
            }
          ]
        }
      ]
    }
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ ISV PROTECTION - GLOBAL "INLINE STYLE VIRUS" PREVENTION
  // ═══════════════════════════════════════════════════════════════════
  // Block ALL inline styles except documented FUSE-compliant exceptions
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "react/forbid-dom-props": [
        "error",
        {
          forbid: [
            {
              propName: "style",
              message:
                "⛔ INLINE STYLE VIRUS DETECTED! Use CSS classes instead. See ISV-PROTECTION.md for FUSE-STYLE architecture. Only dynamic runtime values are allowed (see ISVEA-EXCEPTIONS.md).",
            },
          ],
        },
      ],
    },
  },
  // Exception patterns for FUSE-compliant dynamic styles
  {
    files: [
      // Phoenix Animation System (Dynamic Law - runtime transforms)
      "src/app/(modes)/(shared)/home/@captain/complete-setup/FlyingEngine.tsx",
      "src/app/(modes)/(shared)/home/@captain/complete-setup/SetupModal.tsx",

      // Portal components (Dynamic Law - getBoundingClientRect positioning)
      "src/components/features/CountrySelector/index.tsx",
      "src/prebuilts/tooltip/Basic.tsx",
      "src/prebuilts/modal/drawer/portal.tsx",

      // Data-driven components (Dynamic Law - runtime values/metadata)
      "src/prebuilts/input/range/index.tsx",      // Runtime percentage positioning
      "src/prebuilts/fieldbox/Row.tsx",     // CSS custom property bridge for dynamic gap
      "src/prebuilts/rank/Card.tsx",        // CSS custom property bridges from metadata
      "src/prebuilts/divider/dashed/index.tsx",   // Runtime multiplier/color/height
      "src/prebuilts/divider/default/index.tsx",  // Runtime multiplier/color/height
      "src/prebuilts/divider/gradient/index.tsx", // Runtime multiplier/color/direction
      "src/prebuilts/divider/line/index.tsx",     // Runtime multiplier/color/height
      "src/prebuilts/card/standard/index.tsx",    // Runtime values
      "src/prebuilts/search/Bar.tsx",       // Runtime width prop
      "src/prebuilts/form/Inline.tsx",      // Runtime layout
      "src/appshell/PageHeader.tsx",              // Runtime values
    ],
    rules: {
      "react/forbid-dom-props": "off", // Allow inline styles in these exception files
    },
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ SMAC LAYER 2 - ARCHITECTURAL ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════
  // Enforce SMAC (Static Manifest Access Control) architecture
  {
    files: ["src/app/domain/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      // SMAC Rule 1: No rank-based branching in routes/components
      "no-restricted-syntax": [
        "error",
        {
          selector: "IfStatement > BinaryExpression[left.name='rank']",
          message: "⛔ SMAC VIOLATION: No rank branching in routes. Edge gate handles authorization. Routes must be rank-agnostic."
        },
        {
          selector: "ConditionalExpression[test.left.name='rank']",
          message: "⛔ SMAC VIOLATION: No rank ternaries in components. Use data-driven rendering, not rank-driven logic."
        },
        {
          selector: "SwitchStatement > SwitchCase[test.right.value=/captain|crew|commodore|admiral/]",
          message: "⛔ SMAC VIOLATION: No rank switch statements. Manifests control access, not component logic."
        }
      ]
    }
  },
  // SMAC Rule 2: No cookies() in React Server Components (RSC only)
  {
    files: ["src/app/**/*.{ts,tsx}", "src/domains/**/*.{ts,tsx}"],
    ignores: ["src/app/actions/**", "src/app/api/**"], // Server actions need cookies() to write
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/headers",
              importNames: ["cookies"],
              message: "⛔ SMAC VIOLATION: Use headers() or getSession(), not cookies() in RSC. Middleware sets x-effective-rank header."
            }
          ]
        }
      ]
    }
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ SMAC PERFORMANCE - PREVENT ANTIPATTERNS
  // ═══════════════════════════════════════════════════════════════════
  // Enforce SMAC performance optimizations (static shells, no blocking fetches)
  // SMAC Rule 3: No fetchUserServer in layouts (prevents 200-400ms blocking)
  {
    files: ["src/app/**/layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/fetchUser*", "@/fuse/store/server/fetchUser"],
              message: "⛔ PERFORMANCE VIOLATION: No fetchUserServer in layouts. Use <ClientHydrator /> for client-side hydration. Layouts must be static shells (SEP Sprint 1)."
            }
          ]
        }
      ]
    }
  },
  // SMAC Rule 4: Warn about force-dynamic in routes with client-side data
  // Note: Full validation requires checking both 'use client' + force-dynamic, which needs custom plugin
  // This rule catches the export declaration itself as a warning signal
  {
    files: ["src/app/domain/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ExportNamedDeclaration[declaration.declarations.0.id.name='dynamic'][declaration.declarations.0.init.value='force-dynamic']",
          message: "⚠️  PERFORMANCE WARNING: force-dynamic may be unnecessary. If page uses client-side useQuery, remove force-dynamic for static shell + client hydration (SEP Sprint 1)."
        }
      ]
    }
  },
];

export default eslintConfig;

/*  */
