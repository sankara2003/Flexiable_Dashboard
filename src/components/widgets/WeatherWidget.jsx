import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, Sparkles } from 'lucide-react';
import { mockWeatherData } from '../../data/mockData';
import { generateInsight } from '../../utils/aiInsights';

const WeatherIcon = ({ icon, size = 24 }) => {
  const icons = {
    'sun': <Sun size={size} />,
    'cloud-sun': <Cloud size={size} />,
    'cloud-rain': <CloudRain size={size} />,
    'cloud': <Cloud size={size} />,
  };
  return icons[icon] || <Sun size={size} />;
};

const WeatherWidget = () => {
  const [weather] = useState(mockWeatherData);
  const [insight, setInsight] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    generateInsight('weather', weather).then(setInsight);
  }, []);

  const hour = time.getHours();
  const isDay = hour >= 6 && hour < 20;

  return (
    <div className={`widget-inner weather-widget ${isDay ? 'day' : 'night'}`}>
      <div className="weather-bg-orb" />

      <div className="widget-header">
        <div className="widget-title-group">
          <Sun size={18} className="widget-icon weather-icon" />
          <h3>Weather</h3>
        </div>
        <span className="weather-city">{weather.city}</span>
      </div>

      <div className="weather-main">
        <div className="weather-icon-large">
          <WeatherIcon icon="cloud-sun" size={52} />
        </div>
        <div className="weather-temp-group">
          <span className="weather-temp">{weather.temp}°</span>
          <span className="weather-condition">{weather.condition}</span>
          <span className="weather-feels">Feels like {weather.feelsLike}°C</span>
        </div>
      </div>

      <div className="weather-stats">
        <div className="weather-stat">
          <Droplets size={13} />
          <span>{weather.humidity}%</span>
          <small>Humidity</small>
        </div>
        <div className="weather-stat">
          <Wind size={13} />
          <span>{weather.windSpeed}</span>
          <small>km/h</small>
        </div>
        <div className="weather-stat">
          <Eye size={13} />
          <span>{weather.visibility}</span>
          <small>km vis.</small>
        </div>
        <div className="weather-stat">
          <Sun size={13} />
          <span>UV {weather.uvIndex}</span>
          <small>Index</small>
        </div>
      </div>

      <div className="forecast-row">
        {weather.forecast.map((day, i) => (
          <div key={i} className={`forecast-day ${i === 0 ? 'today' : ''}`}>
            <span className="forecast-label">{day.day}</span>
            <WeatherIcon icon={day.icon} size={16} />
            <span className="forecast-high">{day.high}°</span>
            <span className="forecast-low">{day.low}°</span>
          </div>
        ))}
      </div>

      {insight && (
        <div className="ai-insight weather-insight">
          <Sparkles size={11} />
          <span>{insight}</span>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
