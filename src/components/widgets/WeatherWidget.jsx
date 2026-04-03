import { useState, useEffect, useMemo, memo } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Sparkles } from 'lucide-react';
import { mockWeatherData } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';
import { afterPaint } from '../../utils/afterPaint';

const WEATHER_ICONS = {
  'sun':        (size) => <Sun       size={size} />,
  'cloud-sun':  (size) => <Cloud     size={size} />,
  'cloud-rain': (size) => <CloudRain size={size} />,
  'cloud':      (size) => <Cloud     size={size} />,
};
const WeatherIcon = memo(({ icon, size = 24 }) => (WEATHER_ICONS[icon] ?? WEATHER_ICONS['sun'])(size));
WeatherIcon.displayName = 'WeatherIcon';

const WeatherWidget = memo(() => {
  const [insight, setInsight] = useState('');
  const [time,    setTime]    = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    afterPaint(() => generateInsight('weather', mockWeatherData).then(setInsight));
  }, []);

  const isDay = useMemo(() => { const h = time.getHours(); return h >= 6 && h < 20; }, [time]);

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden relative">

      {/* Decorative orb — inline style for complex radial gradient */}
      <div
        className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <Sun size={18} className="text-[var(--accent-amber)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Weather</h3>
        </div>
        <span className="text-[0.72rem] text-[var(--text-muted)] font-mono" aria-label={`Location: ${mockWeatherData.city}`}>
          {mockWeatherData.city}
        </span>
      </div>

      {/* Main temp display */}
      <div className="flex items-center gap-[14px] flex-shrink-0"
        aria-label={`${mockWeatherData.temp}° ${mockWeatherData.condition}`}>
        <div className={`text-[var(--accent-amber)] opacity-90 ${isDay ? '' : 'opacity-60'}`} aria-hidden="true">
          <WeatherIcon icon="cloud-sun" size={52} />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[1.4rem] font-extrabold text-[var(--text-primary)] leading-none tracking-[-0.03em]">
            {mockWeatherData.temp}°
          </span>
          <span className="text-[0.82rem] text-[var(--text-secondary)] mt-[2px]">{mockWeatherData.condition}</span>
          <span className="text-[0.68rem] text-[var(--text-muted)]">Feels like {mockWeatherData.feelsLike}°C</span>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="flex flex-shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg overflow-hidden"
        role="list" aria-label="Weather statistics"
      >
        {[
          { Icon: Droplets, val: `${mockWeatherData.humidity}%`,        lbl: 'Humidity' },
          { Icon: Wind,     val: mockWeatherData.windSpeed,              lbl: 'km/h'     },
          { Icon: Eye,      val: mockWeatherData.visibility,             lbl: 'km vis.'  },
          { Icon: Sun,      val: `UV ${mockWeatherData.uvIndex}`,        lbl: 'Index'    },
        ].map(({ Icon, val, lbl }, i, arr) => (
          <div
            key={lbl}
            className={
              'flex-1 flex flex-col items-center gap-[2px] py-2 px-1 text-[var(--text-secondary)] ' +
              (i < arr.length - 1 ? 'border-r border-[var(--border)]' : '')
            }
            role="listitem"
          >
            <Icon size={13} className="text-[var(--accent-amber)] opacity-70" aria-hidden="true" />
            <span className="font-mono text-[0.75rem] font-medium text-[var(--text-primary)]">{val}</span>
            <small className="text-[0.6rem] text-[var(--text-muted)]">{lbl}</small>
          </div>
        ))}
      </div>

      {/* 5-day forecast */}
      <div className="flex gap-1 flex-shrink-0" role="list" aria-label="5-day forecast">
        {mockWeatherData.forecast.map((day, i) => (
          <div
            key={i}
            className={
              'flex-1 flex flex-col items-center gap-[3px] py-[7px] px-1 rounded-lg ' +
              (i === 0
                ? 'bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)]'
                : 'bg-[var(--surface-raised)] border border-[var(--border)]')
            }
            role="listitem"
            aria-label={`${day.day}: high ${day.high}°, low ${day.low}°`}
          >
            <span className="text-[0.65rem] text-[var(--text-muted)] font-semibold">{day.day}</span>
            <WeatherIcon icon={day.icon} size={16} />
            <span className="text-[0.72rem] font-semibold text-[var(--text-primary)]">{day.high}°</span>
            <span className="text-[0.65rem] text-[var(--text-muted)]">{day.low}°</span>
          </div>
        ))}
      </div>

      {/* AI insight */}
      {insight && (
        <div
          className="flex items-start gap-[7px] px-[10px] py-2 rounded-lg flex-shrink-0 animate-fade-in
                     text-[0.72rem] leading-[1.4] text-[var(--text-secondary)]
                     bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)]"
          role="note"
        >
          <Sparkles size={11} className="text-[var(--accent-amber)] flex-shrink-0 mt-[1px]" aria-hidden="true" />
          <span>{insight}</span>
        </div>
      )}
    </div>
  );
});

WeatherWidget.displayName = 'WeatherWidget';
export default WeatherWidget;
