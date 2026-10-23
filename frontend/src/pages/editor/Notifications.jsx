import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, CheckCircle2, DollarSign, MessageSquare, ChevronRight } from 'lucide-react';
import { notificationService, getNotificationTargetRoute } from '../../services/notificationService';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationsSkeleton } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';

export const Notifications = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;
    fetchNotifications();
  }, [isAuthenticated, isAuthLoading]);

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

  const handleNotificationClick = async (n) => {
    if (n.unread) {
      await markSingleRead(n.id);
    }
    const targetRoute = getNotificationTargetRoute(n, 'editor');
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
      case 'application_accepted':
        return { icon: Sparkles, color: 'text-[#261615] dark:text-[#FFEBAA] bg-[#FFEBAA] dark:bg-[#FFEBAA]/20 border-2 border-[#382322] dark:border-[#FFEBAA]/40' };
      case 'payment':
      case 'payment_released':
        return { icon: DollarSign, color: 'text-[#065F46] dark:text-[#34D399] bg-[#D1FAE5] dark:bg-[#065F46]/30 border-2 border-[#065F46]/30 dark:border-[#34D399]/40' };
      case 'revision':
      case 'feedback':
        return { icon: MessageSquare, color: 'text-[#1E40AF] dark:text-[#93C5FD] bg-[#DBEAFE] dark:bg-[#1E40AF]/30 border-2 border-[#1E40AF]/30 dark:border-[#93C5FD]/40' };
      case 'completed':
        return { icon: CheckCircle2, color: 'text-[#065F46] dark:text-[#34D399] bg-[#D1FAE5] dark:bg-[#065F46]/30 border-2 border-[#065F46]/30 dark:border-[#34D399]/40' };
      default:
        return { icon: Bell, color: 'text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30' };
    }
  };

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6 w-full animate-fade-in text-[#261615] dark:text-[#FDEBDE] pb-16">
      <SEO
        title="Notifications"
        description="Stay updated on proposals, client feedback, and milestone payouts."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE]">
            Editor Notifications
          </h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
            Proposals, client feedback, and milestone payouts
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-12 text-center rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
          <div className="w-12 h-12 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center mx-auto mb-3 text-[#261615] shadow-[2px_2px_0_#382322]">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">No notifications yet</p>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-sm mx-auto font-sans">
            You will receive updates here when creators accept your proposals, fund escrow, or review cuts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const { icon: Icon, color } = getNotificationIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-xl border-2 flex items-start gap-3 sm:gap-3.5 transition-all cursor-pointer group ${
                  n.unread
                    ? 'bg-[#FFEBAA]/30 dark:bg-[#FFEBAA]/10 border-[#382322] dark:border-[#FFEBAA]/50 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#FFEBAA]/20'
                    : 'bg-[#FFFDF9] dark:bg-[#201413] border-[#382322] dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] group-hover:underline truncate">
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono shrink-0 font-bold">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#382322] dark:text-[#FDEBDE]/90 mt-1 leading-relaxed font-sans">
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  {n.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#382322] dark:bg-[#FFEBAA] border border-[#FFEBAA] dark:border-[#382322]" />
                  )}
                  <ChevronRight className="w-4 h-4 text-[#5C3A38] dark:text-[#D4B8A8] group-hover:text-[#261615] dark:group-hover:text-[#FFEBAA] group-hover:translate-x-0.5 transition-all" />
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
