import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles, DollarSign } from 'lucide-react';
import { generateStockData, generateSpendingData, generatePortfolioHistory } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';

const FinanceWidget = () => {
  const [stocks, setStocks] = useState(generateStockData());
  const [spending, setSpending] = useState(generateSpendingData());
  const [portfolio, setPortfolio] = useState(generatePortfolioHistory());
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState('stocks');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = useCallback(() => {
    setStocks(generateStockData());
    setSpending(generateSpendingData());
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const fetchInsight = useCallback(async () => {
    setLoadingInsight(true);
    const portfolioValue = portfolio[portfolio.length - 1]?.value || 0;
    const prevValue = portfolio[portfolio.length - 8]?.value || portfolioValue;
    const data = {
      portfolioValue,
      weeklyChange: +(((portfolioValue - prevValue) / prevValue) * 100).toFixed(2),
      topStock: stocks[0],
      spending: spending.slice(0, 3),
    };
    const result = await generateInsight('finance', data);
    setInsight(result);
    setLoadingInsight(false);
  }, [portfolio, stocks, spending]);

  useEffect(() => {
    fetchInsight();
  }, []);

  const totalPortfolio = portfolio[portfolio.length - 1]?.value || 0;
  const prevPortfolio = portfolio[portfolio.length - 2]?.value || totalPortfolio;
  const portfolioChange = totalPortfolio - prevPortfolio;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('\u20B9') ? '\u20B9' : ''}{p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="widget-inner finance-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <DollarSign size={18} className="widget-icon finance-icon" />
          <h3>Finance</h3>
        </div>
        <div className="widget-actions">
          <span className="last-updated">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button className="icon-btn" onClick={refreshData} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="portfolio-value">
          <span className="label">Portfolio</span>
          <span className="value">{`\u20B9`}{totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className={`change ${portfolioChange >= 0 ? 'positive' : 'negative'}`}>
            {portfolioChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {portfolioChange >= 0 ? '+' : ''}{`\u20B9`}{Math.abs(portfolioChange).toFixed(2)}
          </span>
        </div>
        {insight && (
          <div className="ai-insight finance-insight">
            <Sparkles size={12} />
            <span>{loadingInsight ? 'Generating insight...' : insight}</span>
            <button className="refresh-insight" onClick={fetchInsight} title="New insight">↻</button>
          </div>
        )}
      </div>

      <div className="tab-nav">
        {['stocks', 'portfolio', 'spending'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'stocks' && (
        <div className="stocks-list">
          {stocks.map(stock => (
            <div key={stock.symbol} className="stock-row">
              <div className="stock-info">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-name">{stock.name}</span>
              </div>
              <div className="stock-price-group">
                <span className="stock-price">{`\u20B9`}{stock.price.toFixed(2)}</span>
                <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={portfolio.slice(-15)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={v => `\u20B9${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={spending} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} tickFormatter={v => `\u20B9${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="thisWeek" name="This Week" fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="lastWeek" name="Last Week" fill="#334155" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default FinanceWidget;
