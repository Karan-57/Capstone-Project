import React, { useState } from 'react';
import { Sparkles, DollarSign, MessageSquare } from 'lucide-react';

export const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Proposal Shortlisted!',
      desc: 'Sarah Jenkins invited you to an interview for the 10x TikTok Reels Batch.',
      time: '1 hour ago',
      unread: true,
      icon: Sparkles,
      iconColor: 'text-purple-400 bg-purple-500/15',
    },
    {
      id: 2,
      title: 'Payment Released to Your Balance',
      desc: 'CloudFlow Labs approved the final cut. ₹28,000 is now available for cash out.',
      time: '5 hours ago',
      unread: true,
      icon: DollarSign,
      iconColor: 'text-emerald-400 bg-emerald-500/15',
    },
    {
      id: 3,
      title: 'New Feedback on Draft Cut',
      desc: 'Nexus Media Corp added 3 time-coded notes on your rough draft.',
      time: '1 day ago',
      unread: false,
      icon: MessageSquare,
      iconColor: 'text-blue-400 bg-blue-500/15',
    },
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Editor Notifications</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Proposals, client feedback, and milestone payouts
        </p>
      </div>

      <div className="space-y-2.5">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                n.unread ? 'bg-purple-950/20 border-purple-800/30' : 'bg-[#141A28]/50 border-white/[0.04]'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${n.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                  <span className="text-[11px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{n.desc}</p>
              </div>
              {n.unread && <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
