import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import { mockNewsArticles } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Science', 'World'];

const categoryColors = {
  Technology: '#6366f1',
  Finance: '#10b981',
  Health: '#ec4899',
  Science: '#f59e0b',
  World: '#3b82f6',
};

const NewsWidget = () => {
  const [articles, setArticles] = useState(mockNewsArticles);
  const [filter, setFilter] = useState('All');
  const [insight, setInsight] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const categories = [...new Set(mockNewsArticles.map(a => a.category))];
    generateInsight('news', { categories, trendingCount: mockNewsArticles.filter(a => a.trending).length }).then(setInsight);
  }, []);

  const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter);

  return (
    <div className="widget-inner news-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <Newspaper size={18} className="widget-icon news-icon" />
          <h3>News</h3>
        </div>
        <div className="widget-actions">
          <span className="trending-badge">
            <TrendingUp size={11} /> {articles.filter(a => a.trending).length} Trending
          </span>
        </div>
      </div>

      {insight && (
        <div className="ai-insight news-insight">
          <Sparkles size={12} />
          <span>{insight}</span>
        </div>
      )}

      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            style={filter === cat && cat !== 'All' ? { borderColor: categoryColors[cat], color: categoryColors[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="news-list">
        {filtered.map(article => (
          <div
            key={article.id}
            className={`news-item ${expanded === article.id ? 'expanded' : ''}`}
            onClick={() => setExpanded(expanded === article.id ? null : article.id)}
          >
            <div className="news-item-header">
              <div className="news-meta">
                <span className="news-category" style={{ color: categoryColors[article.category] || '#888' }}>
                  {article.category}
                </span>
                {article.trending && <span className="trending-pill">🔥 Trending</span>}
              </div>
              <span className="news-time">{article.time}</span>
            </div>
            <h4 className="news-title">{article.title}</h4>
            {expanded === article.id && (
              <div className="news-expanded">
                <p className="news-summary">{article.summary}</p>
                <div className="news-footer">
                  <span className="news-source">{article.source}</span>
                  <a href={article.url} className="read-more" onClick={e => e.stopPropagation()}>
                    Read more <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
