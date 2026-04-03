import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles, IndianRupee } from 'lucide-react';
import { generateStockData, generateSpendingData, generatePortfolioHistory } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';
import { afterPaint } from '../../utils/afterPaint';

/* ── Shared class fragments ─────────────────────────────────────── */
const iconBtn =
  'w-[26px] h-[26px] flex items-center justify-center rounded-[6px] ' +
  'text-[var(--text-muted)] transition-all duration-150 ' +
  'hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]';

const tabBtn = (active) =>
  'px-[10px] py-1 rounded-md text-[0.72rem] font-medium transition-all duration-150 ' +
  (active
    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-hover)]'
    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]');

/* ── Tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[0.75rem]">
      <p className="text-[var(--text-muted)] mb-1 text-[0.7rem]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
});
CustomTooltip.displayName = 'FinanceTooltip';

const TABS = ['stocks', 'portfolio', 'spending'];

const FinanceWidget = memo(() => {
  const [stocks,      setStocks]      = useState(generateStockData);
  const [spending,    setSpending]    = useState(generateSpendingData);
  const [portfolio]   = useState(generatePortfolioHistory);
  const [insight,     setInsight]     = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab,   setActiveTab]   = useState('stocks');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const refreshData = useCallback(() => {
    setStocks(generateStockData());
    setSpending(generateSpendingData());
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(refreshData, 8000);
    return () => clearInterval(id);
  }, [refreshData]);

  const fetchInsight = useCallback(async () => {
    setLoadingInsight(true);
    const portfolioValue = portfolio[portfolio.length - 1]?.value ?? 0;
    const prevValue      = portfolio[portfolio.length - 8]?.value ?? portfolioValue;
    const result = await generateInsight('finance', {
      portfolioValue,
      weeklyChange: +(((portfolioValue - prevValue) / prevValue) * 100).toFixed(2),
      topStock: stocks[0],
      spending: spending.slice(0, 3),
    });
    setInsight(result);
    setLoadingInsight(false);
  }, [portfolio, stocks, spending]);

  // Defer insight fetch until after the browser has painted — keeps TBT low
  useEffect(() => { afterPaint(fetchInsight); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { totalPortfolio, portfolioChange } = useMemo(() => {
    const total = portfolio[portfolio.length - 1]?.value ?? 0;
    const prev  = portfolio[portfolio.length - 2]?.value ?? total;
    return { totalPortfolio: total, portfolioChange: total - prev };
  }, [portfolio]);

  const portfolioSlice = useMemo(() => portfolio.slice(-15), [portfolio]);
  const lastUpdatedStr = useMemo(
    () => lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [lastUpdated]
  );

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <IndianRupee size={18} className="text-[var(--accent-emerald)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Finance</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-[var(--text-muted)] font-mono" aria-label={`Last updated ${lastUpdatedStr}`}>{lastUpdatedStr}</span>
          <button className={iconBtn} onClick={refreshData} aria-label="Refresh finance data"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-[10px] mb-2">
          <span className="text-[0.72rem] text-[var(--text-muted)]">Portfolio</span>
          <span className="font-mono text-[1.2rem] font-medium text-[var(--text-primary)]">
            ₹{totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={
              'flex items-center gap-[3px] text-[0.72rem] font-semibold px-[7px] py-[2px] rounded-full ' +
              (portfolioChange >= 0
                ? 'text-[var(--accent-emerald)] bg-[rgba(16,185,129,0.1)]'
                : 'text-[#f87171] bg-[rgba(239,68,68,0.1)]')
            }
          >
            {portfolioChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {portfolioChange >= 0 ? '+' : ''}₹{Math.abs(portfolioChange).toFixed(2)}
          </span>
        </div>

        {insight && (
          <div
            className="flex items-start gap-[7px] px-[10px] py-2 rounded-lg flex-shrink-0 animate-fade-in
                       text-[0.72rem] leading-[1.4] text-[var(--text-secondary)]
                       bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)]"
            role="note"
          >
            <Sparkles size={12} className="text-[var(--accent-emerald)] flex-shrink-0 mt-[1px]" aria-hidden="true" />
            <span>{loadingInsight ? 'Generating insight…' : insight}</span>
            <button
              className="ml-auto flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center
                         rounded text-[var(--text-muted)] text-[13px] transition-all duration-150
                         hover:bg-white/10 hover:text-[var(--text-primary)]"
              onClick={fetchInsight} aria-label="Refresh insight"
            >↻</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 flex-shrink-0" role="tablist" aria-label="Finance views">
        {TABS.map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab}
            className={tabBtn(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Stocks */}
      {activeTab === 'stocks' && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-1" role="tabpanel" aria-label="Stocks">
          {stocks.map((stock) => (
            <div key={stock.symbol}
              className="flex items-center justify-between px-[10px] py-[7px] rounded-lg
                         bg-[var(--surface-raised)] border border-[var(--border)]
                         transition-all duration-150 hover:border-[var(--border-hover)]">
              <div className="flex flex-col gap-[1px]">
                <span className="font-mono text-[0.8rem] font-semibold text-[var(--text-primary)]">{stock.symbol}</span>
                <span className="text-[0.65rem] text-[var(--text-muted)]">{stock.name}</span>
              </div>
              <div className="flex flex-col items-end gap-[1px]">
                <span className="font-mono text-[0.8rem] text-[var(--text-primary)]">₹{stock.price.toFixed(2)}</span>
                <span className={
                  'text-[0.67rem] font-semibold px-[5px] py-[1px] rounded ' +
                  (stock.change >= 0
                    ? 'text-[var(--accent-emerald)] bg-[rgba(16,185,129,0.1)]'
                    : 'text-[#f87171] bg-[rgba(239,68,68,0.1)]')
                }>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio chart */}
      {activeTab === 'portfolio' && (
        <div className="flex-1 min-h-0" role="tabpanel" aria-label="Portfolio chart">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={portfolioSlice} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending chart */}
      {activeTab === 'spending' && (
        <div className="flex-1 min-h-0" role="tabpanel" aria-label="Spending chart">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={spending} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="thisWeek" name="This Week" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="lastWeek" name="Last Week" fill="#334155" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

FinanceWidget.displayName = 'FinanceWidget';
export default FinanceWidget;
