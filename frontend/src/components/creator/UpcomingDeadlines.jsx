import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Calendar } from 'lucide-react';

export const UpcomingDeadlines = ({ projects = [] }) => {
  const navigate = useNavigate();
  const allDeadlines = projects.filter(
    (p) => p.deadline && p.deadline !== 'unknown' && p.rawStatus !== 'completed'
  );
  const activeDeadlines = allDeadlines.slice(0, 3);

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-8 w-12 h-3 bg-[#FFEBAA] border border-[#382322]/30 rotate-[3deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#382322]" />
            Upcoming Deadlines
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#382322] bg-[#FFEBAA] px-2.5 py-0.5 rounded-full border border-[#382322]">
              {allDeadlines.length ? `${allDeadlines.length} Pending` : '0 Pending'}
            </span>
            <button
              onClick={() => navigate('/creator/projects')}
              className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all cursor-pointer"
            >
              View all
            </button>
          </div>
        </div>

        {activeDeadlines.length === 0 ? (
          <div className="py-8 text-center text-xs font-sans text-[#382322]/60 bg-[#FDEBDE]/30 rounded-xl border border-dashed border-[#382322]/30">
            No upcoming deadlines scheduled
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDeadlines.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border-2 border-[#382322] flex items-center justify-between bg-[#FDEBDE]/50 hover:bg-[#FFEBAA]/40 shadow-[2px_2px_0_#382322] hover:-translate-y-0.5 transition-all"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-bold text-[#382322] truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#382322]/70 mt-1">
                    <User className="w-3.5 h-3.5 text-[#382322] shrink-0" />
                    <span className="text-[#382322] font-semibold truncate">
                      {item.assignedEditor?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-lg bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
                    <Calendar className="w-3.5 h-3.5 text-[#382322]" />
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
