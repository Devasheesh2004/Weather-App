import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Card } from '../ui/Card';
import type { WeatherData } from '../../types/weather';

interface HourlyChartsProps {
  data: WeatherData | null;
  unit: 'C' | 'F';
}

interface ChartDataItem {
  time: string;
  temp: number;
  humidity: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  pm10: number;
  pm25: number;
}

interface ChartContainerProps {
  title: string;
  color: string;
  dataKey: string;
  chartData: ChartDataItem[];
  yUnit?: string;
  type?: "area" | "line";
  children?: React.ReactNode;
}

/**
 * Reusable chart wrapper component.
 */
const ChartContainer: React.FC<ChartContainerProps> = ({ title, color, dataKey, chartData, yUnit = '', type = "area", children }) => (
  <Card className="h-[400px] flex flex-col gap-6 group hover:border-white/20 transition-all duration-500">
    <div className="flex items-center justify-between">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{title}</h3>
      <div className="h-1 w-8 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors"></div>
    </div>
    
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="time" 
              stroke="#ffffff20" 
              fontSize={9} 
              tickLine={false}
              axisLine={false}
              dy={10}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis 
              stroke="#ffffff20" 
              fontSize={9} 
              unit={yUnit} 
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '16px', 
                fontSize: '11px',
                fontWeight: '900',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
              itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color-${dataKey})`} 
              strokeWidth={3}
              animationDuration={1500}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            {children}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  </Card>
);

/**
 * Static Hourly Charts for weather variables.
 */
export const HourlyCharts: React.FC<HourlyChartsProps> = ({ data, unit }) => {
  if (!data || !data.hourly) return null;

  const hourly = data.hourly;
  
  const chartData = hourly.time.map((time: string, index: number) => {
    const temp = unit === 'C' ? hourly.temperature_2m[index] : (hourly.temperature_2m[index] * 9/5 + 32).toFixed(1);
    return {
      time: new Date(time).toLocaleTimeString([], { hour: '2-digit' }),
      temp: parseFloat(temp as string),
      humidity: hourly.relative_humidity_2m[index],
      precipitation: hourly.precipitation[index],
      visibility: hourly.visibility[index] / 1000,
      windSpeed: hourly.wind_speed_10m[index],
      pm10: data.airQuality.hourly.pm10[index],
      pm25: data.airQuality.hourly.pm2_5[index],
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-slide-up">
      <ChartContainer title={`TEMPERATE_CHART (°${unit})`} color="#38bdf8" dataKey="temp" chartData={chartData} yUnit={`°${unit}`} />
      <ChartContainer title="HUMIDITY_MATRIX (%)" color="#22d3ee" dataKey="humidity" chartData={chartData} yUnit="%" />
      <ChartContainer title="PRECIPITATION_FLOW (mm)" color="#6366f1" dataKey="precipitation" chartData={chartData} yUnit="mm" />
      <ChartContainer title="VISUAL_RANGE (km)" color="#10b981" dataKey="visibility" chartData={chartData} yUnit="km" />
      <ChartContainer title="WIND_VELOCITY (km/h)" color="#f43f5e" dataKey="windSpeed" chartData={chartData} yUnit="km/h" />
      
      <Card className="h-[400px] flex flex-col gap-6 group hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">AIR_QUALITY_INDEX</h3>
          <div className="h-1 w-8 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors"></div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="time" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} interval={Math.floor(chartData.length / 6)} />
              <YAxis stroke="#ffffff20" fontSize={9} unit="µg/m³" tickLine={false} axisLine={false} dx={-5} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px', 
                  fontSize: '11px',
                  fontWeight: '900',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
                itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
              <Line type="monotone" dataKey="pm10" stroke="#f43f5e" strokeWidth={3} dot={false} animationDuration={1500} />
              <Line type="monotone" dataKey="pm25" stroke="#fbbf24" strokeWidth={3} dot={false} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
