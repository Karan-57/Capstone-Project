import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Video, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Heatmap days and weeks
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapData = [
    [2, 4, 1, 5, 8, 3, 2],
    [3, 6, 4, 7, 9, 5, 1],
    [1, 3, 5, 8, 12, 4, 2],
    [4, 7, 6, 9, 14, 6, 3],
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Channel & Production Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics on video turnaround, audience retention, and editor efficiency
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.06]">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatsCard icon={Video} title="Videos Produced" value="38" trend="14%" isPositive={true} sparklineData={[12, 16, 22, 20, 28, 32, 38]} />
        <StatsCard icon={Clock} title="Avg Turnaround" value="3.2" trend="0.8d faster" isPositive={true} subtitle="vs avg" sparklineData={[5, 4.5, 4.1, 3.8, 3.5, 3.2]} />
        <StatsCard icon={TrendingUp} title="Avg View Duration" value="8.7" trend="24%" isPositive={true} subtitle="mins" sparklineData={[6, 6.4, 7.1, 7.8, 8.2, 8.7]} />
        <StatsCard icon={Users} title="Active Editors Hired" value="6" trend="2 new" isPositive={true} sparklineData={[2, 3, 3, 4, 5, 6]} />
      </div>

      {/* Hiring & Application Funnel + Retention Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5.5">
        {/* Application Funnel (Col 5) */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Editor Hiring Funnel</h3>
            <p className="text-xs text-slate-400 mb-5">Conversion rate from project brief to accepted cut</p>

            <div className="space-y-3">
              {[
                { stage: 'Project Views', count: '1,420', percent: '100%', color: 'from-purple-600 to-indigo-600' },
                { stage: 'Proposals Received', count: '64', percent: '45%', color: 'from-indigo-600 to-blue-500' },
                { stage: 'Shortlisted Tests', count: '12', percent: '18%', color: 'from-blue-500 to-cyan-400' },
                { stage: 'Contracts Started', count: '6', percent: '9.4%', color: 'from-emerald-500 to-teal-400' },
              ].map((funnel, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{funnel.stage}</span>
                    <span className="font-mono text-white font-bold">{funnel.count} ({funnel.percent})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${funnel.color} rounded-full`}
                      style={{ width: funnel.percent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.04] text-xs text-emerald-400 flex items-center justify-between">
            <span>Overall Hire Speed: <strong>22 hrs</strong></span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Audience Retention Curve (Col 7) */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Audience Retention Curve (15-Min Cuts)</h3>
              <span className="text-xs font-mono text-purple-400 font-bold">58.4% Average Retention</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Benchmark comparison between raw video vs Collabo edited cut</p>

            <div className="relative h-44 w-full">
              <svg viewBox="0 0 450 140" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid */}
                <line x1="0" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="450" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="450" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                {/* Benchmark unedited curve (faded gray) */}
                <path
                  d="M 10 20 C 60 70, 150 110, 440 125"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Collabo Edited Curve (Glowing Purple Area) */}
                <path
                  d="M 10 15 C 80 25, 140 45, 220 50 C 310 55, 380 65, 440 70 L 440 135 L 10 135 Z"
                  fill="url(#retentionGrad)"
                />
                <path
                  d="M 10 15 C 80 25, 140 45, 220 50 C 310 55, 380 65, 440 70"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2">
              <span>0:00 (Hook)</span>
              <span>3:00</span>
              <span>7:30 (Mid-Point)</span>
              <span>11:00</span>
              <span>15:00 (End Screen)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-purple-300">● Collabo Fast-Paced Cut</span>
            <span className="text-slate-500">┄ Industry Baseline</span>
          </div>
        </div>
      </div>

      {/* Production Heatmap Section */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Video Production Activity Heatmap</h3>
        <p className="text-xs text-slate-400">Weekly delivery and revision intensity by day of the week</p>

        <div className="grid grid-cols-7 gap-2 text-center">
          {days.map((d, i) => (
            <div key={i} className="text-xs font-mono font-semibold text-slate-400 mb-1">
              {d}
            </div>
          ))}

          {heatmapData.flat().map((intensity, idx) => (
            <div
              key={idx}
              className={`h-10 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-transform hover:scale-105 cursor-pointer ${
                intensity > 10
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                  : intensity > 6
                  ? 'bg-purple-700/80 text-purple-100'
                  : intensity > 3
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'bg-white/[0.03] text-slate-500'
              }`}
            >
              {intensity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
