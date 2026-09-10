import React, { useState } from 'react';
import { Sparkles, DollarSign, MessageSquare, Check } from 'lucide-react';
import Button from '../../components/common/Button';

export const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
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

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Editor Notifications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Proposals, client feedback, and milestone payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              icon={Check}
              onClick={markAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            filter === 'unread'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="space-y-2.5">
        {filtered.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                n.unread
                  ? 'bg-purple-950/20 border-purple-800/30 hover:border-purple-600/40'
                  : 'bg-[#141A28]/50 border-white/[0.04] opacity-80 hover:opacity-100'
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
              {n.unread && (
                <span
                  title="Mark read"
                  className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 mt-2"
                ></span>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-xs text-slate-400">
            No notifications in this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
