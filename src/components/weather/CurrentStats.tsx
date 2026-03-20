import React from "react";
import { Card } from "../ui/Card";
import type { WeatherData } from "../../types/weather";

interface StatItemProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, unit, color }) => {
  if (value === null || value === undefined) return null;

  return (
    <div className="flex flex-col group animate-in">
      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1.5 group-hover:text-slate-400 transition-colors">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-3xl font-black text-white tabular-nums tracking-tight"
          style={{ color: color ? `${color}dd` : undefined }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

interface CurrentStatsProps {
  data: WeatherData | null;
  unit: "C" | "F";
  isToday: boolean;
}

/* Responsive Grid of weather variables with predictive data validation.*/
export const CurrentStats: React.FC<CurrentStatsProps> = ({
  data,
  unit,
  isToday,
}) => {
  if (!data) return null;

  const current = data.current;
  const daily = data.daily;
  const aq = data.airQuality?.current;

  // Temperature logic
  const temp =
    unit === "C"
      ? current?.temperature_2m
      : ((current?.temperature_2m * 9) / 5 + 32).toFixed(1);
  const tempMax =
    unit === "C"
      ? daily.temperature_2m_max[0]
      : ((daily.temperature_2m_max[0] * 9) / 5 + 32).toFixed(1);
  const tempMin =
    unit === "C"
      ? daily.temperature_2m_min[0]
      : ((daily.temperature_2m_min[0] * 9) / 5 + 32).toFixed(1);

  // Visibility logic - Only for 'Today' (Observations)
  const visKm = isToday && current?.visibility ? current.visibility / 1000 : null;
  const visPercent = visKm ? Math.min(100, (visKm / 60) * 100) : 0;

  // AQ logic - Only for 'Today' (Observations)
  const hasAQ = isToday && aq && aq.european_aqi !== null && aq.european_aqi !== undefined;
  
  // Choose between real-time and daily values
  const precipitation = isToday ? current?.precipitation : daily.precipitation_sum[0];
  const uvIndex = isToday ? current?.uv_index : daily.uv_index_max[0];
  const humidity = isToday ? current?.relative_humidity_2m : null; 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
      {/* 1. Temperature Section */}
      <Card className="lg:col-span-1 border-primary/10">
        <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-8">
          Temperature
        </h3>
        <div className="flex flex-col gap-10">
          {isToday && (
            <StatItem
              label="Current"
              value={temp}
              unit={`°${unit}`}
              color="#38bdf8"
            />
          )}
          <div
            className={`grid grid-cols-2 gap-6 ${isToday ? "pt-6 border-t border-white/5" : ""}`}
          >
            <StatItem
              label="Max"
              value={tempMax}
              unit={`°${unit}`}
              color="#f43f5e"
            />
            <StatItem
              label="Min"
              value={tempMin}
              unit={`°${unit}`}
              color="#38bdf8"
            />
          </div>
        </div>
      </Card>

      {/* 2. Atmospheric - Dynamic context switching */}
      <Card className="border-accent-cyan/10">
        <h3 className="text-xs font-black text-accent-cyan uppercase tracking-[0.4em] mb-8">
          {isToday ? "Atmospheric" : "Forecasted"}
        </h3>
        <div className="flex flex-col gap-8">
          <StatItem
            label={isToday ? "Precipitation" : "Total Precip"}
            value={precipitation}
            unit="mm"
          />
          <StatItem
            label="Rel. Humidity"
            value={humidity}
            unit="%"
          />
          <StatItem 
            label={isToday ? "UV Index" : "Max UV"} 
            value={uvIndex} 
          />
        </div>
      </Card>

      {/* 3. Sun Cycle & 4. Wind & Air */}
      <div className="flex flex-col gap-6">
        <Card className="flex-1 border-amber-500/10">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-6">
            Sun Cycle
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              label="Sunrise"
              value={
                daily.sunrise[0]
                  ? new Date(daily.sunrise[0]).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null
              }
            />
            <StatItem
              label="Sunset"
              value={
                daily.sunset[0]
                  ? new Date(daily.sunset[0]).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null
              }
            />
          </div>
        </Card>
        <Card className="flex-1 border-emerald-500/10">
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">
            Wind & Air
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              label="Max Wind"
              value={daily.wind_speed_10m_max[0]}
              unit="km/h"
            />
            <StatItem
              label="Prob Max"
              value={daily.precipitation_probability_max[0]}
              unit="%"
            />
          </div>
        </Card>
      </div>

      {/* 5. Visibility - Hidden for future dates as per data context */}
      {visKm !== null && (
        <Card className="border-indigo-400/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-8">
              Visibility
            </h3>
            <StatItem label="Live Range" value={visKm.toFixed(1)} unit="km" />
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full mt-8 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-indigo-300 transition-all duration-1000 rounded-full"
              style={{ width: `${visPercent}%` }}
            ></div>
          </div>
        </Card>
      )}

      {/* 6. Air Quality - Hidden for future dates */}
      {hasAQ && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 border-emerald-500/10 bg-emerald-500/2">
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-8">
            Air Quality Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-12 gap-x-6">
            <StatItem label="AQI" value={aq.european_aqi} />
            <StatItem label="PM10" value={aq.pm10} unit="µg/m³" />
            <StatItem label="PM2.5" value={aq.pm2_5} unit="µg/m³" />
            <StatItem label="CO" value={aq.carbon_monoxide} unit="µg/m³" />
            <StatItem label="CO2" value={aq.carbon_dioxide} unit="ppm" />
            <StatItem label="NO2" value={aq.nitrogen_dioxide} unit="µg/m³" />
            <StatItem label="SO2" value={aq.sulphur_dioxide} unit="µg/m³" />
          </div>
        </Card>
      )}
    </div>
  );
};
