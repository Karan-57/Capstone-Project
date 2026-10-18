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
    <div className="p-5 rounded-2xl bg-white border border-[#E5E0D7] shadow-[0_1px_3px_rgba(60,36,21,0.03)] hover:shadow-[0_4px_14px_rgba(60,36,21,0.06)] hover:border-[#DDD9CE] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 relative overflow-hidden group">
      {/* Left Column: Icon & Metric */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon Badge with live pulse dot */}
        <div className="relative">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
            {Icon && (React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? (
              <Icon className="w-5 h-5" />
            ) : (
              <span className="text-lg font-bold">{Icon}</span>
            ))}
          </div>
          {/* Live indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#55745C] ring-2 ring-white" />
        </div>

        {/* Value and Title */}
        <div className="min-w-0">
          <div className="text-2xl font-bold text-[#3C2415] tracking-tight leading-none font-mono">
            {displayValue}
          </div>
          <div className="text-xs font-medium text-[#77736D] mt-1.5 truncate tracking-tight">
            {title}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#55745C]">
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#55745C]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-[#A34F45]" />
              )}
              <span>{trend}</span>
              <span className="text-[#77736D] font-normal">{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Mini Sparkline Chart */}
      <div className="shrink-0 pl-2">
        <svg width={sparkWidth} height={sparkHeight} className="overflow-visible opacity-75 group-hover:opacity-100 transition-opacity">
          <defs>
            <linearGradient id={`sparkGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6E7464" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6E7464" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${sparkHeight} ${points} ${sparkWidth},${sparkHeight}`}
            fill={`url(#sparkGrad-${title})`}
          />
          <polyline
            fill="none"
            stroke="#6E7464"
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
