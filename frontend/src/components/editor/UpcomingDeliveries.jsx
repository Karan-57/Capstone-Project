import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, UploadCloud } from 'lucide-react';

export const UpcomingDeliveries = ({ projects = [] }) => {
  const navigate = useNavigate();
  const activeDeliveries = projects
    .filter((p) => p.status !== 'Delivered' && p.status !== 'completed')
    .slice(0, 3);

  return (
    <div className="bg-white/95 dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] p-5 flex flex-col justify-between h-full relative overflow-hidden text-[#261615] dark:text-[#FDEBDE]">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-8 w-12 h-3.5 bg-[#B1C8EA] border border-[#382322]/30 rotate-[2deg] pointer-events-none" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#261615] dark:text-[#FFEBAA]" />
            Upcoming Deliveries
          </h3>
          <span className="text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded-full border border-[#382322]">
            {activeDeliveries.length ? `${activeDeliveries.length} Active` : '0 Active'}
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="flex-1 min-h-[180px] flex items-center justify-center text-center text-xs font-sans text-[#5C3A38] dark:text-[#D4B8A8] bg-[#FDEBDE]/30 dark:bg-[#1A1110]/50 rounded-xl border border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 p-6">
            No upcoming deliveries scheduled
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {activeDeliveries.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDEBDE]/50 dark:bg-[#1A1110] hover:bg-[#FFEBAA]/40 dark:hover:bg-[#2A1D1C] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-all"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate flex items-center gap-1.5 font-sans">
                    <span className="text-[#261615] dark:text-[#FDEBDE] font-semibold">{item.client || 'Client'}</span>
                    <span className="text-[#382322]/40 dark:text-[#FDEBDE]/30">•</span>
                    <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-medium">{item.deliverableType || 'Deliverable'}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
                    <Clock className="w-3.5 h-3.5 text-[#261615]" />
                    <span>{item.dueDate || 'Pending'}</span>
                  </span>
                  <button
                    onClick={() => navigate('/editor/workspace')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer font-mono"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Deliver</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <button
          onClick={() => navigate('/editor/workspace')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-wider"
        >
          Open Production Workspace
        </button>
      </div>
    </div>
  );
};

export default UpcomingDeliveries;
