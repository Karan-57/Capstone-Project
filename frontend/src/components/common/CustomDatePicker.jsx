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
        className={`w-full px-3.5 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-left flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0_#382322] ${
          isOpen
            ? 'ring-2 ring-[#FFEBAA]'
            : 'hover:bg-[#FDEBDE] dark:hover:bg-[#2A1B19]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA] shrink-0" />
          <span className={`truncate font-bold font-mono ${value ? 'text-[#261615] dark:text-[#FDEBDE]' : 'text-[#5C3A38] dark:text-[#D4B8A8]'}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) onChange('');
            }}
            className="p-1 hover:bg-[#FFEBAA] dark:hover:bg-[#382322] text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FFEBAA] transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[6px_6px_0_#382322] dark:shadow-[6px_6px_0_#000] text-[#261615] dark:text-[#FDEBDE] animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-wide">
              {monthNames[month]} <span className="font-mono text-[#8A5200] dark:text-[#FFEBAA]">{year}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 border border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 border border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] uppercase tracking-wider py-1">
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
                className="h-8 flex items-center justify-center text-[11px] font-mono text-[#5C3A38]/40 dark:text-[#D4B8A8]/40 select-none"
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
                  className={`h-8 text-xs font-mono font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                    selected
                      ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] scale-105'
                      : disabledDay
                      ? 'text-[#5C3A38]/30 dark:text-[#D4B8A8]/30 cursor-not-allowed'
                      : 'text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19]'
                  } ${today && !selected ? 'border border-[#382322] dark:border-[#FFEBAA] text-[#261615] dark:text-[#FFEBAA]' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts / Helper row */}
          <div className="mt-3 pt-2.5 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between text-[11px] font-mono">
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
              className="font-bold uppercase tracking-wider text-[#8A5200] dark:text-[#FFEBAA] hover:underline cursor-pointer"
            >
              Today
            </button>
            {maxDate && (
              <span className="text-[#5C3A38] dark:text-[#D4B8A8] text-[10px]">
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
