import api from './api';
import { DEFAULT_PFP } from '../constants/assets';

export const messageService = {
  getMessages: async (currentUserId = null) => {
    try {
      const res = await api.get('/api/conversations');
      const convs = res.data?.conversations || res.data || [];
      if (Array.isArray(convs)) {
        return convs.map((c) => {
          const participants = Array.isArray(c.participants) ? c.participants : [];
          const otherParticipant = currentUserId
            ? participants.find((p) => String(p._id || p.id || p) !== String(currentUserId)) || participants[0]
            : participants[0];

          const projectTitle = c.projectId?.title || c.title || 'Direct Chat';

          return {
            id: c._id || 'unknown',
            sender: otherParticipant?.name || 'Collaborator',
            senderId: otherParticipant?._id || otherParticipant?.id,
            avatar: otherParticipant?.profileImage || DEFAULT_PFP,
            lastMessage: c.lastMessage?.text || c.lastMessage?.content || 'No messages yet',
            timestamp: c.updatedAt
              ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent',
            unread: c.unreadCount ? c.unreadCount > 0 : false,
            online: false,
            project: projectTitle,
            type: c.type || 'private',
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[messageService] Failed to fetch conversations:', err.message);
      return [];
    }
  },

  getConversationMessages: async (conversationId, currentUserId = null) => {
    try {
      const res = await api.get(`/api/conversations/${conversationId}/messages`);
      const msgs = res.data?.messages || [];
      return msgs.map((m) => {
        const isMe = currentUserId
          ? String(m.sender?._id || m.sender?.id || m.sender) === String(currentUserId)
          : false;

        return {
          id: m._id || m.id,
          sender: isMe ? 'me' : m.sender?.name || 'Sender',
          senderName: m.sender?.name || 'User',
          senderAvatar: m.sender?.profileImage || DEFAULT_PFP,
          text: m.text || '',
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          attachments: m.attachments || [],
        };
      });
    } catch (err) {
      console.warn('[messageService] Failed to fetch messages:', err.message);
      return [];
    }
  },

  sendMessage: async (conversationId, text, attachments = []) => {
    try {
      const res = await api.post(`/api/conversations/${conversationId}/messages`, {
        text,
        attachments,
      });
      return res.data?.message;
    } catch (err) {
      console.error('[messageService] Failed to send message:', err);
      throw err;
    }
  },
};
