import React, { useState } from 'react';
import { Bell, CheckCircle2, DollarSign, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'application',
      title: 'New application received',
      desc: 'Priya Mehta applied for your "Social Media App" video campaign with portfolio reel.',
      time: '15 minutes ago',
      unread: true,
      icon: Bell,
      iconColor: 'text-purple-400 bg-purple-500/15',
    },
    {
      id: 2,
      type: 'revision',
      title: 'Revision requested',
      desc: 'Aditya Joshi submitted updated cut v2 for "YouTube 4K Documentary Cut".',
      time: '2 hours ago',
      unread: true,
      icon: RefreshCw,
      iconColor: 'text-amber-400 bg-amber-500/15',
    },
    {
      id: 3,
      type: 'completed',
      title: 'Project completed',
      desc: 'Rahul Verma marked all milestones done for "Portfolio Website".',
      time: 'Yesterday',
      unread: false,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/15',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment released',
      desc: 'Escrow payment of ₹20,000 was transferred successfully to Priya Mehta.',
      time: '3 days ago',
      unread: false,
      icon: DollarSign,
      iconColor: 'text-blue-400 bg-blue-500/15',
    },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stay updated on new proposals, delivery cuts, and milestone alerts
          </p>
        </div>
        <Button variant="subtle" size="xs" onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-2.5">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                n.unread
                  ? 'bg-purple-950/20 border-purple-800/30'
                  : 'bg-[#141A28]/50 border-white/[0.04]'
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
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
              {n.unread && (
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
