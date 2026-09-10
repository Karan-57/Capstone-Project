import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

export const EarningsOverview = ({ total = '₹45,000', subtitle = 'Total Earnings', comparison = '+18.4% this month' }) => {
  const [timeframe, setTimeframe] = useState('This Month');

  // SVG dimensions
  const width = 360;
  const height = 140;

  // Path data for the smooth wave matching the screenshot
  const linePath = "M 10 115 C 45 110, 65 95, 95 90 C 130 85, 145 105, 175 92 C 210 78, 235 62, 265 65 C 295 68, 315 40, 350 20";
  const areaPath = `${linePath} L 350 135 L 10 135 Z`;

  return (
    <div className="glass-card p-5.5 flex flex-col justify-between h-full">
      {/* Header with Title and Dropdown */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Earnings Overview
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTimeframe(prev => (prev === 'This Month' ? 'Last Month' : 'This Month'))}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-[#161D2D] hover:bg-[#1E2638] rounded-lg border border-white/[0.08] transition-colors"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Metric Display */}
      <div className="mb-2">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {total}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
          <span>{subtitle}</span>
          <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {comparison}
          </span>
        </div>
      </div>

      {/* Interactive Line Chart */}
      <div className="relative mt-2">
        {/* Y Axis Legend */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono select-none">
          <span>50K</span>
          <span>40K</span>
          <span>30K</span>
          <span>20K</span>
          <span>10K</span>
        </div>

        {/* Chart SVG */}
        <div className="ml-8">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
            <defs>
              <linearGradient id="purpleEarningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#7C3AED" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Subtle Grid horizontal lines */}
            <line x1="0" y1="20" x2={width} y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2={width} y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2={width} y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <line x1="0" y1="110" x2={width} y2="110" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

            {/* Area Fill */}
            <path d={areaPath} fill="url(#purpleEarningsGrad)" />

            {/* Glow Path */}
            <path
              d={linePath}
              fill="none"
              stroke="#A78BFA"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Accent milestone dots */}
            <circle cx="95" cy="90" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="175" cy="92" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="265" cy="65" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="350" cy="20" r="4.5" fill="#A78BFA" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
          </svg>

          {/* X Axis Labels matching screenshot */}
          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1.5 select-none">
            <span>1 May</span>
            <span>8 May</span>
            <span>15 May</span>
            <span>22 May</span>
            <span>29 May</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;
