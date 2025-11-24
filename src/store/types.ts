// FUSE Store Brain - Type Definitions
// Following FUSE Doctrine: 2BA + Triple-T Ready

/**
 * User document type - ready for 100K users
 *
 * 🛡️ SOVEREIGNTY DOCTRINE:
 * - `id` is ALWAYS Convex _id (canonical identity)
 * - `convexId` is explicit alias for clarity
 * - `clerkId` is auth reference ONLY - never use for Convex queries
 * - All domain operations use `id` (Convex _id), not `clerkId`
 */
export type FuseUser = {
  id: string;         // ✅ REQUIRED - Convex _id (canonical, sovereign identity)
  convexId: string;   // Explicit alias for absolute clarity
  clerkId: string;    // ⚠️ NON-CANONICAL: Auth handoff reference only
  email?: string | null;
  secondaryEmail?: string | null;
  emailVerified?: boolean;
  firstName: string; // REQUIRED - Clerk provides this
  lastName: string;  // REQUIRED - Clerk provides this
  rank?: 'admiral' | 'commodore' | 'captain' | 'crew' | null;
  setupStatus?: 'invited' | 'pending' | 'abandon' | 'complete' | 'revoked' | null;
  subscriptionStatus?: 'trial' | 'active' | 'expired' | 'lifetime' | 'cancelled' | null;
  createdAt?: number;
  lastLoginAt?: number; // Last login timestamp
  avatarUrl?: string | null;
  brandLogoUrl?: string | null; // Optional: Only set when user uploads custom logo
  // Business configuration
  entityName?: string | null;
  socialName?: string | null;
  businessCountry?: string | null;
  // Theme preferences - included in user object for zero-query theme loading
  themeName?: ThemeName;
  themeDark?: boolean;
  // Miror AI preferences
  mirorAvatarProfile?: 'male' | 'female' | 'inclusive';
  mirorEnchantmentEnabled?: boolean;
  mirorEnchantmentTiming?: 'subtle' | 'magical' | 'playful';
  // Professional Genome fields
  phoneNumber?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  seniority?: string | null;
  industry?: string | null;
  companySize?: string | null;
  companyWebsite?: string | null;
  transformationGoal?: string | null;
  transformationStage?: string | null;
  transformationType?: string | null;
  timelineUrgency?: string | null;
  howDidYouHearAboutUs?: string | null;
  teamSize?: number | null;
  annualRevenue?: string | null;
  successMetric?: string | null;
} | null;

/**
 * Theme mode type following FUSE-STYLE system
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme name type from Convex schema
 */
export type ThemeName = 'transtheme';

/**
 * Navigation state - tracks current page context
 */
export type NavigationState = {
  currentRoute: string;
  breadcrumbs: string[];
  sidebarCollapsed: boolean;
  activeSection?: string;
  expandedSections: string[]; // Track which nav sections are expanded
  pendingRoute: string | null; // Track route being navigated to for INSTANT visual feedback
};

/**
 * AI Sidebar state - three states for instant interaction
 */
export type AISidebarState = 'closed' | 'open' | 'expand';

/**
 * User rank type - imported from rank system
 */
export type UserRank = 'crew' | 'captain' | 'commodore' | 'admiral';

/**
 * Core FUSE State - The behavioral brain
 * Handles all application state and performance tracking
 */
