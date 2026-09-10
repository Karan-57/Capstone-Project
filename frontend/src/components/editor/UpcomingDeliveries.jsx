import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, UploadCloud } from 'lucide-react';
import Button from '../common/Button';

export const UpcomingDeliveries = () => {
  const navigate = useNavigate();

  const deliveries = [
    {
      id: 'del-1',
      projectId: 'ed-act-3',
      project: 'SaaS Product Walkthrough Demo',
      client: 'CloudFlow Labs',
      stage: 'Rough Cut v2',
      dueIn: '18 hours',
      isUrgent: true,
    },
    {
      id: 'del-2',
      projectId: 'ed-act-1',
      project: 'Deep Dive: AI Revolution 2026',
      client: 'Nexus Media Corp',
      stage: 'Color & Sound Grade',
      dueIn: '34 hours',
      isUrgent: false,
    },
    {
      id: 'del-3',
      projectId: 'ed-act-2',
      project: 'Viral Reel Pack (Weekly Drop)',
      client: 'Chloe Adams',
      stage: 'Dynamic Captions Pass',
      dueIn: '3 days',
      isUrgent: false,
    },
  ];

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Upcoming Deliveries
          </h3>
          <span className="text-xs text-slate-400">Next 72 Hours</span>
        </div>

        <div className="space-y-3">
          {deliveries.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                item.isUrgent
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-[#141A28]/60 border-white/[0.04]'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {item.project}
                  </h4>
                  {item.isUrgent && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {item.client} • <span className="text-purple-300">{item.stage}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-white mb-1">
                  Due in {item.dueIn}
                </div>
                <Button
                  variant="subtle"
                  size="xs"
                  icon={UploadCloud}
                  onClick={() => navigate(`/editor/active-projects?deliver=${item.projectId}`)}
                  className="bg-[#1C2333] hover:bg-[#253047] text-slate-200"
                >
                  Deliver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeliveries;
