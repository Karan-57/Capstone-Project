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
    <div className="p-4 sm:p-5.5 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-[#3C2415] tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6E7464]" />
            Upcoming Deliveries
          </h3>
          <span className="text-xs text-[#77736D] font-mono">
            {activeDeliveries.length ? `${activeDeliveries.length} Active` : '0 Active'}
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#77736D]">
            No upcoming deliveries scheduled
          </div>
        ) : (
          <div className="space-y-3">
            {activeDeliveries.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0EDE5] hover:bg-[#EAE6DF] border-[#E5E0D7] hover:border-[#DDD9CE] transition-all"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[#3C2415] truncate">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <p className="text-[11px] text-[#77736D] mt-0.5 truncate flex items-center gap-1.5">
                    <span className="text-[#3C2415] font-medium">{item.client || 'Client'}</span>
                    <span className="text-[#DDD9CE]">•</span>
                    <span className="text-[#6E7464] font-medium">{item.deliverableType || 'Deliverable'}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white text-[#3C2415] border border-[#E5E0D7]">
                    <Clock className="w-3.5 h-3.5 text-[#6E7464]" />
                    <span>{item.dueDate || 'Pending'}</span>
                  </span>
                  <Button
                    variant="subtle"
                    size="xs"
                    icon={UploadCloud}
                    onClick={() => navigate('/editor/workspace')}
                  >
                    Deliver
                  </Button>
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
