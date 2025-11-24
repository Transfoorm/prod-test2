/**──────────────────────────────────────────────────────────────────────┐
│  🎯 DASHBOARD STATE SLICE - UI Preferences Only                       │
│  /src/store/domains/dashboard.ts                                      │
│                                                                        │
│  Dashboard owns ZERO data. Only UI state:                             │
│  • Layout preferences (classic/focus/metrics)                         │
│  • Visible widgets                                                    │
│  • Expanded sections                                                  │
│  • Loading status                                                     │
│                                                                        │
│  SMAC Doctrine: Dashboard is a shell, not a domain                    │
│  References: TTT~DASHBOARD-IMPLEMENTATION-DOCTRINE.md §State          │
└────────────────────────────────────────────────────────────────────────┘ */

import type { StateCreator } from 'zustand';
import type { UserRank } from '@/rank/types';

/**
 * Dashboard UI State (zero data ownership)
 */
export interface DashboardState {
  /** Layout mode preference */
  layout: 'classic' | 'focus' | 'metrics';

  /** Which widgets to display (rank-filtered) */
  visibleWidgets: string[];

  /** Which sections are expanded */
  expandedSections: string[];

  /** Dashboard readiness status */
  status: 'idle' | 'ready';
}

/**
 * Dashboard Actions (UI state only)
 */
export interface DashboardActions {
  setLayout: (layout: DashboardState['layout']) => void;
  setVisibleWidgets: (widgets: string[]) => void;
  toggleWidget: (widgetId: string) => void;
  toggleSection: (sectionId: string) => void;
  setStatus: (status: DashboardState['status']) => void;
  resetDashboard: () => void;
}

/**
 * Default widgets by rank (matches nav structure)
 */
export const DEFAULT_WIDGETS_BY_RANK: Record<UserRank, string[]> = {
  admiral: ['admin-stats', 'system-health', 'work-inbox', 'client-activity'],
  commodore: ['portfolio-summary', 'work-inbox', 'client-activity', 'finance-overview', 'branding-status'],
  captain: ['work-inbox', 'client-activity', 'finance-overview', 'project-status'],
  crew: ['work-inbox', 'client-sessions'],
} as const;

/**
 * Initial dashboard state
 */
const initialState: DashboardState = {
  layout: 'classic',
  visibleWidgets: [],
  expandedSections: [],
  status: 'idle',
};

/**
 * Dashboard slice creator (UI preferences only)
 */
export const createDashboardSlice: StateCreator<
  DashboardState & DashboardActions,
  [],
  [],
  DashboardState & DashboardActions
> = (set) => ({
  ...initialState,

  setLayout: (layout) =>
    set({ layout }),

  setVisibleWidgets: (widgets) =>
    set({ visibleWidgets: widgets }),

  toggleWidget: (widgetId) =>
    set((state) => ({
      visibleWidgets: state.visibleWidgets.includes(widgetId)
        ? state.visibleWidgets.filter((id) => id !== widgetId)
        : [...state.visibleWidgets, widgetId],
    })),

  toggleSection: (sectionId) =>
    set((state) => ({
      expandedSections: state.expandedSections.includes(sectionId)
        ? state.expandedSections.filter((id) => id !== sectionId)
        : [...state.expandedSections, sectionId],
    })),

  setStatus: (status) =>
    set({ status }),

  resetDashboard: () =>
    set(initialState),
});

/**
 * Dashboard slice type (for FUSE integration)
 */
export type DashboardSlice = DashboardState & DashboardActions;
