import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Custom DatePicker component styled in Collabo dark glassmorphism theme.
 * Replaces native browser date inputs with an interactive calendar popover.
 *
 * @param {string} value - YYYY-MM-DD string
 * @param {function} onChange - Callback receiving (newDateString)
 * @param {string} minDate - Optional minimum date YYYY-MM-DD
 * @param {string} maxDate - Optional maximum date YYYY-MM-DD
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Optional container styling
 * @param {boolean} disabled - Disabled state
 */
export const CustomDatePicker = ({
  value = '',
  onChange,
  minDate = '',
  maxDate = '',
  placeholder = 'Select deadline date...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial view month & year from current value or today
  const getInitialDate = () => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState(getInitialDate());

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Days calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handleSelectDay = (day) => {
    const selected = new Date(year, month, day);
    const dateStr = selected.toISOString().split('T')[0];
    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === day
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isDisabled = (day) => {
    const current = new Date(year, month, day);
    const currentStr = current.toISOString().split('T')[0];
    if (minDate && currentStr < minDate) return true;
    if (maxDate && currentStr > maxDate) return true;
    return false;
  };

  // Format display string
  const formatDisplay = (val) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? 'border-purple-500 ring-2 ring-purple-500/20 text-white'
            : 'border-white/[0.08] hover:border-white/[0.16] text-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-purple-400 shrink-0" />
          <span className={`truncate font-medium ${value ? 'text-white' : 'text-slate-400'}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) onChange('');
            }}
            className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 p-3.5 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-purple-950/50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-white tracking-wide">
              {monthNames[month]} <span className="text-purple-400">{year}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Days from previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <span
                key={`prev-${idx}`}
                className="h-8 flex items-center justify-center text-[11px] text-slate-600 select-none"
              >
                {daysInPrevMonth - firstDayOfMonth + idx + 1}
              </span>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              const disabledDay = isDisabled(day);

              return (
                <button
                  type="button"
                  key={`day-${day}`}
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center relative ${
                    selected
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/50 scale-105'
                      : disabledDay
                      ? 'text-slate-600 cursor-not-allowed opacity-40'
                      : 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                  } ${today && !selected ? 'border border-purple-500/50 text-purple-300 font-semibold' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts / Helper row */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                if (!minDate || todayStr >= minDate) {
                  if (!maxDate || todayStr <= maxDate) {
                    if (onChange) onChange(todayStr);
                    setIsOpen(false);
                  }
                }
              }}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium cursor-pointer"
            >
              Today
            </button>
            {maxDate && (
              <span className="text-slate-400 text-[10px]">
                Max: {formatDisplay(maxDate)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