export type FuseState = {
  // User state
  user: FuseUser;
  rank: UserRank | undefined; // Quick access to rank (synced from user.rank)

  // Hydration state - tracks if store has been initialized from server
  isHydrated: boolean;

  // Theme state - FUSE-STYLE compliant
  themeMode: ThemeMode;
  themeName: ThemeName;

  // Navigation state - instant route tracking
  navigation: NavigationState;

  // AI Sidebar state - instant interaction
  aiSidebarState: AISidebarState;

  // Phoenix modal state - flying button and setup modal tracking
  modalSkipped: boolean;
  phoenixButtonVisible: boolean;
  phoenixNavigating: boolean;

  // Performance tracking
  lastActionTiming?: number;

  // Domain slices - Great Provider Ecosystem
  finance: FinanceSlice;
  clients: ClientsSlice;
  productivity: ProductivitySlice;
  projects: ProjectsSlice;
  settings: SettingsSlice;
  admin: AdminSlice;
  dashboard: DashboardSlice;
  system: SystemSlice;

  // Hydration tracking for each domain
  isFinanceHydrated: boolean;
  isClientsHydrated: boolean;
  isProductivityHydrated: boolean;
  isProjectsHydrated: boolean;
  isSettingsHydrated: boolean;
  isAdminHydrated: boolean;
  isDashboardHydrated: boolean;
  isSystemHydrated: boolean;

  // Core methods - instant, tracked operations
  setUser: (user: FuseUser | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<NonNullable<FuseUser>>) => void;

  // Theme methods - instant theme switching with DB sync
  hydrateThemeMode: (mode: ThemeMode) => void; // For hydration (no DB sync)
  hydrateThemeName: (name: ThemeName) => void; // For hydration (no DB sync)
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setThemeName: (name: ThemeName) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  syncThemeFromDB: (clerkId: string) => Promise<void>;

  // Navigation methods - instant route updates
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: string[]) => void;
  setPendingRoute: (route: string | null) => void;
  toggleSidebar: () => void;
  setActiveSection: (section?: string) => void;
  toggleSection: (sectionId: string) => void; // Toggle nav section expand/collapse
  hydrateExpandedSections: () => void; // Restore expanded sections from localStorage
  collapseAllSections: () => void; // Collapse all nav sections
  expandAllSections: () => void; // Expand all nav sections

  // AI Sidebar methods - instant state changes
  setAISidebarState: (state: AISidebarState) => void;

  // Phoenix modal methods - instant state changes
  setModalSkipped: (value: boolean) => void;
  setPhoenixButtonVisible: (value: boolean) => void;
  setPhoenixNavigating: (value: boolean) => void;

  // Domain hydration methods - Great Provider Ecosystem
  hydrateFinance: (data: Partial<FinanceSlice>) => void;
  hydrateClients: (data: Partial<ClientsSlice>) => void;
  hydrateProductivity: (data: Partial<ProductivitySlice>) => void;
  hydrateProjects: (data: Partial<ProjectsSlice>) => void;
  hydrateSettings: (data: Partial<SettingsSlice>) => void;
  hydrateAdmin: (data: Partial<AdminSlice>, source?: 'SSR' | 'WARP' | 'MUTATION' | 'CONVEX_LIVE') => void;
  hydrateDashboard: (data: Partial<DashboardSlice>) => void;
  hydrateSystem: (data: Partial<SystemSlice>) => void;

  // Domain clear methods
  clearFinance: () => void;
  clearClients: () => void;
  clearProductivity: () => void;
  clearProjects: () => void;
  clearSettings: () => void;
  clearAdmin: () => void;
  clearDashboard: () => void;
  clearSystem: () => void;
};

/**
 * FUSE Timer interface - millisecond precision tracking
 */
export interface FuseTimer {
  start: (action: string) => number;
  end: (action: string, startTime: number) => number;
}

// ══════════════════════════════════════════════════════════════════════
// DOMAIN SLICES - Great Provider Ecosystem
// Following _T2 proven pattern for WARP + Provider architecture
// ══════════════════════════════════════════════════════════════════════

/**
 * Finance Domain Slice
 * Handles banking, invoicing, expenses, payroll
 */
export type FinanceSlice = {
  // Business setup
  businessProfile: Record<string, unknown> | null;
  categories: Record<string, unknown>[];

  // Banking
  accounts: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  patterns: Record<string, unknown>[];

  // Income
  customers: Record<string, unknown>[];
  quotes: Record<string, unknown>[];
  invoices: Record<string, unknown>[];

  // Expense
  suppliers: Record<string, unknown>[];
  purchases: Record<string, unknown>[];
  bills: Record<string, unknown>[];

  // Accounting
  chartOfAccounts: Record<string, unknown>[];
  fixedAssets: Record<string, unknown>[];

  // Payroll
  employees: Record<string, unknown>[];
  payrollRuns: Record<string, unknown>[];
};

/**
 * Clients Domain Slice
 * Handles people, teams, sessions, reports
 */
export type ClientsSlice = {
  people: Record<string, unknown>[];
  teams: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  reports: Record<string, unknown>[];
};

/**
 * Productivity Domain Slice
 * Handles email, calendar, pipeline, bookings
 */
export type ProductivitySlice = {
  emails: Record<string, unknown>[];
  calendar: Record<string, unknown>[];
  pipeline: Record<string, unknown>[];
  bookings: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
};

/**
 * Projects Domain Slice
 * Handles charts, locations, tracking
 */
export type ProjectsSlice = {
  charts: Record<string, unknown>[];
  locations: Record<string, unknown>[];
  tracking: Record<string, unknown>[];
};

/**
 * Settings Domain Slice
 * Handles user profile, preferences, account settings
 */
export type SettingsSlice = {
  // User profile data - fresh from server
  userProfile: FuseUser;
  // Additional settings data can be added here
  preferences: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
};

/**
 * Admin Domain Slice
 * Handles user management, deletion logs, admin operations
 */
export type AdminSlice = {
  users: Record<string, unknown>[];
  deletionLogs: Record<string, unknown>[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  lastFetchedAt?: number; // Timestamp in ms
  source?: 'SSR' | 'WARP' | 'MUTATION' | 'CONVEX_LIVE'; // Track where data came from
};

/**
 * Dashboard Domain Slice - UI Preferences Only
 * Dashboard owns ZERO data. Only UI state (layout, widgets, expanded sections)
 * Following SMAC Doctrine: Dashboard is a shell, not a domain
 */
export type DashboardSlice = {
  layout: 'classic' | 'focus' | 'metrics';
  visibleWidgets: string[];
  expandedSections: string[];
  status: 'idle' | 'ready';
};

/**
 * System Domain Slice
 * Handles AI configuration, user management, rank management (Admiral-only)
 */
export type SystemSlice = {
  users: Record<string, unknown>[];
  ranks: Record<string, unknown>[];
  aiConfig: Record<string, unknown> | null;
};
