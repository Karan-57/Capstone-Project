import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const UpcomingDeadlines = ({ projects = [] }) => {
  const activeDeadlines = projects
    .filter((p) => p.deadline && p.deadline !== 'unknown' && p.rawStatus !== 'completed')
    .slice(0, 3);

  return (
    <div className="glass-card p-5.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Upcoming Deadlines
          </h3>
          <span className="text-xs text-slate-400">
            {activeDeadlines.length ? `${activeDeadlines.length} Pending` : '0 Pending'}
          </span>
        </div>

        {activeDeadlines.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No upcoming deadlines scheduled
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDeadlines.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border flex items-center justify-between bg-[#141A28]/60 border-white/[0.04]"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {item.title || 'unknown'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned to: <span className="text-slate-200">{item.assignedEditor?.name || 'unknown'}</span>
                  </p>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Due {item.deadline || 'unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
