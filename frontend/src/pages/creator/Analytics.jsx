import React from 'react';
import { TrendingUp, Users, Clock, Video } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Channel & Production Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Metrics on video turnaround, audience retention, and editor efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Video} title="Videos Produced" value="38" trend="14%" isPositive={true} />
        <StatsCard icon={Clock} title="Avg Turnaround" value="3.2 Days" trend="0.8 days faster" isPositive={true} />
        <StatsCard icon={TrendingUp} title="Avg View Duration" value="8m 42s" trend="24%" isPositive={true} />
        <StatsCard icon={Users} title="Active Editors Hired" value="6" trend="2 new" isPositive={true} />
      </div>

      <div className="glass-card p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Editing Speed & Revisions Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">First-cut Approval Rate</span>
              <span className="text-emerald-400 font-bold">78%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[78%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Average Revisions Per Cut</span>
              <span className="text-purple-400 font-bold">1.2 Revisions</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[35%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">On-Time Delivery Rate</span>
              <span className="text-blue-400 font-bold">96%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[96%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
