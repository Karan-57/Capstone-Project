import React from 'react';
import { Clock, User, Calendar } from 'lucide-react';

export const UpcomingDeadlines = ({ projects = [] }) => {
  const activeDeadlines = projects
    .filter((p) => p.deadline && p.deadline !== 'unknown' && p.rawStatus !== 'completed')
    .slice(0, 3);

  return (
    <div className="p-5.5 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-[#3C2415] tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6E7464]" />
            Upcoming Deadlines
          </h3>
          <span className="text-xs text-[#77736D] font-mono">
            {activeDeadlines.length ? `${activeDeadlines.length} Pending` : '0 Pending'}
          </span>
        </div>

        {activeDeadlines.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#77736D]">
            No upcoming deadlines scheduled
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDeadlines.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border flex items-center justify-between bg-[#F0EDE5] hover:bg-[#EAE6DF] border-[#E5E0D7] hover:border-[#DDD9CE] transition-all"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-semibold text-[#3C2415] truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#77736D] mt-1">
                    <User className="w-3.5 h-3.5 text-[#6E7464] shrink-0" />
                    <span className="text-[#3C2415] font-medium truncate">
                      {item.assignedEditor?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white text-[#3C2415] border border-[#E5E0D7]">
                    <Calendar className="w-3.5 h-3.5 text-[#6E7464]" />
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
