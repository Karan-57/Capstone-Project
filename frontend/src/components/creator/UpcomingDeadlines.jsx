import React from 'react';
import { Clock, User, Calendar } from 'lucide-react';

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
                className="p-3.5 rounded-xl border flex items-center justify-between bg-[#141A28]/60 hover:bg-[#182030]/80 border-white/[0.04] hover:border-purple-500/25 transition-all"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-300 font-medium truncate">
                      {item.assignedEditor?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{item.deadline || 'No deadline'}</span>
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
