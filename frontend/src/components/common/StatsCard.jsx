import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({
  icon: Icon,
  iconBg = 'bg-[#382322] text-[#FFEBAA]',
  cardBg = 'bg-white/90',
  title,
  value,
  trend,
  isPositive = true,
  subtitle = 'this month',
  sparklineData = [10, 18, 14, 25, 22, 32, 28, 42],
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
    const duration = 1000;
    const steps = 24;
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

  // Mini sparkline SVG path builder
  const sparkWidth = 72;
  const sparkHeight = 26;
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * sparkWidth;
      const y = sparkHeight - ((val - min) / range) * (sparkHeight - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  // Rotating subtle card themes if cardBg not specified
  const themeBgClasses = [
    'bg-[#B1C8EA]/50', // Powder blue tint
    'bg-[#FFEBAA]/50', // Butter yellow tint
    'bg-white/90',     // Warm paper white
    'bg-[#FDEBDE]',    // Warm blush
  ];
  const actualBg = cardBg !== 'bg-white/90' ? cardBg : themeBgClasses[themeIndex % themeBgClasses.length];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] hover:shadow-[4px_4px_0_#382322] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 relative overflow-hidden group ${actualBg}`}>
      {/* Editorial corner stamp / tape simulation */}
      <div className="absolute -top-1.5 right-6 w-8 h-3 bg-[#FFEBAA]/80 border border-[#382322]/20 rotate-[-4deg] pointer-events-none" />

      {/* Left Column: Icon & Metric */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon Badge */}
        <div className="relative">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#382322] shadow-[2px_2px_0_#382322] group-hover:scale-105 transition-transform duration-200 ${iconBg}`}>
            {Icon && (React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? (
              <Icon className="w-5 h-5" />
            ) : (
              <span className="text-lg font-bold">{Icon}</span>
            ))}
          </div>
          {/* Active dot */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#382322] ring-2 ring-[#FFEBAA]" />
        </div>

        {/* Value and Title */}
        <div className="min-w-0">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#382322] tracking-tight leading-none font-mono">
            {displayValue}
          </div>
          <div className="text-xs font-semibold text-[#382322]/70 mt-1 truncate uppercase tracking-wider font-sans">
            {title}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-[#382322]">
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#382322]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-700" />
              )}
              <span className="underline decoration-[#382322]/30 underline-offset-2">{trend}</span>
              {subtitle && <span className="text-[#382322]/50 font-normal ml-0.5">{subtitle}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Mini Sparkline Chart */}
      <div className="shrink-0 pl-1">
        <svg width={sparkWidth} height={sparkHeight} className="overflow-visible opacity-80 group-hover:opacity-100 transition-opacity">
          <polyline
            fill="none"
            stroke="#382322"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
};

export default StatsCard;
