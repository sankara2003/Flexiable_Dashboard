import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Newspaper, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';
import { mockNewsArticles } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';
import { afterPaint } from '../../utils/afterPaint';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Science', 'World'];
const CAT_COLORS  = {
  Technology: '#6366f1', Finance: '#10b981',
  Health: '#ec4899', Science: '#f59e0b', World: '#3b82f6',
};
const TRENDING_COUNT = mockNewsArticles.filter((a) => a.trending).length;

const NewsWidget = memo(() => {
  const [filter,   setFilter]   = useState('All');
  const [insight,  setInsight]  = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const categories = [...new Set(mockNewsArticles.map((a) => a.category))];
    afterPaint(() => generateInsight('news', { categories, trendingCount: TRENDING_COUNT }).then(setInsight));
  }, []);

  const filtered = useMemo(
    () => (filter === 'All' ? mockNewsArticles : mockNewsArticles.filter((a) => a.category === filter)),
    [filter]
  );

  const toggleExpanded = useCallback((id) => setExpanded((prev) => (prev === id ? null : id)), []);

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <Newspaper size={18} className="text-[var(--accent-blue)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">News</h3>
        </div>
        <span
          className="flex items-center gap-1 text-[0.68rem] font-semibold text-[var(--accent-rose)]
                     bg-[rgba(236,72,153,0.1)] px-2 py-[3px] rounded-full"
          aria-label={`${TRENDING_COUNT} trending articles`}
        >
          <TrendingUp size={11} aria-hidden="true" /> {TRENDING_COUNT} Trending
        </span>
      </div>

      {/* AI insight */}
      {insight && (
        <div
          className="flex items-start gap-[7px] px-[10px] py-2 rounded-lg flex-shrink-0 animate-fade-in
                     text-[0.72rem] leading-[1.4] text-[var(--text-secondary)]
                     bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)]"
          role="note"
        >
          <Sparkles size={12} className="text-[var(--accent-blue)] flex-shrink-0 mt-[1px]" aria-hidden="true" />
          <span>{insight}</span>
        </div>
      )}

      {/* Category filters */}
      <nav className="flex gap-[5px] flex-wrap flex-shrink-0" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filter === cat}
            className={
              'px-[10px] py-[3px] rounded-full text-[0.68rem] font-medium transition-all duration-150 ' +
              'bg-[var(--surface-raised)] border border-[var(--border)] ' +
              (filter === cat && cat !== 'All'
                ? ''   /* color/border-color applied via inline style below */
                : filter === cat
                  ? 'text-[var(--accent-blue)] border-[var(--accent-blue)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')
            }
            onClick={() => setFilter(cat)}
            style={filter === cat && cat !== 'All' ? { color: CAT_COLORS[cat], borderColor: CAT_COLORS[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1" role="feed" aria-label="News articles">
        {filtered.map((article) => (
          <article
            key={article.id}
            className={
              'px-[11px] py-[9px] rounded-lg cursor-pointer transition-all duration-150 ' +
              'bg-[var(--surface-raised)] border ' +
              (expanded === article.id
                ? 'border-[rgba(59,130,246,0.3)]'
                : 'border-[var(--border)] hover:border-[var(--border-hover)]')
            }
            onClick={() => toggleExpanded(article.id)}
            aria-expanded={expanded === article.id}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-[6px]">
                <span
                  className="text-[0.65rem] font-bold uppercase tracking-[0.05em]"
                  style={{ color: CAT_COLORS[article.category] ?? '#888' }}
                >{article.category}</span>
                {article.trending && (
                  <span className="text-[0.62rem] text-[var(--accent-rose)]" aria-label="Trending">🔥 Trending</span>
                )}
              </div>
              <span className="text-[0.62rem] text-[var(--text-muted)]">{article.time}</span>
            </div>
            <h4 className="text-[0.78rem] font-medium text-[var(--text-primary)] leading-[1.35]">{article.title}</h4>

            {expanded === article.id && (
              <div className="mt-2 border-t border-[var(--border)] pt-2">
                <p className="text-[0.73rem] text-[var(--text-secondary)] leading-[1.5] mb-2">{article.summary}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[0.65rem] text-[var(--text-muted)] italic">{article.source}</span>
                  <a
                    href={article.url}
                    className="flex items-center gap-[3px] text-[0.68rem] text-[var(--accent-blue)] font-medium"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read full article: ${article.title}`}
                  >
                    Read more <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
});

NewsWidget.displayName = 'NewsWidget';
export default NewsWidget;
