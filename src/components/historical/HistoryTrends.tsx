import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { Card } from '../ui/Card';
import type { HistoryData } from '../../types/weather';

interface HistoryTrendsProps {
  data: HistoryData | null;
  unit: 'C' | 'F';
}

interface TrendItem {
  date: string;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  sunrise: string;
  sunset: string;
}

interface AQTrendItem {
  date: string;
  pm10: number;
  pm25: number;
}

export const HistoryTrends: React.FC<HistoryTrendsProps> = ({ data, unit }) => {
  if (!data || !data.history) return null;

  const history = data.history.daily;
  const aqHistory = data.aqHistory.hourly;

  const trendData: TrendItem[] = history.time.map((time: string, index: number) => ({
    date: new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    tempMax: parseFloat((unit === 'C' ? history.temperature_2m_max[index] : (history.temperature_2m_max[index] * 9/5 + 32)).toFixed(1)),
    tempMin: parseFloat((unit === 'C' ? history.temperature_2m_min[index] : (history.temperature_2m_min[index] * 9/5 + 32)).toFixed(1)),
    tempMean: parseFloat((unit === 'C' ? history.temperature_2m_mean[index] : (history.temperature_2m_mean[index] * 9/5 + 32)).toFixed(1)),
    precipitation: history.precipitation_sum[index],
    windSpeed: history.wind_speed_10m_max[index],
    windDirection: history.wind_direction_10m_dominant[index],
    sunrise: new Date(new Date(history.sunrise[index]).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(new Date(history.sunset[index]).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  const aqTrendData: AQTrendItem[] = aqHistory.time
    .filter((_: string, i: number) => i % 24 === 0)
    .map((time: string, index: number) => ({
      date: new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      pm10: aqHistory.pm10[index * 24],
      pm25: aqHistory.pm2_5[index * 24],
    }));

  const totalPrecip = history.precipitation_sum.reduce((a: number, b: number) => a + b, 0).toFixed(1);
  const avgMaxTemp = (history.temperature_2m_max.reduce((a: number, b: number) => a + b, 0) / history.temperature_2m_max.length);
  const avgMinTemp = (history.temperature_2m_min.reduce((a: number, b: number) => a + b, 0) / history.temperature_2m_min.length);
  
  const displayAvgMax = unit === 'C' ? avgMaxTemp.toFixed(1) : (avgMaxTemp * 9/5 + 32).toFixed(1);
  const displayAvgMin = unit === 'C' ? avgMinTemp.toFixed(1) : (avgMinTemp * 9/5 + 32).toFixed(1);

  const tooltipStye = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '900',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    color: '#fff'
  };

  return (
    <div className="flex flex-col gap-12 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-3 group overflow-hidden border-primary/20">
           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">Temperature range</h4>
           <div className="text-3xl font-black text-white">{displayAvgMax}/{displayAvgMin}°{unit}</div>
           <div className="h-0.5 w-12 bg-primary mt-2"></div>
        </Card>
        <Card className="flex flex-col gap-3 group overflow-hidden border-indigo-500/20">
           <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">Total Precipitation</h4>
           <div className="text-3xl font-black text-white">{totalPrecip} <span className="text-xs text-indigo-500">mm</span></div>
           <div className="h-0.5 w-12 bg-indigo-500 mt-2"></div>
        </Card>
        <Card className="flex flex-col gap-3 group overflow-hidden border-emerald-500/20">
           <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">Peak Wind Speed</h4>
           <div className="text-3xl font-black text-white">{Math.max(...history.wind_speed_10m_max)} <span className="text-xs text-emerald-500">km/h</span></div>
           <div className="h-0.5 w-12 bg-emerald-500 mt-2"></div>
        </Card>
        <Card className="flex flex-col gap-3 group overflow-hidden border-slate-500/20">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">Mean Direction</h4>
           <div className="text-3xl font-black text-white">{Math.round(history.wind_direction_10m_dominant.reduce((a: number, b: number) => a + b, 0) / history.wind_direction_10m_dominant.length)}<span className="text-xs text-slate-500">°</span></div>
           <div className="h-0.5 w-12 bg-slate-500 mt-2"></div>
        </Card>
      </div>

      <Card className="h-[400px] flex flex-col gap-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Temperature Narrative (Max, Mean, Min)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} interval={Math.floor(trendData.length / 8)} />
            <YAxis stroke="#ffffff20" fontSize={9} unit={`°${unit}`} tickLine={false} axisLine={false} dx={-5} />
            <Tooltip contentStyle={tooltipStye} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
            <Line type="monotone" dataKey="tempMax" stroke="#f43f5e" strokeWidth={3} dot={false} name="Max temp" animationDuration={2000} />
            <Line type="monotone" dataKey="tempMean" stroke="#38bdf8" strokeWidth={3} dot={false} name="Mean temp" animationDuration={2000} />
            <Line type="monotone" dataKey="tempMin" stroke="#10b981" strokeWidth={3} dot={false} name="Min temp" animationDuration={2000} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-[400px] flex flex-col gap-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Precipitation Intensity Range</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} interval={Math.floor(trendData.length / 8)} />
              <YAxis stroke="#ffffff20" fontSize={9} unit="mm" tickLine={false} axisLine={false} dx={-5} />
              <Tooltip contentStyle={tooltipStye} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar dataKey="precipitation" fill="#6366f1" radius={[6, 6, 0, 0]} name="Daily Precp" animationDuration={2000} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-[400px] flex flex-col gap-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Wind Magnitude Peaks</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} interval={Math.floor(trendData.length / 8)} />
              <YAxis stroke="#ffffff20" fontSize={9} unit="km/h" tickLine={false} axisLine={false} dx={-5} />
              <Tooltip contentStyle={tooltipStye} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="windSpeed" stroke="#10b981" fillOpacity={1} fill="url(#colorWind)" strokeWidth={3} name="Max Wind" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-[400px] lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Historical Particulate Matter Levels</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aqTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} interval={Math.floor(aqTrendData.length / 8)} />
              <YAxis stroke="#ffffff20" fontSize={9} unit="µg/m³" tickLine={false} axisLine={false} dx={-5} />
              <Tooltip contentStyle={tooltipStye} itemStyle={{ color: '#fff' }} />
              <Legend verticalAlign="top" height={42} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
              <Line type="monotone" dataKey="pm10" stroke="#f43f5e" strokeWidth={3} dot={false} name="PM10 Level" animationDuration={2000} />
              <Line type="monotone" dataKey="pm25" stroke="#fbbf24" strokeWidth={3} dot={false} name="PM2.5 Level" animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="flex flex-col gap-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Solar Cycle Timeline (IST)</h3>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm text-slate-400 border-separate border-spacing-0">
            <thead className="uppercase text-[9px] font-black tracking-[0.3em] text-slate-600">
              <tr>
                <th className="px-6 py-4 border-b border-white/5 bg-white/2">Observational Date</th>
                <th className="px-6 py-4 border-b border-white/5 bg-white/2">Sunrise (IST)</th>
                <th className="px-6 py-4 border-b border-white/5 bg-white/2">Sunset (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trendData.slice(0, 31).map((row: TrendItem, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-all duration-300 group cursor-pointer">
                  <td className="px-6 py-4 text-white font-black text-base tabular-nums">{row.date}</td>
                  <td className="px-6 py-4 text-amber-400 group-hover:text-amber-300 transition-colors uppercase font-black text-xs tracking-widest">{row.sunrise}</td>
                  <td className="px-6 py-4 text-rose-500 group-hover:text-rose-400 transition-colors uppercase font-black text-xs tracking-widest">{row.sunset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
