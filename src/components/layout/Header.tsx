import React from 'react';

interface HeaderProps {
  activePage: 'forecast' | 'historical';
  onPageChange: (page: 'forecast' | 'historical') => void;
  location: string;
}


export const Header: React.FC<HeaderProps> = ({ activePage, onPageChange, location }) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 lg:px-6 py-4 lg:py-6 transition-all duration-700">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between gap-4 md:gap-6 rounded-3xl md:rounded-[2.5rem] px-4 md:px-8 py-2.5 md:py-3.5 shadow-2xl border border-white/5 bg-black/40 backdrop-blur-3xl">
          {/* Status Symbol Logo */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
             <div className="relative flex items-center justify-center">
                <div className="h-3 w-3 md:h-4 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(56,189,248,0.7)]"></div>
                <div className="absolute h-6 w-6 md:h-8 md:w-8 rounded-full border border-primary/20 animate-[ping_3s_infinite]"></div>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] md:text-[11px] font-black tracking-[0.4em] md:tracking-[0.6em] text-white uppercase leading-none">WEATHER APP</span>
             </div>
          </div>

          {/* Precision Sliding Page Switch */}
          <div className="relative p-1 bg-black/40 backdrop-blur-xl rounded-full md:rounded-4xl border border-white/5 flex items-center gap-1 shadow-inner h-11 md:h-14">
             <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] md:w-[calc(50%-6.5px)] bg-primary rounded-full md:rounded-[1.6rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${activePage === 'forecast' ? 'left-1' : 'left-[calc(50%+1px)]'}`}
             ></div>
             
             <button 
               onClick={() => onPageChange('forecast')}
               className={`relative z-10 px-4 md:px-8 py-1.5 md:py-2.5 rounded-full md:rounded-[1.6rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all duration-700 ${activePage === 'forecast' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Now
             </button>
             <button 
               onClick={() => onPageChange('historical')}
               className={`relative z-10 px-4 md:px-8 py-1.5 md:py-2.5 rounded-full md:rounded-[1.6rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all duration-700 ${activePage === 'historical' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Past
             </button>
          </div>

          {/* Location Identifier*/}
          <div className="hidden sm:flex items-center gap-3 md:gap-4 px-3 md:px-6 py-1.5 md:py-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 border-opacity-50 shadow-inner transition-all hover:bg-white/10 overflow-hidden max-w-[120px] md:max-w-none">
             <div className="flex flex-col items-end truncate">
                <span className="text-[9px] md:text-[11px] font-black tracking-widest md:tracking-[0.2em] text-emerald-400 uppercase leading-none truncate">{location}</span>
             </div>
             <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};
