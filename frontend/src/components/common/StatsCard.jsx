import React, { useState, useEffect } from 'react';

export const StatsCard = ({
  icon: Icon,
  iconBg = 'bg-[#382322] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:text-[#261615]',
  cardBg = 'bg-white/95 dark:bg-[#201413]',
  title,
  value,
  trend,
  subtitle,
  themeIndex = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation for numeric values
  useEffect(() => {
    const numericPart = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(numericPart)) {
      setDisplayValue(value);
      return;
    }

    const hasCurrency = String(value).startsWith('₹') || String(value).startsWith('$');
    const prefix = hasCurrency ? String(value)[0] : '';

    let start = 0;
    const duration = 800;
    const steps = 20;
    const increment = numericPart / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericPart) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const formatted = Number.isInteger(numericPart)
          ? Math.floor(start)
          : start.toFixed(1);
        setDisplayValue(prefix ? `${prefix}${formatted}` : formatted);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  // Clean label: prefer title or trend, stripped of redundant "this month"
  const displayLabel = title || trend || '';

  return (
    <div
      className={`p-2.5 sm:p-4 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] sm:shadow-[3px_3px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 sm:gap-3.5 relative overflow-hidden group min-w-0 ${cardBg}`}
    >
      {/* Icon Badge */}
      <div className="relative shrink-0">
        <div
          className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1.5px_1.5px_0_#382322] dark:shadow-[1.5px_1.5px_0_#000] group-hover:scale-105 transition-transform duration-200 ${iconBg}`}
        >
          {Icon && (React.isValidElement(Icon) ? (
            Icon
          ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          ) : (
            <span className="text-sm sm:text-lg font-bold">{Icon}</span>
          ))}
        </div>
      </div>

      {/* Metric Value & Clean Label */}
      <div className="min-w-0 flex-1">
        <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#261615] dark:text-[#FDEBDE] tracking-tight leading-none font-mono truncate">
          {displayValue}
        </div>
        {displayLabel && (
          <div className="text-[10px] sm:text-xs font-bold text-[#382322]/80 dark:text-[#D4B8A8] mt-0.5 sm:mt-1 truncate uppercase tracking-wider font-mono">
            {displayLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
