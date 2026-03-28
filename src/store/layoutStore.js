import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Default values ────────────────────────────────────────────────────────

export const defaultLayouts = {
  lg: [
    { i: 'finance',  x: 0, y: 0,  w: 6, h: 8,  minW: 4, minH: 6 },
    { i: 'health',   x: 6, y: 0,  w: 6, h: 8,  minW: 4, minH: 6 },
    { i: 'weather',  x: 0, y: 8,  w: 3, h: 7,  minW: 3, minH: 6 },
    { i: 'news',     x: 3, y: 8,  w: 5, h: 7,  minW: 4, minH: 6 },
    { i: 'chat',     x: 8, y: 8,  w: 4, h: 7,  minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 15, w: 12, h: 6, minW: 6, minH: 5 },
  ],
  md: [
    { i: 'finance',  x: 0, y: 0,  w: 5, h: 8,  minW: 4, minH: 6 },
    { i: 'health',   x: 5, y: 0,  w: 5, h: 8,  minW: 4, minH: 6 },
    { i: 'weather',  x: 0, y: 8,  w: 3, h: 7,  minW: 3, minH: 6 },
    { i: 'news',     x: 3, y: 8,  w: 4, h: 7,  minW: 4, minH: 6 },
    { i: 'chat',     x: 7, y: 8,  w: 3, h: 7,  minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 15, w: 10, h: 6, minW: 6, minH: 5 },
  ],
  sm: [
    { i: 'finance',  x: 0, y: 0,  w: 6, h: 8,  minW: 4, minH: 6 },
    { i: 'health',   x: 0, y: 8,  w: 6, h: 8,  minW: 4, minH: 6 },
    { i: 'weather',  x: 0, y: 16, w: 6, h: 7,  minW: 3, minH: 6 },
    { i: 'news',     x: 0, y: 23, w: 6, h: 7,  minW: 4, minH: 6 },
    { i: 'chat',     x: 0, y: 30, w: 6, h: 7,  minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 37, w: 6, h: 6,  minW: 4, minH: 5 },
  ],
};

export const defaultWidgets = {
  finance:  { id: 'finance',  title: 'Finance',  visible: true },
  health:   { id: 'health',   title: 'Health',   visible: true },
  weather:  { id: 'weather',  title: 'Weather',  visible: true },
  news:     { id: 'news',     title: 'News',     visible: true },
  chat:     { id: 'chat',     title: 'AI Chat',  visible: true },
  calendar: { id: 'calendar', title: 'Calendar', visible: true },
};

// ─── Zustand store with localStorage persistence ───────────────────────────
//
// Zustand's `persist` middleware automatically:
//   • serialises state to localStorage under the key "Flexiable_Dashboard-dashboard"
//   • rehydrates it on the next page load
//
// We use `partialize` so that transient, non-serialisable state (if any is
// added later) is never accidentally written to storage.

export const useDashboardStore = create(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────────────────
      layouts: defaultLayouts,
      widgets: defaultWidgets,
      darkMode: true,

      // ── Actions ────────────────────────────────────────────────────────

      /** Called by react-grid-layout on every drag / resize event */
      setLayouts: (allLayouts) =>
        set({ layouts: allLayouts }),

      /** Toggle a single widget's visibility (used from the settings panel) */
      toggleWidget: (id) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [id]: { ...state.widgets[id], visible: !state.widgets[id].visible },
          },
        })),

      /** Hide a widget from the × button on the widget card itself */
      removeWidget: (id) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [id]: { ...state.widgets[id], visible: false },
          },
        })),

      /** Wipe stored layout and visibility back to factory defaults */
      resetLayout: () =>
        set({ layouts: defaultLayouts, widgets: defaultWidgets }),

      /** Flip between dark and light mode */
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),
    }),

    {
      name: 'Flexiable_Dashboard-dashboard',                      // localStorage key
      storage: createJSONStorage(() => localStorage),  // explicit storage engine
      partialize: (state) => ({                        // only persist these keys
        layouts:  state.layouts,
        widgets:  state.widgets,
        darkMode: state.darkMode,
      }),
    }
  )
);
