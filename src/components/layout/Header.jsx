import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Bell, Moon, Sun, Plus, RotateCcw } from 'lucide-react';

const Header = ({ widgets, onToggleWidget, onResetLayout, darkMode, onToggleDark }) => {
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo-group">
          <div className="logo-icon">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h3 className="app-title">Flexiable Hub</h3>
            <p className="greeting">{greeting()}, Sankara Subramanian S</p>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="time-display">
          <span className="time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="date">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="header-right">
        <button className="header-btn" onClick={onToggleDark} title="Toggle theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="settings-wrapper">
          <button className="header-btn settings-trigger" onClick={() => setShowSettings(s => !s)}>
            <Settings size={18} />
          </button>

          {showSettings && (
            <div className="settings-panel">
              <div className="settings-header">
                <h4>Widgets</h4>
                <button className="reset-btn" onClick={onResetLayout} title="Reset layout">
                  <RotateCcw size={13} /> Reset Layout
                </button>
              </div>
              <div className="widget-toggles">
                {Object.entries(widgets).map(([id, w]) => (
                  <label key={id} className="widget-toggle">
                    <input
                      type="checkbox"
                      checked={w.visible}
                      onChange={() => onToggleWidget(id)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                    <span>{w.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="avatar">
          <span>{"SS"}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
