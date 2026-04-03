import { lazy, Suspense, useCallback, useRef, memo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/main.css';

import Header from './components/layout/Header';
import WidgetWrapper from './components/layout/WidgetWrapper';
import { useDashboardStore } from './store/layoutStore';

// Code-split each widget — loaded on demand
const FinanceWidget = lazy(() => import('./components/widgets/FinanceWidget'));
const HealthWidget = lazy(() => import('./components/widgets/HealthWidget'));
const WeatherWidget = lazy(() => import('./components/widgets/WeatherWidget'));
const NewsWidget = lazy(() => import('./components/widgets/NewsWidget'));
const ChatWidget = lazy(() => import('./components/widgets/ChatWidget'));
const CalendarWidget = lazy(() => import('./components/widgets/CalendarWidget'));

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_COMPONENTS = {
  finance: FinanceWidget,
  health: HealthWidget,
  weather: WeatherWidget,
  news: NewsWidget,
  chat: ChatWidget,
  calendar: CalendarWidget,
};

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

const WidgetSkeleton = memo(() => (
  <div className="relative h-full flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[16px] overflow-hidden items-center justify-center">
    <div className="flex flex-col items-center gap-2 opacity-30">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-violet)] border-t-transparent animate-spin" />
      <span className="text-[0.7rem] text-[var(--text-muted)]">Loading…</span>
    </div>
  </div>
));

function App() {
  const layouts = useDashboardStore((s) => s.layouts);
  const widgets = useDashboardStore((s) => s.widgets);
  const darkMode = useDashboardStore((s) => s.darkMode);
  const setLayouts = useDashboardStore((s) => s.setLayouts);
  const toggleWidget = useDashboardStore((s) => s.toggleWidget);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const resetLayout = useDashboardStore((s) => s.resetLayout);
  const toggleDark = useDashboardStore((s) => s.toggleDarkMode);

  const debouncedSetLayouts = useRef(debounce(setLayouts, 150)).current;
  const handleLayoutChange = useCallback(
    (_cur, all) => debouncedSetLayouts(all),
    [debouncedSetLayouts]
  );

  const visibleWidgets = Object.entries(widgets).filter(([, w]) => w.visible);

  return (
    /* Root div carries the `.dark` or `.light` class for CSS-variable theming */
    <div className={`relative min-h-screen flex flex-col bg-[var(--bg-900)] text-[var(--text-primary)] ${darkMode ? 'dark' : 'light'}`}>

      {/* Decorative gradient overlay — multi-layer radial gradient, kept as inline style */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% -20%, rgba(99,102,241,0.12) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(16,185,129,0.08) 0%, transparent 60%)',
        }}
      />

      <Header
        widgets={widgets}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <main className="flex-1 p-4 relative z-[1] sm:p-[10px] xs:p-2">
        <ResponsiveGridLayout
          className="min-h-[300px]"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={40}
          draggableHandle=".drag-handle"
          onLayoutChange={handleLayoutChange}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          isResizable
          isDraggable
          resizeHandles={['se']}
        >
          {visibleWidgets.map(([id]) => {
            const Component = WIDGET_COMPONENTS[id];
            if (!Component) return null;
            return (
              <div key={id} className="relative">
                <WidgetWrapper id={id} title={widgets[id].title} onRemove={removeWidget}>
                  <Suspense fallback={<WidgetSkeleton />}>
                    <Component />
                  </Suspense>
                </WidgetWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>

        {visibleWidgets.length === 0 && (
          <div className="text-center py-[60px] text-[var(--text-muted)] text-[0.9rem]">
            <p>All widgets are hidden. Re-enable them from Settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;