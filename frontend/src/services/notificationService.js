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
            relatedUser: n.relatedUser?.name || 'unknown',
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

export default notificationService;
