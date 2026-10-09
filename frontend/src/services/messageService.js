import api from './api';

export const messageService = {
  getMessages: async () => {
    try {
      const res = await api.get('/api/conversations');
      const convs = res.data?.conversations || res.data || [];
      if (Array.isArray(convs)) {
        return convs.map((c) => {
          const otherParticipant = Array.isArray(c.participants) ? c.participants[0] : null;
          return {
            id: c._id || 'unknown',
            sender: otherParticipant?.name || 'unknown',
            avatar: otherParticipant?.profileImage || '',
            lastMessage: c.lastMessage?.text || c.lastMessage?.content || 'unknown',
            timestamp: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'unknown',
            unread: c.unreadCount ? c.unreadCount > 0 : false,
            online: false,
            project: c.title || 'unknown',
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[messageService] Failed to fetch conversations:', err.message);
      return [];
    }
  },
};
