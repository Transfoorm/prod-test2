// FUSE Store Brain - Core Implementation
// Following FUSE Doctrine: 2BA + TTT Ready (100K/10K/1K)

'use client';
import { create } from 'zustand';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import type {
  FuseState,
  FuseUser,
  FuseTimer,
  ThemeName,
  UserRank,
  FinanceSlice,
  ClientsSlice,
  ProductivitySlice,
  ProjectsSlice,
  SettingsSlice,
  AdminSlice,
  DashboardSlice,
  SystemSlice,
} from '@/store/types';
import { THEME_DEFAULTS, STORAGE_KEYS, DOM_ATTRIBUTES } from '@/fuse/constants/coreThemeConfig';

// Convex client for database operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// FUSE Performance Monitor - Track every millisecond
const fuseTimer: FuseTimer = {
  start: (action: string) => {
    const startTime = performance.now();
    console.log(`FUSE START: ${action}`);
    return startTime;
  },

  end: (action: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const level = duration < 1 ? 'FAST' : duration < 10 ? 'GOOD' : duration < 50 ? 'SLOW' : 'VERY_SLOW';
    console.log(`FUSE END [${level}]: ${action} -> ${duration.toFixed(2)}ms`);
    return duration;
  }
};

// ══════════════════════════════════════════════════════════════════════
// DOMAIN SLICE INITIALIZERS - Empty but structured
// Following _T2 proven pattern
// ══════════════════════════════════════════════════════════════════════

const emptyFinanceSlice: FinanceSlice = {
  businessProfile: null,
  categories: [],
  accounts: [],
  transactions: [],
  patterns: [],
  customers: [],
  quotes: [],
  invoices: [],
  suppliers: [],
  purchases: [],
  bills: [],
  chartOfAccounts: [],
  fixedAssets: [],
  employees: [],
  payrollRuns: [],
};

const emptyClientsSlice: ClientsSlice = {
  people: [],
  teams: [],
  sessions: [],
  reports: [],
};

const emptyProductivitySlice: ProductivitySlice = {
  emails: [],
  calendar: [],
  meetings: [],
  bookings: [],
  tasks: [],
  // ADP Coordination fields
  status: 'idle',
  lastFetchedAt: undefined,
  source: undefined,
};

const emptyProjectsSlice: ProjectsSlice = {
  charts: [],
  locations: [],
  tracking: [],
};

const emptySettingsSlice: SettingsSlice = {
  userProfile: null,
  preferences: [],
  notifications: [],
};

const emptySystemSlice: SystemSlice = {
  users: [],
  ranks: [],
  aiConfig: null,
};

const emptyAdminSlice: AdminSlice = {
  users: [],
  deletionLogs: [],
  status: 'idle',
  lastFetchedAt: undefined,
  source: undefined,
};

const emptyDashboardSlice: DashboardSlice = {
  layout: 'classic',
  visibleWidgets: [],
  expandedSections: [],
  status: 'idle',
};

