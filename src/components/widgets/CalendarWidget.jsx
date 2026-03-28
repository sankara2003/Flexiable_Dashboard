import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Briefcase, Heart, User, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateCalendarEvents } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';

const typeConfig = {
  work: { color: '#6366f1', icon: Briefcase, label: 'Work' },
  health: { color: '#10b981', icon: Heart, label: 'Health' },
  personal: { color: '#f59e0b', icon: User, label: 'Personal' },
};

const CalendarWidget = () => {
  const [events] = useState(generateCalendarEvents());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [insight, setInsight] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const todayEvents = events.filter(e => isSameDay(e.date, new Date()));
    generateInsight('calendar', todayEvents.map(e => ({ title: e.title, time: e.time, type: e.type }))).then(setInsight);
  }, []);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const selectedEvents = events.filter(e => isSameDay(e.date, selectedDate));
  const days = getDaysInMonth(currentMonth);

  const hasEvents = (date) => date && events.some(e => isSameDay(e.date, date));

  const navigateMonth = (dir) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  return (
    <div className="widget-inner calendar-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <Calendar size={18} className="widget-icon calendar-icon" />
          <h3>Calendar</h3>
        </div>
        <div className="calendar-nav">
          <button className="icon-btn" onClick={() => navigateMonth(-1)}><ChevronLeft size={14} /></button>
          <span className="month-label">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="icon-btn" onClick={() => navigateMonth(1)}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="mini-calendar">
          <div className="cal-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="weekday-label">{d}</span>
            ))}
          </div>
          <div className="cal-grid">
            {days.map((date, i) => (
              <button
                key={i}
                className={`cal-day ${!date ? 'empty' : ''} ${date && isSameDay(date, new Date()) ? 'today' : ''} ${date && isSameDay(date, selectedDate) ? 'selected' : ''}`}
                onClick={() => date && setSelectedDate(date)}
                disabled={!date}
              >
                {date?.getDate()}
                {date && hasEvents(date) && <span className="event-dot" />}
              </button>
            ))}
          </div>
        </div>

        <div className="events-panel">
          <div className="events-date-header">
            <h4>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
            <span className="event-count">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</span>
          </div>

          {insight && isSameDay(selectedDate, new Date()) && (
            <div className="ai-insight calendar-insight">
              <Sparkles size={11} />
              <span>{insight}</span>
            </div>
          )}

          <div className="events-list">
            {selectedEvents.length === 0 ? (
              <div className="no-events">
                <Calendar size={24} opacity={0.3} />
                <p>No events scheduled</p>
              </div>
            ) : (
              selectedEvents.map(event => {
                const config = typeConfig[event.type] || typeConfig.personal;
                const Icon = config.icon;
                return (
                  <div key={event.id} className="event-item" style={{ borderLeftColor: config.color }}>
                    <div className="event-icon" style={{ background: `${config.color}20`, color: config.color }}>
                      <Icon size={13} />
                    </div>
                    <div className="event-details">
                      <span className="event-title">{event.title}</span>
                      <div className="event-meta">
                        <Clock size={11} />
                        <span>{event.time} · {event.duration}</span>
                      </div>
                    </div>
                    <span className="event-type-badge" style={{ color: config.color }}>{config.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
