import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, UploadCloud } from 'lucide-react';
import Button from '../common/Button';

export const UpcomingDeliveries = ({ projects = [] }) => {
  const navigate = useNavigate();
  const activeDeliveries = projects
    .filter((p) => p.status !== 'Delivered' && p.status !== 'completed')
    .slice(0, 3);

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-8 w-12 h-3.5 bg-[#B1C8EA] border border-[#382322]/30 rotate-[2deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#382322]" />
            Upcoming Deliveries
          </h3>
          <span className="text-xs font-mono font-bold text-[#382322] bg-[#FFEBAA] px-2.5 py-0.5 rounded-full border border-[#382322]">
            {activeDeliveries.length ? `${activeDeliveries.length} Active` : '0 Active'}
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="py-8 text-center text-xs font-sans text-[#382322]/60 bg-[#FDEBDE]/30 rounded-xl border border-dashed border-[#382322]/30">
            No upcoming deliveries scheduled
          </div>
        ) : (
          <div className="space-y-3">
            {activeDeliveries.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border-2 border-[#382322] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDEBDE]/50 hover:bg-[#FFEBAA]/40 shadow-[2px_2px_0_#382322] hover:-translate-y-0.5 transition-all"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#382322] truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <p className="text-[11px] text-[#382322]/70 mt-0.5 truncate flex items-center gap-1.5">
                    <span className="text-[#382322] font-semibold">{item.client || 'Client'}</span>
                    <span className="text-[#382322]/40">•</span>
                    <span className="text-[#382322] font-medium">{item.deliverableType || 'Deliverable'}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
                    <Clock className="w-3.5 h-3.5 text-[#382322]" />
                    <span>{item.dueDate || 'Pending'}</span>
                  </span>
                  <button
                    onClick={() => navigate('/editor/workspace')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
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
    </div>
  );
};

export default UpcomingDeliveries;
