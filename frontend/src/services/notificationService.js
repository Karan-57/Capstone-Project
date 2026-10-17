import api from './api';

export const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      const res = await api.get('/api/notifications', { params });
      const rawList = res.data?.data || res.data?.notifications || [];
      const pagination = res.data?.pagination || {};

      const notifications = Array.isArray(rawList)
        ? rawList.map((n) => ({
            id: n._id || 'unknown',
            type: n.type || 'unknown',
            title: n.title || 'unknown',
            message: n.message || 'unknown',
            time: n.createdAt
              ? new Date(n.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'unknown',
            unread: !n.isRead,
            project: n.project?.title || 'unknown',
            projectId: n.project?._id || (typeof n.project === 'string' ? n.project : null),
            relatedUser: n.relatedUser?.name || 'unknown',
            link: n.link || n.actionUrl || null,
            raw: n,
          }))
        : [];

      return {
        notifications,
        unreadCount: pagination.unreadCount != null ? pagination.unreadCount : notifications.filter((n) => n.unread).length,
        total: pagination.total != null ? pagination.total : notifications.length,
      };
    } catch (err) {
      console.warn('[notificationService] Failed to load notifications:', err.message);
      return {
        notifications: [],
        unreadCount: 0,
        total: 0,
      };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const res = await api.patch(`/api/notifications/${notificationId}/read`);
      return res.data;
    } catch (err) {
      console.warn('[notificationService] Failed to mark as read:', err.message);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await api.patch('/api/notifications/read-all');
      return res.data;
    } catch (err) {
      console.warn('[notificationService] Failed to mark all as read:', err.message);
      return null;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const res = await api.delete(`/api/notifications/${notificationId}`);
      return res.data;
    } catch (err) {
      console.warn('[notificationService] Failed to delete notification:', err.message);
      return null;
    }
  },
};

export function getNotificationTargetRoute(notification, role = 'creator') {
  if (!notification) return `/${role}/dashboard`;
  if (notification.link) return notification.link;
  if (notification.actionUrl) return notification.actionUrl;

  const type = String(notification.type || '').toUpperCase();
  const projectId = notification.projectId || notification.raw?.project?._id || (typeof notification.raw?.project === 'string' ? notification.raw?.project : null);
  const applicationId = notification.applicationId || notification.raw?.application?._id || (typeof notification.raw?.application === 'string' ? notification.raw?.application : null);

  if (role === 'creator') {
    if (type === 'APPLICATION_COUNTER_OFFER') {
      return applicationId ? `/creator/applications?applicationId=${applicationId}` : `/creator/applications`;
    }
    if (type.includes('APPLICATION') || type === 'NEW_APPLICATION' || type === 'NEW_BID') {
      return projectId ? `/creator/projects/${projectId}` : `/creator/applications`;
    }
    if (type.includes('PAYMENT') || type.includes('ESCROW')) {
      return `/creator/payments`;
    }
    if (
      type.includes('WORKSPACE') ||
      type.includes('FILE') ||
      type.includes('SUBMISSION') ||
      type.includes('REVISION') ||
      type.includes('STATUS') ||
      type.includes('DEADLINE')
    ) {
      return projectId ? `/creator/workspace?projectId=${projectId}` : `/creator/workspace`;
    }
    if (type.includes('REVIEW')) {
      return `/creator/profile`;
    }
    if (type.includes('MESSAGE')) {
      return `/creator/messages`;
    }
    return projectId ? `/creator/projects/${projectId}` : `/creator/dashboard`;
  } else {
    // Editor / Freelancer
    if (type === 'APPLICATION_COUNTER_OFFER') {
      return applicationId ? `/editor/applications?applicationId=${applicationId}` : `/editor/applications`;
    }
    if (type.includes('APPLICATION') || type === 'NEW_APPLICATION' || type === 'APPLICATION_REJECTED') {
      return `/editor/applications`;
    }
    if (type === 'APPLICATION_ACCEPTED' || type === 'EDITOR_SELECTED' || type === 'ADDED_TO_PROJECT') {
      return projectId ? `/editor/workspace?projectId=${projectId}` : `/editor/active-projects`;
    }
    if (type.includes('PAYMENT') || type === 'PAYMENT_RECEIVED' || type === 'PROJECT_APPROVED') {
      return `/editor/earnings`;
    }
    if (
      type.includes('WORKSPACE') ||
      type.includes('FILE') ||
      type.includes('SUBMISSION') ||
      type.includes('REVISION') ||
      type.includes('STATUS') ||
      type.includes('DEADLINE')
    ) {
      return projectId ? `/editor/workspace?projectId=${projectId}` : `/editor/workspace`;
    }
    if (type.includes('REVIEW')) {
      return `/editor/profile`;
    }
    if (type.includes('MESSAGE')) {
      return `/editor/messages`;
    }
    return `/editor/dashboard`;
  }
}

export default notificationService;
