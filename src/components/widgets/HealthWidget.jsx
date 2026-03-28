import React, { useState, useEffect, useCallback } from 'react';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Heart, Moon, Zap, Droplets, Footprints, Sparkles, RefreshCw } from 'lucide-react';
import { generateHealthData, generateWeeklySteps, generateSleepHistory } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';

const HealthWidget = () => {
  const [health, setHealth] = useState(generateHealthData());
  const [weeklySteps, setWeeklySteps] = useState(generateWeeklySteps());
  const [sleepHistory, setSleepHistory] = useState(generateSleepHistory());
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const refreshData = useCallback(() => {
    const newHealth = generateHealthData();
    setHealth(newHealth);
    setWeeklySteps(generateWeeklySteps());
    setSleepHistory(generateSleepHistory());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const fetchInsight = useCallback(async () => {
    setLoadingInsight(true);
    const result = await generateInsight('health', health);
    setInsight(result);
    setLoadingInsight(false);
  }, [health]);

  useEffect(() => { fetchInsight(); }, []);

  const MetricRing = ({ value, goal, color, icon: Icon, label, unit }) => {
    const pct = Math.min(100, Math.round((value / goal) * 100));
    return (
      <div className="metric-ring-card">
        <div className="ring-wrapper">
          <svg viewBox="0 0 60 60" className="ring-svg">
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
          <div className="ring-icon" style={{ color }}>
            <Icon size={14} />
          </div>
        </div>
        <div className="metric-details">
          <span className="metric-value">{value.toLocaleString()}<small>{unit}</small></span>
          <span className="metric-label">{label}</span>
          <span className="metric-goal">Goal: {goal.toLocaleString()}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-inner health-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <Heart size={18} className="widget-icon health-icon" />
          <h3>Health</h3>
        </div>
        <div className="widget-actions">
          <span className="heart-rate-badge">
            <Heart size={10} /> {health.heartRate} bpm
          </span>
          <button className="icon-btn" onClick={refreshData}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {insight && (
        <div className="ai-insight health-insight">
          <Sparkles size={12} />
          <span>{loadingInsight ? 'Analyzing health data...' : insight}</span>
          <button className="refresh-insight" onClick={fetchInsight}>↻</button>
        </div>
      )}

      <div className="tab-nav">
        {['overview', 'steps', 'sleep'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="health-metrics-grid">
          <MetricRing value={health.steps} goal={health.stepsGoal} color="#10b981" icon={Footprints} label="Steps" unit="" />
          <MetricRing value={health.sleep} goal={health.sleepGoal} color="#8b5cf6" icon={Moon} label="Sleep" unit="h" />
          <MetricRing value={health.calories} goal={health.caloriesGoal} color="#f59e0b" icon={Zap} label="Calories" unit="" />
          <MetricRing value={health.hydration} goal={health.hydrationGoal} color="#3b82f6" icon={Droplets} label="Hydration" unit="gl" />
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklySteps} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`${v.toLocaleString()} steps`]} />
              <Bar dataKey="steps" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'sleep' && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={sleepHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} domain={[4, 10]} tickFormatter={v => `${v}h`} />
              <Tooltip formatter={v => [`${v}h sleep`]} />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
              <Line type="monotone" dataKey="goal" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HealthWidget;
