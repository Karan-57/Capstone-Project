import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({
  icon: Icon,
  iconBg = 'bg-blue-500/20 text-blue-400 border border-blue-500/25',
  title,
  value,
  trend,
  isPositive = true,
  subtitle = 'this month',
  sparklineData = [10, 18, 14, 25, 22, 32, 28, 42]
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation for numeric values
  useEffect(() => {
    const numericPart = parseFloat(value);
    if (isNaN(numericPart)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1200;
    const steps = 30;
    const increment = numericPart / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericPart) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(
          Number.isInteger(numericPart)
            ? Math.floor(start)
            : start.toFixed(1)
        );
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  // Mini sparkline SVG path builder
  const sparkWidth = 75;
  const sparkHeight = 28;
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

  return (
    <div className="glass-panel-interactive p-5 flex items-center justify-between gap-3 relative overflow-hidden group">
      {/* Floating glass reflection sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 pointer-events-none" />

      {/* Left Column: Icon & Metric */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon Badge with live pulse dot */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            {Icon && (React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? (
              <Icon className="w-5 h-5" />
            ) : (
              <span className="text-xl font-bold">{Icon}</span>
            ))}
          </div>
          {/* Live indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0D111B] shadow-[0_0_8px_#34D399]" />
        </div>

        {/* Value and Title */}
        <div className="min-w-0">
          <div className="text-2xl font-black text-white tracking-tight leading-none font-mono">
            {displayValue}
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-1 truncate tracking-tight">
            {title}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-400">
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{trend}</span>
              <span className="text-slate-500 font-normal">{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Mini Sparkline Chart */}
      <div className="shrink-0 pl-2">
        <svg width={sparkWidth} height={sparkHeight} className="overflow-visible opacity-70 group-hover:opacity-100 transition-opacity">
          <defs>
            <linearGradient id={`sparkGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${sparkHeight} ${points} ${sparkWidth},${sparkHeight}`}
            fill={`url(#sparkGrad-${title})`}
          />
          <polyline
            fill="none"
            stroke="#C084FC"
            strokeWidth="2"
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
