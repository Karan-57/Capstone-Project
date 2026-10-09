import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, CheckCircle2, DollarSign, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import { notificationService } from '../../services/notificationService';
import { useAlert } from '../../context/AlertContext';

export const Notifications = () => {
  const { showAlert } = useAlert();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showAlert('All notifications marked as read', 'success');
  };

  const markSingleRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
      case 'application_accepted':
        return { icon: Sparkles, color: 'text-purple-400 bg-purple-500/15' };
      case 'payment':
      case 'payment_released':
        return { icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/15' };
      case 'revision':
      case 'feedback':
        return { icon: MessageSquare, color: 'text-blue-400 bg-blue-500/15' };
      case 'completed':
        return { icon: CheckCircle2, color: 'text-teal-400 bg-teal-500/15' };
      default:
        return { icon: Bell, color: 'text-purple-400 bg-purple-500/15' };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Editor Notifications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Proposals, client feedback, and milestone payouts
          </p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="subtle"
            size="xs"
            onClick={markAllRead}
            className="self-start sm:self-auto"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/[0.06] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">No notifications yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You will receive updates here when creators accept your proposals, fund escrow, or review cuts.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const { icon: Icon, color } = getNotificationIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => n.unread && markSingleRead(n.id)}
                className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 sm:gap-3.5 transition-all cursor-pointer ${
                  n.unread
                    ? 'bg-purple-950/20 border-purple-800/30'
                    : 'bg-[#141A28]/50 border-white/[0.04]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
