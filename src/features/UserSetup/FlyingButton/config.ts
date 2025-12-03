/**──────────────────────────────────────────────────────────────────────────┐
 │  ⏱️ PHOENIX TIMING CONFIG - Single Source of Truth                        │
 │  /src/features/UserSetup/FlyingButton/config.ts                           │
 │                                                                            │
 │  All timing values for the Phoenix (Flying Button) animation system.      │
 │  Every delay, duration, and offset lives here for easy orchestration.     │
 │                                                                            │
 │  The Phoenix flows:                                                        │
 │  • Skip Flow: Modal → Topbar (when "Skip for now" clicked)                │
 │  • Reverse Flow: Topbar → Modal (future - when topbar button clicked)     │
 │                                                                            │
 │  ⚠️  MODIFY WITH CARE: These values are carefully tuned for the           │
 │  Houdini illusion. Change one, test the entire flow.                      │
 └────────────────────────────────────────────────────────────────────────────*/

export const PHOENIX_CONFIG = {
  // ════════════════════════════════════════════════════════════════════════
  // SKIP FLOW - Modal → Topbar
  // User clicks "Skip for now" button
  // ════════════════════════════════════════════════════════════════════════
  skipFlow: {
    // Step 1: User clicks "Skip for now" (START GUN at 0ms)

    // Step 2: Houdini switch - modal button disappears IMMEDIATELY
    // Phoenix appears in its place (no delay)

    // Step 3: Phoenix flight
    flightStartDelay: 50,         // ms before Phoenix starts flying (let CSS transition apply)
    flightDuration: 600,          // ms for Phoenix to fly from modal to topbar
    landingBuffer: 50,            // ms buffer after flight completes before Phoenix disappears

    // Step 4: Modal roll-up animation
    modalFadeDelay: 0,            // ms before modal starts fading (immediate)
    modalFadeDuration: 600,       // ms for modal opacity to fade
    modalRollUpDuration: 600,     // ms for modal to collapse (max-height transition)

    // Step 5: Dashboard unmount
    modalUnmountDelay: 600,       // ms before modal is removed from DOM (must be > longest animation)

    // Step 6: Topbar button appearance
    topbarButtonAppearDelay: 300, // ms after Phoenix lands before topbar button appears
     },

  // ════════════════════════════════════════════════════════════════════════
  // REVERSE FLOW - Topbar → Modal 
  // User clicks topbar button to bring modal back
  // ════════════════════════════════════════════════════════════════════════
  reverseFlow: {
    // Reverse flow - Phoenix flies back from topbar to modal
    topbarButtonFadeStartDelay: 10, // On Click: ms before topbar button starts fading (let Phoenix arrive first)
    phoenixTakeoffDelay: 0,      // ms after clicking topbar before Phoenix appears
    phoenixDepartureDelay: 0,     // ms after Phoenix appears before it takes off and flies
    modalPositionDelay: 600,     // ms to wait for modal animation before getting button position
    flightDuration: 600,            // ms for Phoenix to fly back to modal
    landingBuffer: 50,           // ms buffer after flight completes before Phoenix disappears
    topbarButtonHideDelay: 600,     // ms delay before hiding topbar button (after Phoenix appears)
    modalShowDelay: 0,                // ms before modal starts appearing (immediate)
    modalFadeInDuration: 600,       // ms for modal to fade in (MUST match CSS animation)
    setupButtonAppearDelay: 650,    // ms before setup button reappears in modal
  },

  // ════════════════════════════════════════════════════════════════════════
  // VISUAL SETTINGS
  // Colors, sizes, and visual properties
  // ════════════════════════════════════════════════════════════════════════
  visual: {
    // Debug mode - set to true to see Phoenix in different color
    debugMode: false,

    // Debug color (blue for visibility)
    debugColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',

    // Production color (matches Button.primary)
    productionColor: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
  },
  // ════════════════════════════════════════════════════════════════════════
  // NAVIGATION FLOWS - When navigating away from unskipped modal
  // ════════════════════════════════════════════════════════════════════════
  navAwayFromUnskippedFlow: {
    flyingButtonStartDelay: 100,   // ms before Phoenix starts when navigating away
    topbarButtonAppearDelay: 400,  // ms before topbar button appears
  },

  navigateAwayFlow: {
    flyingButtonEventDelay: 600,   // ms delay for navigation events
  },

  // ════════════════════════════════════════════════════════════════════════
  // SYSTEM TIMING - Background processes that affect the dance
  // ════════════════════════════════════════════════════════════════════════
  systemTiming: {
    cookiePollingInterval: 1000,     // ms between cookie checks
  },

} as const;

// Export individual sections for easy importing
export const { skipFlow, reverseFlow, visual, navAwayFromUnskippedFlow, navigateAwayFlow, systemTiming } = PHOENIX_CONFIG;
