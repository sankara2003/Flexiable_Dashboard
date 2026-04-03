import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Calendar, Clock, Briefcase, Heart, User, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateCalendarEvents } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';
import { afterPaint } from '../../utils/afterPaint';

const TYPE_CONFIG = {
  work:     { color: '#6366f1', icon: Briefcase, label: 'Work'     },
  health:   { color: '#10b981', icon: Heart,     label: 'Health'   },
  personal: { color: '#f59e0b', icon: User,      label: 'Personal' },
};
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

/* ── Memoised event card ──────────────────────────────────────────── */
const EventItem = memo(({ event }) => {
  const cfg  = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.personal;
  const Icon = cfg.icon;
  return (
    <div
      className="flex items-center gap-[10px] px-[10px] py-2 rounded-lg transition-all duration-150
                 bg-[var(--surface-raised)] border border-[var(--border-hover)]
                 hover:border-[var(--border-hover)]"
      style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
      role="listitem"
    >
      <div
        className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${cfg.color}20`, color: cfg.color }}
        aria-hidden="true"
      >
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[0.78rem] font-medium text-[var(--text-primary)] truncate">{event.title}</span>
        <div className="flex items-center gap-1 text-[var(--text-muted)] mt-[2px]">
          <Clock size={11} aria-hidden="true" />
          <span className="text-[0.65rem]">{event.time} · {event.duration}</span>
        </div>
      </div>
      <span className="text-[0.62rem] font-semibold flex-shrink-0" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
});
EventItem.displayName = 'EventItem';

/* ── Tab button helper ───────────────────────────────────────────── */
const iconBtn =
  'w-[26px] h-[26px] flex items-center justify-center rounded-[6px] ' +
  'text-[var(--text-muted)] transition-all duration-150 ' +
  'hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]';

const CalendarWidget = memo(() => {
  const [events]       = useState(generateCalendarEvents);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [insight,      setInsight]      = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    const todayEvents = events.filter((e) => isSameDay(e.date, new Date()));
    afterPaint(() => generateInsight('calendar', todayEvents.map((e) => ({ title: e.title, time: e.time, type: e.type }))).then(setInsight));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateMonth = useCallback((dir) => {
    setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() + dir, 1));
  }, []);

  const days = useMemo(() => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const grid  = [];
    for (let i = 0; i < first; i++) grid.push(null);
    for (let i = 1; i <= total; i++) grid.push(new Date(y, m, i));
    return grid;
  }, [currentMonth]);

  const selectedEvents = useMemo(
    () => events.filter((e) => isSameDay(e.date, selectedDate)),
    [events, selectedDate]
  );

  const eventDateSet = useMemo(
    () => new Set(events.map((e) => e.date.toDateString())),
    [events]
  );

  const today      = useMemo(() => new Date(), []);
  const monthLabel = useMemo(
    () => currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [currentMonth]
  );
  const selectedLabel = useMemo(
    () => selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    [selectedDate]
  );

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <Calendar size={18} className="text-[var(--accent-indigo)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Calendar</h3>
        </div>
        <div className="flex items-center gap-[6px]" role="group" aria-label="Month navigation">
          <button className={iconBtn} onClick={() => navigateMonth(-1)} aria-label="Previous month"><ChevronLeft  size={14} /></button>
          <span className="text-[0.75rem] text-[var(--text-secondary)] font-mono" aria-live="polite">{monthLabel}</span>
          <button className={iconBtn} onClick={() => navigateMonth(1)}  aria-label="Next month"><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Calendar + Events side-by-side (stacked on small viewports) */}
      <div className="flex gap-3 flex-1 min-h-0 max-md:flex-col">

        {/* Mini calendar */}
        <div className="flex-shrink-0 w-[200px] max-md:w-full" role="grid" aria-label={monthLabel}>
          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-1" role="row">
            {WEEK_DAYS.map((d) => (
              <span key={d} className="text-center text-[0.62rem] font-semibold text-[var(--text-muted)] py-[3px]"
                role="columnheader" aria-label={d}>{d}</span>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-[2px]" role="rowgroup">
            {days.map((date, i) => {
              const isToday    = date && isSameDay(date, today);
              const isSelected = date && isSameDay(date, selectedDate);
              const hasEvent   = date && eventDateSet.has(date.toDateString());
              return (
                <button
                  key={i}
                  role="gridcell"
                  className={
                    'aspect-square flex flex-col items-center justify-center text-[0.7rem] rounded-md relative gap-[2px] transition-all duration-100 ' +
                    (!date
                      ? 'invisible'
                      : isSelected
                        ? 'bg-[var(--accent-indigo)] text-white font-bold'
                        : isToday
                          ? 'bg-[rgba(99,102,241,0.15)] text-[var(--accent-indigo)] font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]')
                  }
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  aria-label={date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : undefined}
                  aria-pressed={isSelected || undefined}
                >
                  {date?.getDate()}
                  {hasEvent && (
                    <span
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-[var(--accent-rose)]'}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between flex-shrink-0">
            <h4 className="text-[0.8rem] font-semibold text-[var(--text-primary)]">{selectedLabel}</h4>
            <span className="text-[0.65rem] text-[var(--text-muted)]" aria-live="polite">
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* AI insight — only shown for today */}
          {insight && isSameDay(selectedDate, today) && (
            <div
              className="flex items-start gap-[7px] px-[10px] py-2 rounded-lg flex-shrink-0 animate-fade-in
                         text-[0.72rem] leading-[1.4] text-[var(--text-secondary)]
                         bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.15)]"
              role="note"
            >
              <Sparkles size={11} className="text-[var(--accent-indigo)] flex-shrink-0 mt-[1px]" aria-hidden="true" />
              <span>{insight}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto flex flex-col gap-[5px]" role="list" aria-label="Events">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 h-full text-[var(--text-muted)]"
                aria-label="No events scheduled">
                <Calendar size={24} opacity={0.3} aria-hidden="true" />
                <p className="text-[0.75rem]">No events scheduled</p>
              </div>
            ) : (
              selectedEvents.map((event) => <EventItem key={event.id} event={event} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
