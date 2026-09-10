import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const UpcomingDeadlines = () => {
  const deadlines = [
    {
      id: 'dl-1',
      project: 'YouTube 4K Documentary Cut',
      editor: 'Aditya Joshi',
      dueDate: 'Sep 04, 2026',
      daysRemaining: '1 day left',
      urgent: true,
    },
    {
      id: 'dl-2',
      project: 'E-Commerce Platform Demo',
      editor: 'Rahul Verma',
      dueDate: 'Sep 08, 2026',
      daysRemaining: '5 days left',
      urgent: false,
    },
    {
      id: 'dl-3',
      project: 'Social Media Launch Teaser',
      editor: 'Priya Mehta',
      dueDate: 'Sep 12, 2026',
      daysRemaining: '9 days left',
      urgent: false,
    },
  ];

  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Upcoming Deadlines
          </h3>
          <span className="text-xs text-slate-400">3 Pending</span>
        </div>

        <div className="space-y-2.5">
          {deadlines.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                item.urgent
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-[#141A28]/60 border-white/[0.04]'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {item.project}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assigned to: <span className="text-slate-200">{item.editor}</span>
                </p>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    item.urgent
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {item.urgent && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  {item.daysRemaining}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Due {item.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
