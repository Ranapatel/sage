'use client'

interface Props {
  weather: any
  destination: string
}

const CONDITION_ICONS: Record<string, string> = {
  'Sunny': '☀️', 'Clear': '☀️', 'Partly Cloudy': '⛅', 'Cloudy': '☁️',
  'Rain': '🌧️', 'Heavy Rain': '⛈️', 'Snow': '❄️', 'Windy': '💨',
  'Fog': '🌫️', 'Thunderstorm': '⛈️',
}

export default function WeatherWidget({ weather, destination }: Props) {
  const icon = CONDITION_ICONS[weather.condition] || '🌤️'
  const rainRisk = weather.percentage > 60 ? 'high' : weather.percentage > 30 ? 'medium' : 'low'
  const rainColor = rainRisk === 'high' ? 'text-red-400' : rainRisk === 'medium' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-[var(--text-primary)]">🌦️ Live Weather</h3>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span className="live-dot"></span>
          <span>Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <div>
          <div className="text-3xl font-bold font-mono text-[var(--text-primary)]">{weather.temperature}°C</div>
          <div className="text-sm text-[var(--text-secondary)]">{weather.condition}</div>
          <div className="text-xs text-[var(--text-muted)]">{destination}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className={`text-sm font-bold ${rainColor}`}>{weather.percentage}%</div>
          <div className="text-xs text-[var(--text-muted)]">Rain</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-blue-400">{weather.humidity}%</div>
          <div className="text-xs text-[var(--text-muted)]">Humidity</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-purple-400">{weather.wind} km/h</div>
          <div className="text-xs text-[var(--text-muted)]">Wind</div>
        </div>
      </div>

      {/* Rain risk alert */}
      {rainRisk === 'high' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
          <p className="text-red-400 text-xs font-semibold">⚠️ High rain probability — pack an umbrella!</p>
        </div>
      )}

      {/* Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-mono">3-Day Forecast</div>
          {weather.forecast.slice(0, 3).map((f: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--text-muted)]">{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day 3'}</span>
              <span>{CONDITION_ICONS[f.condition] || '🌤️'} {f.condition}</span>
              <span className="font-mono">
                <span className="text-red-400">{f.high}°</span>
                <span className="text-[var(--text-muted)]"> / </span>
                <span className="text-blue-400">{f.low}°</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[0.65rem] text-[var(--text-muted)] mt-3 font-mono">
        Updated: {new Date(weather.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}
