import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Header from './components/layout/Header';
import WidgetWrapper from './components/layout/WidgetWrapper';
import FinanceWidget from './components/widgets/FinanceWidget';
import HealthWidget from './components/widgets/HealthWidget';
import WeatherWidget from './components/widgets/WeatherWidget';
import NewsWidget from './components/widgets/NewsWidget';
import ChatWidget from './components/widgets/ChatWidget';
import CalendarWidget from './components/widgets/CalendarWidget';

// ── Zustand store (replaces all manual localStorage helpers) ──────────────
import { useDashboardStore } from './store/layoutStore';

import './styles/main.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_COMPONENTS = {
  finance:  FinanceWidget,
  health:   HealthWidget,
  weather:  WeatherWidget,
  news:     NewsWidget,
  chat:     ChatWidget,
  calendar: CalendarWidget,
};

function App() {
  // Pull everything from the store — Zustand's persist middleware keeps
  // these values in sync with localStorage automatically.
  const layouts      = useDashboardStore((s) => s.layouts);
  const widgets      = useDashboardStore((s) => s.widgets);
  const darkMode     = useDashboardStore((s) => s.darkMode);
  const setLayouts   = useDashboardStore((s) => s.setLayouts);
  const toggleWidget = useDashboardStore((s) => s.toggleWidget);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const resetLayout  = useDashboardStore((s) => s.resetLayout);
  const toggleDark   = useDashboardStore((s) => s.toggleDarkMode);

  // react-grid-layout fires this on every drag/resize — we forward it
  // straight into the store; persist does the rest.
  const handleLayoutChange = (_current, allLayouts) => {
    setLayouts(allLayouts);
  };

  const visibleWidgets = Object.entries(widgets).filter(([, w]) => w.visible);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="app-bg" />

      <Header
        widgets={widgets}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <main className="dashboard-main">
        <ResponsiveGridLayout
          className="layout"
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
              <div key={id} className="grid-item">
                <WidgetWrapper
                  id={id}
                  title={widgets[id].title}
                  onRemove={removeWidget}
                >
                  <Component />
                </WidgetWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>

        {visibleWidgets.length === 0 && (
          <div className="empty-state">
            <p>All widgets are hidden. Re-enable them from Settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
