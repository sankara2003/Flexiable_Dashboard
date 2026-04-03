import { useState, useEffect, useCallback, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { Heart, Moon, Zap, Droplets, Footprints, Sparkles, RefreshCw } from 'lucide-react';
import { generateHealthData, generateWeeklySteps, generateSleepHistory } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';
import { afterPaint } from '../../utils/afterPaint';

/* ── Metric Ring — memoised: only re-renders when its own props change ── */
const MetricRing = memo(({ value, goal, color, icon: Icon, label, unit }) => {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="flex items-center gap-[10px] p-[10px] bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg">
      <div className="relative flex-shrink-0 w-[54px]">
        <svg viewBox="0 0 60 60" className="w-[54px] h-[54px]" aria-hidden="true">
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle
            cx="30" cy="30" r="24" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${pct * 1.508} 150.8`}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <text x="30" y="33" textAnchor="middle" fontSize="11" fill={color} fontWeight="700">{pct}%</text>
        </svg>
        {/* Small icon badge */}
        <div
          className="absolute bottom-[-2px] right-[-2px] w-[18px] h-[18px]
                     bg-[var(--surface)] rounded-full flex items-center justify-center"
          style={{ color }}
          aria-hidden="true"
        >
          <Icon size={14} />
        </div>
      </div>
      <div className="flex flex-col gap-[1px] min-w-0">
        <span
          className="font-mono text-[0.9rem] font-semibold text-[var(--text-primary)]"
          aria-label={`${label}: ${value.toLocaleString()} ${unit}`}
        >
          {value.toLocaleString()}<small className="text-[0.65rem] text-[var(--text-muted)] ml-[2px]">{unit}</small>
        </span>
        <span className="text-[0.72rem] text-[var(--text-secondary)] font-medium">{label}</span>
        <span className="text-[0.63rem] text-[var(--text-muted)]">Goal: {goal.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
});
MetricRing.displayName = 'MetricRing';

const tabBtn = (active) =>
  'px-[10px] py-1 rounded-md text-[0.72rem] font-medium transition-all duration-150 ' +
  (active
    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-hover)]'
    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]');

const TABS = ['overview', 'steps', 'sleep'];

const HealthWidget = memo(() => {
  const [health,       setHealth]       = useState(generateHealthData);
  const [weeklySteps,  setWeeklySteps]  = useState(generateWeeklySteps);
  const [sleepHistory, setSleepHistory] = useState(generateSleepHistory);
  const [insight,      setInsight]      = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab,    setActiveTab]    = useState('overview');

  const refreshData = useCallback(() => {
    setHealth(generateHealthData());
    setWeeklySteps(generateWeeklySteps());
    setSleepHistory(generateSleepHistory());
  }, []);

  useEffect(() => {
    const id = setInterval(refreshData, 10000);
    return () => clearInterval(id);
  }, [refreshData]);

  const fetchInsight = useCallback(async () => {
    setLoadingInsight(true);
    const result = await generateInsight('health', health);
    setInsight(result);
    setLoadingInsight(false);
  }, [health]);

  useEffect(() => { afterPaint(fetchInsight); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <Heart size={18} className="text-[var(--accent-rose)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Health</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 text-[0.7rem] font-mono text-[var(--accent-rose)]
                       bg-[rgba(236,72,153,0.1)] px-2 py-[3px] rounded-full"
            aria-label={`Heart rate: ${health.heartRate} bpm`}
          >
            <Heart size={10} aria-hidden="true" /> {health.heartRate} bpm
          </span>
          <button
            className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px]
                       text-[var(--text-muted)] transition-all duration-150
                       hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
            onClick={refreshData} aria-label="Refresh health data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* AI insight */}
      {insight && (
        <div
          className="flex items-start gap-[7px] px-[10px] py-2 rounded-lg flex-shrink-0 animate-fade-in
                     text-[0.72rem] leading-[1.4] text-[var(--text-secondary)]
                     bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.15)]"
          role="note"
        >
          <Sparkles size={12} className="text-[var(--accent-rose)] flex-shrink-0 mt-[1px]" aria-hidden="true" />
          <span>{loadingInsight ? 'Analyzing health data…' : insight}</span>
          <button
            className="ml-auto flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center
                       rounded text-[var(--text-muted)] text-[13px] transition-all duration-150
                       hover:bg-white/10 hover:text-[var(--text-primary)]"
            onClick={fetchInsight} aria-label="Refresh insight"
          >↻</button>
        </div>
      )}

      {/* Tabs */}
      <nav className="flex gap-1 flex-shrink-0" role="tablist" aria-label="Health views">
        {TABS.map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab}
            className={tabBtn(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Overview — 2-column metric grid */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden" role="tabpanel" aria-label="Health overview">
          <MetricRing value={health.steps}     goal={health.stepsGoal}     color="#10b981" icon={Footprints} label="Steps"     unit=""   />
          <MetricRing value={health.sleep}     goal={health.sleepGoal}     color="#8b5cf6" icon={Moon}       label="Sleep"     unit="h"  />
          <MetricRing value={health.calories}  goal={health.caloriesGoal}  color="#f59e0b" icon={Zap}        label="Calories"  unit=""   />
          <MetricRing value={health.hydration} goal={health.hydrationGoal} color="#3b82f6" icon={Droplets}   label="Hydration" unit="gl" />
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="flex-1 min-h-0" role="tabpanel" aria-label="Weekly steps chart">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklySteps} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} steps`]} />
              <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'sleep' && (
        <div className="flex-1 min-h-0" role="tabpanel" aria-label="Sleep history chart">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={sleepHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} domain={[4, 10]} tickFormatter={(v) => `${v}h`} />
              <Tooltip formatter={(v) => [`${v}h sleep`]} />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
              <Line type="monotone" dataKey="goal"  stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

HealthWidget.displayName = 'HealthWidget';
export default HealthWidget;
