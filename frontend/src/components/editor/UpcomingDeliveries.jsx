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
    <div className="glass-card p-4 sm:p-5.5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Upcoming Deliveries
          </h3>
          <span className="text-xs text-slate-400">
            {activeDeliveries.length ? `${activeDeliveries.length} Active` : '0 Active'}
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No upcoming deliveries scheduled
          </div>
        ) : (
          <div className="space-y-3">
            {activeDeliveries.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141A28]/60 border-white/[0.04]"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {item.title || 'unknown'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.client || 'unknown'} • <span className="text-purple-300">{item.deliverableType || 'unknown'}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2 shrink-0">
                  <div className="text-xs font-semibold text-white">
                    Due {item.dueDate || 'unknown'}
                  </div>
                  <Button
                    variant="subtle"
                    size="xs"
                    icon={UploadCloud}
                    onClick={() => navigate('/editor/workspace')}
                    className="bg-[#1C2333] hover:bg-[#253047] text-slate-200"
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
