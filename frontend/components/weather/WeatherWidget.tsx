'use client'

import React from 'react'
import { Sun, CloudSun, CloudRain, CloudLightning, Snowflake, Wind, CloudFog, Cloud, AlertTriangle } from 'lucide-react'

interface Props {
  weather: any
  destination: string
}

function getWeatherIcon(condition: string) {
  const c = condition?.toLowerCase() || ''
  if (c.includes('rain')) return <CloudRain className="text-blue-500" size={32} />
  if (c.includes('thunder') || c.includes('lightning')) return <CloudLightning className="text-amber-500" size={32} />
  if (c.includes('snow')) return <Snowflake className="text-cyan-400" size={32} />
  if (c.includes('wind')) return <Wind className="text-slate-400" size={32} />
  if (c.includes('fog')) return <CloudFog className="text-slate-400" size={32} />
  if (c.includes('cloud')) return <CloudSun className="text-amber-400" size={32} />
  return <Sun className="text-amber-500" size={32} />
}

export default function WeatherWidget({ weather, destination }: Props) {
  const rainRisk = weather.percentage > 60 ? 'high' : weather.percentage > 30 ? 'medium' : 'low'
  const rainColor = rainRisk === 'high' ? 'text-red-500' : rainRisk === 'medium' ? 'text-amber-500' : 'text-emerald-500'

  return (
    <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <CloudSun className="text-[#EA580C]" size={18} />
          <span>Live Weather</span>
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          {getWeatherIcon(weather.condition)}
        </div>
        <div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 leading-tight">{weather.temperature}°C</div>
          <div className="text-xs font-semibold text-slate-600">{weather.condition}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{destination}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <div className="text-center">
          <div className={`text-xs font-bold ${rainColor}`}>{weather.percentage}%</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Rain</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-blue-600">{weather.humidity}%</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Humidity</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-purple-600">{weather.wind} km/h</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Wind</div>
        </div>
      </div>

      {/* Rain risk alert */}
      {rainRisk === 'high' && (
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-2.5 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-xs font-semibold">High rain probability — pack umbrella!</p>
        </div>
      )}

      {/* Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">3-Day Forecast</div>
          {weather.forecast.slice(0, 3).map((f: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-500 font-medium">{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day 3'}</span>
              <span className="text-slate-700 font-semibold">{f.condition}</span>
              <span className="font-mono text-xs font-bold">
                <span className="text-red-500">{f.high}°</span>
                <span className="text-slate-300"> / </span>
                <span className="text-blue-500">{f.low}°</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
