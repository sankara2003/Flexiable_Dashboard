import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { LayoutDashboard, Settings, Moon, Sun, RotateCcw } from 'lucide-react';

const Header = memo(({ widgets, onToggleWidget, onResetLayout, darkMode, onToggleDark }) => {
  const [time, setTime]             = useState(new Date());
  const [showSettings, setSettings] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const greeting = useMemo(() => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, [time]);

  const timeStr = useMemo(
    () => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [time]
  );
  const dateStr = useMemo(
    () => time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    [time]
  );

  const toggleSettings = useCallback(() => setSettings((s) => !s), []);

  /* Shared button style */
  const hdrBtn =
    'w-9 h-9 flex items-center justify-center rounded-lg ' +
    'text-[var(--text-secondary)] transition-all duration-200 ' +
    'hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]';

  return (
    <header
      className={
        'sticky top-0 z-[100] flex items-center justify-between px-5 py-3 ' +
        'backdrop-blur-xl border-b border-[var(--border)] ' +
        (darkMode ? 'bg-[rgba(7,11,20,0.85)]' : 'bg-[rgba(240,244,255,0.85)]')
      }
      role="banner"
    >
      {/* ── Logo / branding ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[38px] h-[38px] flex items-center justify-center rounded-lg text-white
                       bg-gradient-to-br from-[#7c6fff] to-[#6366f1]
                       shadow-[0_0_20px_rgba(124,111,255,0.15)]"
            aria-hidden="true"
          >
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h3
              className="font-display text-[1.3rem] font-semibold tracking-[-0.02em]
                         bg-gradient-to-br from-[#7c6fff] to-[#a78bfa]
                         bg-clip-text text-transparent leading-[1.1]"
            >
              Flexiable Hub
            </h3>
            <p className="text-[0.75rem] text-[var(--text-muted)] font-normal">{greeting}, Sankara Subramanian S</p>
          </div>
        </div>
      </div>

      {/* ── Clock ── */}
      <div className="flex-1 flex justify-center max-md:hidden" aria-live="off">
        <div className="text-center">
          <span
            className="block font-mono text-[1.4rem] font-medium tracking-[0.05em] text-[var(--text-primary)] leading-[1.1]"
            aria-label={`Current time ${timeStr}`}
          >
            {timeStr}
          </span>
          <span className="text-[0.7rem] text-[var(--text-muted)]">{dateStr}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button
          className={hdrBtn}
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings dropdown */}
        <div className="relative">
          <button
            className={hdrBtn}
            onClick={toggleSettings}
            aria-expanded={showSettings}
            aria-haspopup="true"
            aria-label="Widget settings"
          >
            <Settings size={18} />
          </button>

          {showSettings && (
            <div
              className={
                'absolute top-[calc(100%+8px)] right-0 w-[240px] ' +
                'bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 ' +
                'shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-[200] animate-drop-in'
              }
              role="dialog"
              aria-label="Widget settings"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3 pb-[10px] border-b border-[var(--border)]">
                <h4 className="text-[var(--text-muted)] text-[1.2rem] font-light">Widgets</h4>
                <button
                  className="flex items-center gap-1 text-[0.7rem] text-[var(--text-muted)]
                             px-2 py-1 rounded-md transition-all duration-200
                             hover:bg-[var(--surface-raised)] hover:text-[var(--text-secondary)]"
                  onClick={onResetLayout}
                  aria-label="Reset layout to defaults"
                >
                  <RotateCcw size={13} /> Reset Layout
                </button>
              </div>

              {/* Toggle list — JS-driven, no external CSS needed */}
              <div className="flex flex-col gap-2" role="group" aria-label="Toggle widgets">
                {Object.entries(widgets).map(([id, w]) => (
                  <label
                    key={id}
                    className="flex items-center gap-[10px] cursor-pointer text-[0.82rem] text-[var(--text-secondary)]"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={w.visible}
                      onChange={() => onToggleWidget(id)}
                      aria-label={`Toggle ${w.title} widget`}
                    />
                    {/* Track */}
                    <span
                      className={
                        'inline-block w-[34px] h-[18px] rounded-[9px] relative flex-shrink-0 transition-colors duration-200 ' +
                        (w.visible ? 'bg-[var(--accent-violet)]' : 'bg-[var(--bg-600)]')
                      }
                      aria-hidden="true"
                    >
                      {/* Thumb */}
                      <span
                        className={
                          'absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full ' +
                          'shadow-sm transition-transform duration-200 ' +
                          (w.visible ? 'translate-x-4' : 'translate-x-0')
                        }
                      />
                    </span>
                    <span>{w.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-[34px] h-[34px] bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)]
                     rounded-full flex items-center justify-center
                     font-display font-bold text-[0.85rem] text-white"
          role="img"
          aria-label="User avatar: Sankara Subramanian S"
        >
          <span aria-hidden="true">SS</span>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