// THE FUSE STORE - Central Nervous System
export const useFuse = create<FuseState>((set, get) => ({
  user: null,
  rank: undefined, // Quick access to rank - synced from user.rank
  isHydrated: false, // Track if store has been initialized from server
  themeMode: THEME_DEFAULTS.DEFAULT_MODE, // Default to light mode - will sync with database
  themeName: THEME_DEFAULTS.DEFAULT_THEME, // Default theme name - will sync with database

  // Navigation state - instant route tracking
  navigation: {
    currentRoute: '',
    breadcrumbs: [],
    sidebarCollapsed: false,
    activeSection: undefined,
    expandedSections: [], // Track expanded nav sections
    pendingRoute: null // Track route being navigated to for INSTANT visual feedback
  },

  // AI Sidebar state - instant interaction
  aiSidebarState: 'closed',

  // Phoenix modal state - flying button and setup modal tracking
  modalSkipped: false,
  phoenixButtonVisible: false,
  phoenixNavigating: false,

  lastActionTiming: undefined,

  // Domain slices - Great Provider Ecosystem
  finance: emptyFinanceSlice,
  clients: emptyClientsSlice,
  productivity: emptyProductivitySlice,
  projects: emptyProjectsSlice,
  settings: emptySettingsSlice,
  admin: emptyAdminSlice,
  dashboard: emptyDashboardSlice,
  system: emptySystemSlice,

  // Domain hydration tracking
  isFinanceHydrated: false,
  isClientsHydrated: false,
  isProductivityHydrated: false,
  isProjectsHydrated: false,
  isSettingsHydrated: false,
  isAdminHydrated: false,
  isDashboardHydrated: false,
  isSystemHydrated: false,

  setUser: (user: FuseUser | null) => {
    const start = fuseTimer.start('setUser');

    // 🛡️ DEV-TIME SOVEREIGNTY GUARD - Ensures Convex _id is used as canonical identity
    if (process.env.NODE_ENV === 'development' && user?.id) {
      if (user.id.startsWith('user_')) {
        console.error(
          '⛔ SOVEREIGNTY VIOLATION DETECTED:\n' +
          `user.id="${user.id}" appears to be a Clerk ID.\n` +
          'Convex _id must be used as canonical identity.\n' +
          'Fix: Ensure session minting passes _id to cookie payload.'
        );
      }
    }

    // Sync rank from user object for quick access
    const rank = user?.rank as UserRank | undefined;
    set({ user, rank, isHydrated: true, lastActionTiming: performance.now() });
    fuseTimer.end('setUser', start);
  },

  clearUser: () => {
    const start = fuseTimer.start('clearUser');
    set({ user: null, rank: undefined, lastActionTiming: performance.now() });
    fuseTimer.end('clearUser', start);
  },

  updateUser: (updates: Partial<NonNullable<FuseUser>>) => {
    const start = fuseTimer.start('updateUser');
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      // Sync rank if it changed
      const rank = updatedUser?.rank as UserRank | undefined;
      return {
        user: updatedUser,
        rank,
        lastActionTiming: performance.now()
      };
    });
    fuseTimer.end('updateUser', start);
  },

  // Direct theme setters for hydration (no DB sync)
  hydrateThemeMode: (mode) => {
    const start = fuseTimer.start('hydrateThemeMode');
    set({ themeMode: mode, lastActionTiming: performance.now() });

    // Update DOM attribute for CSS to react
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_MODE, mode);
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, 'transtheme');
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    }

    fuseTimer.end('hydrateThemeMode', start);
  },

  setThemeMode: async (mode) => {
    const start = fuseTimer.start('setThemeMode');
    set({ themeMode: mode, lastActionTiming: performance.now() });

    // Update DOM attribute for CSS to react
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_MODE, mode);
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, 'transtheme');
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    }

    // Sync to database if user is available
    const { user } = get();
    if (user?.clerkId) {
      try {
        await convex.mutation(api.domains.admin.users.api.updateThemePreferences, {
          clerkId: user.clerkId,
          themeDark: mode === 'dark'
        });
      } catch (error) {
        console.error('Failed to sync theme to database:', error);
      }
    }

    fuseTimer.end('setThemeMode', start);
  },

  hydrateThemeName: (name: ThemeName) => {
    const start = fuseTimer.start('hydrateThemeName');
    set({ themeName: name, lastActionTiming: performance.now() });

    // Update DOM attribute for CSS to react
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, name);
      localStorage.setItem(STORAGE_KEYS.THEME_NAME, name);
    }

    fuseTimer.end('hydrateThemeName', start);
  },

  setThemeName: async (name: ThemeName) => {
    const start = fuseTimer.start('setThemeName');
    set({ themeName: name, lastActionTiming: performance.now() });

    // Update DOM attribute for CSS to react
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, name);
      localStorage.setItem(STORAGE_KEYS.THEME_NAME, name);
    }

    // Sync to database if user is available
    const { user, themeMode } = get();
    if (user?.clerkId) {
      try {
        await convex.mutation(api.domains.admin.users.api.updateThemePreferences, {
          clerkId: user.clerkId,
          themeName: name,
          themeDark: themeMode === 'dark' // Preserve current theme mode
        });
      } catch (error) {
        console.error('Failed to sync theme name to database:', error);
      }
    }

    fuseTimer.end('setThemeName', start);
  },

  syncThemeFromDB: async (clerkId: string) => {
    const start = fuseTimer.start('syncThemeFromDB');

    try {
      const preferences = await convex.query(api.domains.admin.users.api.getUserThemePreferences, {
        clerkId
      });

      if (preferences) {
        const mode = preferences.themeDark ? 'dark' : 'light';
        set({
          themeMode: mode,
          themeName: 'transtheme',
          lastActionTiming: performance.now()
        });

        // Update DOM and localStorage to match DB
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_MODE, mode);
          document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, 'transtheme');
          localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
        }
      }
    } catch (error) {
      console.error('Failed to sync theme from database:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'light' | 'dark' | null;
        const updates: Partial<Pick<FuseState, 'themeMode' | 'themeName' | 'lastActionTiming'>> = {
          lastActionTiming: performance.now()
        };

        if (savedMode) updates.themeMode = savedMode;
        updates.themeName = 'transtheme';

        set(updates);
      }
    }

    fuseTimer.end('syncThemeFromDB', start);
  },

  toggleThemeMode: async () => {
    const start = fuseTimer.start('toggleThemeMode');
    const currentMode = get().themeMode;
    const newMode = currentMode === 'light' ? 'dark' : 'light';

    set({
      themeMode: newMode,
      lastActionTiming: performance.now()
    });

    // Update DOM attribute for CSS to react immediately
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_MODE, newMode);
      document.documentElement.setAttribute(DOM_ATTRIBUTES.THEME_NAME, 'transtheme');
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
    }

    // Sync to database via server action (auto-updates session cookie)
    const { user } = get();
    if (user?.clerkId) {
      try {
        // Import server action dynamically to avoid circular dependencies
        const { updateThemeAction } = await import('@/app/actions/user-mutations');
        await updateThemeAction(newMode === 'dark');
        console.log('FUSE: Theme synced to database with cookie update');
      } catch (error) {
        console.error('Failed to sync theme to database:', error);
      }
    }

    fuseTimer.end('toggleThemeMode', start);
  },

  // Navigation methods - instant route updates
  setCurrentRoute: (route: string) => {
    const start = fuseTimer.start('setCurrentRoute');
    set((state) => ({
      navigation: { ...state.navigation, currentRoute: route },
      lastActionTiming: performance.now()
    }));
    fuseTimer.end('setCurrentRoute', start);
  },

  setBreadcrumbs: (breadcrumbs: string[]) => {
    const start = fuseTimer.start('setBreadcrumbs');
    set((state) => ({
      navigation: { ...state.navigation, breadcrumbs },
      lastActionTiming: performance.now()
    }));
    fuseTimer.end('setBreadcrumbs', start);
  },
  setPendingRoute: (route: string | null) => {
    const start = fuseTimer.start('setPendingRoute');
    set((state) => ({
      navigation: { ...state.navigation, pendingRoute: route },
      lastActionTiming: performance.now()
    }));
    fuseTimer.end('setPendingRoute', start);
  },

  toggleSidebar: () => {
    const start = fuseTimer.start('toggleSidebar');
    set((state) => ({
      navigation: { ...state.navigation, sidebarCollapsed: !state.navigation.sidebarCollapsed },
      lastActionTiming: performance.now()
    }));
    fuseTimer.end('toggleSidebar', start);
  },

  setActiveSection: (section?: string) => {
    const start = fuseTimer.start('setActiveSection');
    set((state) => ({
      navigation: { ...state.navigation, activeSection: section },
      lastActionTiming: performance.now()
    }));
    fuseTimer.end('setActiveSection', start);
  },

  toggleSection: (sectionId: string) => {
    const start = fuseTimer.start('toggleSection');
    set((state) => {
      const isExpanded = state.navigation.expandedSections.includes(sectionId);
      const newExpandedSections = isExpanded
        ? state.navigation.expandedSections.filter(id => id !== sectionId)
        : [...state.navigation.expandedSections, sectionId];

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-expanded-sections', JSON.stringify(newExpandedSections));
      }

      return {
        navigation: {
          ...state.navigation,
          // Multiple sections can be open at once
          expandedSections: newExpandedSections
        },
        lastActionTiming: performance.now()
      };
    });
    fuseTimer.end('toggleSection', start);
  },

  // Hydrate expanded sections from localStorage
  hydrateExpandedSections: () => {
    const start = fuseTimer.start('hydrateExpandedSections');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-expanded-sections');
      if (stored) {
        try {
          const expandedSections = JSON.parse(stored);
          set((state) => ({
            navigation: {
              ...state.navigation,
              expandedSections
            },
            lastActionTiming: performance.now()
          }));
        } catch (error) {
          console.error('Failed to parse expanded sections from localStorage:', error);
        }
      }
    }
    fuseTimer.end('hydrateExpandedSections', start);
  },

  // Collapse all sections
  collapseAllSections: () => {
    const start = fuseTimer.start('collapseAllSections');

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-sections', JSON.stringify([]));
    }

    set((state) => ({
      navigation: {
        ...state.navigation,
        expandedSections: []
      },
      lastActionTiming: performance.now()
    }));

    fuseTimer.end('collapseAllSections', start);
  },

  // Expand all sections
  // Note: This will be called by Sidebar which knows all sections
  expandAllSections: (sectionIds?: string[]) => {
    const start = fuseTimer.start('expandAllSections');

    // Use provided section IDs, or fallback to expanding currently known sections
    const allSectionIds = sectionIds || get().navigation.expandedSections;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-sections', JSON.stringify(allSectionIds));
    }

    set((state) => ({
      navigation: {
        ...state.navigation,
        expandedSections: allSectionIds
      },
      lastActionTiming: performance.now()
    }));

    fuseTimer.end('expandAllSections', start);
  },

  // AI Sidebar methods - instant state changes
  setAISidebarState: (aiSidebarState) => {
    const start = fuseTimer.start('setAISidebarState');
    set({ aiSidebarState, lastActionTiming: performance.now() });
    fuseTimer.end('setAISidebarState', start);
  },

  // Phoenix modal methods - instant state changes
  setModalSkipped: (value: boolean) => {
    const start = fuseTimer.start('setModalSkipped');
    set({ modalSkipped: value, lastActionTiming: performance.now() });
    fuseTimer.end('setModalSkipped', start);
  },

  setPhoenixButtonVisible: (value: boolean) => {
    const start = fuseTimer.start('setPhoenixButtonVisible');
    set({ phoenixButtonVisible: value, lastActionTiming: performance.now() });
    fuseTimer.end('setPhoenixButtonVisible', start);
  },

  setPhoenixNavigating: (value: boolean) => {
    const start = fuseTimer.start('setPhoenixNavigating');
    set({ phoenixNavigating: value, lastActionTiming: performance.now() });
    fuseTimer.end('setPhoenixNavigating', start);
  },

  // ══════════════════════════════════════════════════════════════════════
  // DOMAIN HYDRATION METHODS - Great Provider Ecosystem
  // Following _T2 proven pattern for WARP + Provider architecture
  // ══════════════════════════════════════════════════════════════════════

  // Finances Domain Hydration
  hydrateFinance: (data: Partial<FinanceSlice>) => {
    const start = fuseTimer.start('hydrateFinance');
    set((state) => ({
      finance: { ...state.finance, ...data },
      isFinanceHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('💰 FUSE: Finances domain hydrated', {
      accounts: data.accounts?.length || 0,
      transactions: data.transactions?.length || 0,
      customers: data.customers?.length || 0,
      invoices: data.invoices?.length || 0,
    });
    fuseTimer.end('hydrateFinance', start);
  },

  clearFinance: () => {
    const start = fuseTimer.start('clearFinance');
    set({
      finance: emptyFinanceSlice,
      isFinanceHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearFinance', start);
  },

  // Clients Domain Hydration
  hydrateClients: (data: Partial<ClientsSlice>) => {
    const start = fuseTimer.start('hydrateClients');
    set((state) => ({
      clients: { ...state.clients, ...data },
      isClientsHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('👥 FUSE: Clients domain hydrated', {
      people: data.people?.length || 0,
      teams: data.teams?.length || 0,
      sessions: data.sessions?.length || 0,
    });
    fuseTimer.end('hydrateClients', start);
  },

  clearClients: () => {
    const start = fuseTimer.start('clearClients');
    set({
      clients: emptyClientsSlice,
      isClientsHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearClients', start);
  },

  // Work Domain Hydration (ADP/PRISM Compliant)
  hydrateProductivity: (data: Partial<ProductivitySlice>, source?: 'SSR' | 'WARP' | 'CONVEX_LIVE' | 'MUTATION' | 'ROLLBACK') => {
    const start = fuseTimer.start('hydrateProductivity');
    set((state) => ({
      productivity: {
        ...state.productivity,
        ...data,
        // ADP Coordination: Track source and timing
        status: 'ready',
        lastFetchedAt: Date.now(),
        source: source || data.source || 'WARP',
      },
      isProductivityHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('⚡ FUSE: Productivity domain hydrated', {
      emails: data.emails?.length || 0,
      calendar: data.calendar?.length || 0,
      meetings: data.meetings?.length || 0,
      bookings: data.bookings?.length || 0,
      source: source || data.source || 'WARP',
    });
    fuseTimer.end('hydrateProductivity', start);
  },

  clearProductivity: () => {
    const start = fuseTimer.start('clearProductivity');
    set({
      productivity: emptyProductivitySlice,
      isProductivityHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearProductivity', start);
  },

  // Projects Domain Hydration
  hydrateProjects: (data: Partial<ProjectsSlice>) => {
    const start = fuseTimer.start('hydrateProjects');
    set((state) => ({
      projects: { ...state.projects, ...data },
      isProjectsHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('📋 FUSE: Projects domain hydrated', {
      charts: data.charts?.length || 0,
      locations: data.locations?.length || 0,
      tracking: data.tracking?.length || 0,
    });
    fuseTimer.end('hydrateProjects', start);
  },

  clearProjects: () => {
    const start = fuseTimer.start('clearProjects');
    set({
      projects: emptyProjectsSlice,
      isProjectsHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearProjects', start);
  },

  // Settings Domain Hydration
  hydrateSettings: (data: Partial<SettingsSlice>) => {
    const start = fuseTimer.start('hydrateSettings');
    set((state) => ({
      settings: { ...state.settings, ...data },
      isSettingsHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('⚙️ FUSE: Settings domain hydrated', {
      userProfile: data.userProfile ? 'present' : 'none',
      preferences: data.preferences?.length || 0,
      notifications: data.notifications?.length || 0,
    });
    fuseTimer.end('hydrateSettings', start);
  },

  clearSettings: () => {
    const start = fuseTimer.start('clearSettings');
    set({
      settings: emptySettingsSlice,
      isSettingsHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearSettings', start);
  },

  // Admin Domain Hydration
  hydrateAdmin: (data: Partial<AdminSlice>, source: 'SSR' | 'WARP' | 'MUTATION' | 'CONVEX_LIVE' = 'WARP') => {
    const start = fuseTimer.start('hydrateAdmin');
    set((state) => ({
      admin: {
        ...state.admin,
        ...data,
        status: 'ready',
        lastFetchedAt: Date.now(),
        source,
      },
      isAdminHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log(`🛡️ FUSE: Admin domain hydrated via ${source}`, {
      users: data.users?.length || 0,
      deletionLogs: data.deletionLogs?.length || 0,
    });
    fuseTimer.end('hydrateAdmin', start);
  },

  clearAdmin: () => {
    const start = fuseTimer.start('clearAdmin');
    set({
      admin: emptyAdminSlice,
      isAdminHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearAdmin', start);
  },

  // Dashboard Domain Hydration (UI preferences only)
  hydrateDashboard: (data: Partial<DashboardSlice>) => {
    const start = fuseTimer.start('hydrateDashboard');
    set((state) => ({
      dashboard: { ...state.dashboard, ...data },
      isDashboardHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('🎯 FUSE: Dashboard domain hydrated', {
      layout: data.layout || 'classic',
      visibleWidgets: data.visibleWidgets?.length || 0,
      expandedSections: data.expandedSections?.length || 0,
    });
    fuseTimer.end('hydrateDashboard', start);
  },

  clearDashboard: () => {
    const start = fuseTimer.start('clearDashboard');
    set({
      dashboard: emptyDashboardSlice,
      isDashboardHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearDashboard', start);
  },

  // System Domain Hydration (Admiral-only: users, ranks, AI config)
  hydrateSystem: (data: Partial<SystemSlice>) => {
    const start = fuseTimer.start('hydrateSystem');
    set((state) => ({
      system: { ...state.system, ...data },
      isSystemHydrated: true,
      lastActionTiming: performance.now()
    }));
    console.log('⚙️ FUSE: System domain hydrated', {
      users: data.users?.length || 0,
      ranks: data.ranks?.length || 0,
    });
    fuseTimer.end('hydrateSystem', start);
  },

  clearSystem: () => {
    const start = fuseTimer.start('clearSystem');
    set({
      system: emptySystemSlice,
      isSystemHydrated: false,
      lastActionTiming: performance.now()
    });
    fuseTimer.end('clearSystem', start);
  },
}));
