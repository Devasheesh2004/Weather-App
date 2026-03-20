import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { CurrentStats } from "./components/weather/CurrentStats";
import { HourlyCharts } from "./components/weather/HourlyCharts";
import { HistoryTrends } from "./components/historical/HistoryTrends";
import { useLocation } from "./hooks/useLocation";
import { fetchWeather, fetchHistoricalWeather } from "./services/weatherService";
import { format, subDays, addDays } from "date-fns";
import { DatePicker } from "./components/ui/DatePicker";
import type { WeatherData, HistoryData } from "./types/weather";

/* Weather App Interface.*/
function App() {
  const [activePage, setActivePage] = useState<"forecast" | "historical">("forecast");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  const [historyRange, setHistoryRange] = useState({
    start: format(subDays(new Date(), 35), "yyyy-MM-dd"),
    end: format(subDays(new Date(), 5), "yyyy-MM-dd"),
  });

  const { lat, lon, city } = useLocation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      label: i === 0 ? "Today" : format(d, "EEE"),
      full: format(d, "yyyy-MM-dd"),
      day: format(d, "d"),
    };
  });

  useEffect(() => {
    if (lat !== null && lon !== null && activePage === "forecast") {
      const loadWeather = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchWeather(lat, lon, selectedDate);
          setWeatherData(data as WeatherData);
          setLoading(false);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Service timeout issue.");
          setLoading(false);
        }
      };
      loadWeather();
    }
  }, [lat, lon, selectedDate, activePage]);

  useEffect(() => {
    if (lat !== null && lon !== null && activePage === "historical") {
      const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const s = new Date(historyRange.start);
          const e = new Date(historyRange.end);
          if ((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 365) > 2) {
            setError("Selected window exceeds 24-month analysis threshold.");
            setLoading(false);
            return;
          }
          const data = await fetchHistoricalWeather(lat, lon, historyRange.start, historyRange.end);
          setHistoryData(data as HistoryData);
          setLoading(false);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Historical data sync issue.");
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [lat, lon, historyRange, activePage]);

  return (
    <div className="min-h-screen gradient-dark text-slate-100 flex flex-col font-sans transition-all duration-700">
      <Header
        activePage={activePage}
        onPageChange={setActivePage}
        location={city || "Tracking..."}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-16">
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Header Area with Title & Unit Toggles*/}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-10">
            <div className="pointer-events-none">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tightest text-white leading-none pointer-events-auto">
                {activePage === "forecast" ? "FORECAST" : "ARCHIVE"}
              </h1>
              <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mt-4 md:mt-6 ml-0.5 flex items-center gap-3 md:gap-4 pointer-events-auto">
                 <span className="w-8 md:w-10 h-px bg-white/10"></span>
                 {activePage === "forecast" ? "PROGNOSTIC MAPPING" : "CHRONOLOGICAL ENGINE"}
              </p>
            </div>

            <div className="flex items-center">
              {/* Unit Toggle */}
              <div className="relative p-1 md:p-1.5 bg-black/60 backdrop-blur-2xl rounded-full md:rounded-4xl border border-white/5 flex items-center gap-1 shadow-2xl h-11 md:h-14">
                 <div 
                    className={`absolute inset-y-1 md:inset-y-1.5 w-[calc(50%-4px)] md:w-[calc(50%-6px)] bg-primary rounded-full md:rounded-[1.6rem] transition-all duration-500 ease-out shadow-lg ${unit === 'C' ? 'left-1 md:left-1.5' : 'left-[calc(50%+1px)] md:left-[calc(50%+1.5px)]'}`}
                 ></div>
                 
                 <button 
                   onClick={() => setUnit("C")} 
                   className={`relative z-10 px-4 md:px-8 py-2 md:py-3.5 text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] transition-colors duration-500 rounded-full md:rounded-[1.6rem] ${unit === 'C' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   CELSIUS
                 </button>
                 <button 
                   onClick={() => setUnit("F")} 
                   className={`relative z-10 px-4 md:px-8 py-2 md:py-3.5 text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] transition-colors duration-500 rounded-full md:rounded-[1.6rem] ${unit === 'F' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   FAHRENHEIT
                 </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls Area */}
          <div className="flex flex-col gap-6">
            {activePage === "forecast" ? (
              /* Forecast Date Picker Container */
              <div className="bg-black/80 backdrop-blur-xl p-1.5 md:p-2 rounded-2xl md:rounded-4xl max-w-full overflow-x-auto scrollbar-hide shadow-2xl">
                <div className="flex gap-1.5 md:gap-2 min-w-max px-0.5">
                  {upcomingDays.map((day) => (
                    <button
                      key={day.full}
                      onClick={() => setSelectedDate(day.full)}
                      className={`min-w-[75px] md:min-w-[85px] flex flex-col items-center justify-center py-4 md:py-5 px-3 md:px-5 rounded-xl md:rounded-2xl transition-all duration-500 ${selectedDate === day.full ? "bg-primary text-white shadow-xl scale-105 md:scale-110" : "text-slate-600 hover:text-white hover:bg-white/5"}`}
                    >
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 opacity-40 leading-none">
                        {day.label}
                      </span>
                      <span className="text-lg md:text-xl font-black tabular-nums">{day.day}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Archive Region Logic Controls */
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 min-h-[44px]">
                 <div className="flex flex-wrap items-center gap-3 md:gap-4 animate-slide-up duration-700">
                    <DatePicker 
                      label="ARCHIVE_START" 
                      value={historyRange.start} 
                      onChange={(val) => setHistoryRange(prev => ({ ...prev, start: val }))} 
                      maxDate={todayStr}
                    />
                    <div className="hidden sm:block w-6 md:w-8 h-px bg-white/10 mt-6 md:mt-4"></div>
                    <DatePicker 
                      label="ARCHIVE_END" 
                      value={historyRange.end} 
                      onChange={(val) => setHistoryRange(prev => ({ ...prev, end: val }))} 
                      maxDate={todayStr}
                    />
                 </div>
              </div>
            )}
          </div>

          {/* Core Weather Viewport*/}
          {loading ? (
            <div className="py-24 md:py-40 flex flex-col items-center gap-6 md:gap-8 animate-pulse">
               <div className="w-12 md:w-16 h-12 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="text-[8px] md:text-[10px] font-black tracking-[1em] md:tracking-[1.5em] text-primary/60 uppercase">Synchronizing</p>
            </div>
          ) : error ? (
            <div className="border border-red-500/10 bg-red-500/4 text-red-500 px-6 py-6 md:px-10 md:py-8 rounded-2xl md:rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-4 md:gap-5 shadow-2xl">
              <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></div>
              <span className="leading-relaxed">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-12 md:gap-32">
              {activePage === "forecast" && weatherData && (
                <>
                  <CurrentStats
                    data={weatherData}
                    unit={unit}
                    isToday={selectedDate === todayStr}
                  />
                  <div className="h-px w-full bg-linear-to-r from-transparent via-white/5 to-transparent"></div>
                  <HourlyCharts data={weatherData} unit={unit} />
                </>
              )}
              {activePage === "historical" && historyData && (
                <HistoryTrends data={historyData} unit={unit} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
