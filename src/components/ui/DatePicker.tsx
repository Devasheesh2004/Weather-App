import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isAfter,
  startOfDay,
  setYear,
  getYear
} from 'date-fns';

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  maxDate?: Date;
  onClear?: () => void;
}

/**
 * Custom Calendar Picker with year selection
 */
export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, maxDate, onClear }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate day headers (Su - Sa)
  const daysHeader = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Year generation (Strictly limited to current year + past 2 years)
  const years = Array.from({ length: 3 }, (_, i) => getYear(new Date()) - i);

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
      >
        <span className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-widest">
          {format(currentMonth, 'MMMM, yyyy')}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-slate-500 group-hover:text-primary transition-transform duration-300 ${isYearPickerOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {!isYearPickerOpen && (
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  const renderYearPicker = () => (
    <div className="grid grid-cols-3 gap-2 p-4 animate-in fade-in zoom-in-95 duration-200">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => {
            setCurrentMonth(setYear(currentMonth, year));
            setIsYearPickerOpen(false);
          }}
          className={`py-3 rounded-xl text-xs font-black transition-all ${getYear(currentMonth) === year ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let daysList = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isDisabled = maxDate ? isAfter(startOfDay(cloneDay), startOfDay(maxDate)) : false;
        const isSelected = selected ? isSameDay(day, selected) : false;
        const inMonth = isSameMonth(day, monthStart);

        daysList.push(
          <div
            key={day.toString()}
            className={`
              relative h-9 flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer transition-all
              ${!inMonth ? 'text-slate-700 opacity-20' : 'text-slate-300'}
              ${isSelected ? 'bg-primary text-white shadow-lg z-10 scale-110' : 'hover:bg-white/5 hover:text-white'}
              ${isDisabled ? 'cursor-not-allowed opacity-10 pointer-events-none' : ''}
              ${isSameDay(day, new Date()) && !isSelected ? 'border border-primary/30' : ''}
            `}
            onClick={() => !isDisabled && onSelect(cloneDay)}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 px-2" key={day.toString()}>
          {daysList}
        </div>
      );
      daysList = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const renderFooter = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/1">
      <button 
        onClick={onClear} 
        className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-primary transition-colors"
      >
        Clear
      </button>
      <button 
        onClick={() => {
          const today = new Date();
          setCurrentMonth(today);
          onSelect(today);
        }} 
        className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary/70 transition-colors"
      >
        Today
      </button>
    </div>
  );

  return (
    <div className="bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)] w-[300px] overflow-hidden">
      {renderHeader()}
      {isYearPickerOpen ? (
        renderYearPicker()
      ) : (
        <div className="px-2 py-4">
          <div className="grid grid-cols-7 mb-2">
            {daysHeader.map((day, i) => (
              <div key={i} className="text-center text-[10px] font-black text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>
          {renderCells()}
        </div>
      )}
      {renderFooter()}
    </div>
  );
};

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  maxDate?: string;
}

/**
 * Dropdown-style Date Picker utilizing the Calendar component.
 */
export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : undefined;
  const max = maxDate ? new Date(maxDate) : new Date();

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-col">
        {label && <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">{label}</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-4 active:scale-95
            ${isOpen ? 'ring-2 ring-primary/30 border-primary/30 text-primary' : 'text-white hover:border-white/20'}
          `}
        >
          {value ? format(selectedDate!, 'MMM d, yyyy') : 'No Date Selected'}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 opacity-50 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-3 right-0 lg:left-0">
          <Calendar 
            selected={selectedDate} 
            maxDate={max}
            onSelect={(date) => {
              onChange(format(date, 'yyyy-MM-dd'));
              setIsOpen(false);
            }} 
            onClear={() => {
              onChange('');
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
