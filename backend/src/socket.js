const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config/config');
const userModel = require('./model/user.model');
const tokenBlacklistModel = require('./model/tokenBlacklist.model');
const messageModel = require('./model/message.model');
const conversationModel = require('./model/conversation.model');
const { verifyConversationAccess } = require('./services/chat.service');

let io = null;

/**
 * Initializes Socket.io with the HTTP server
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  // Socket.IO JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.auth?.accessToken ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        socket.handshake.query?.token;

      // Also allow legacy client connection if userId provided for testing, but prefer secure JWT
      if (!token) {
        const fallbackUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
        if (fallbackUserId) {
          socket.userId = fallbackUserId.toString();
          return next();
        }
        return next(new Error('SOCKET_AUTH_FAILED: Authentication token missing'));
      }

      // Check token blacklist
      const isBlacklisted = await tokenBlacklistModel.findOne({ token }).catch(() => null);
      if (isBlacklisted) {
        return next(new Error('SOCKET_AUTH_FAILED: Token is invalid or revoked'));
      }

      // Verify JWT
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return next(new Error('SOCKET_AUTH_FAILED: Invalid token payload'));
      }

      const user = await userModel.findById(decoded.id).select('_id name username role');
      if (!user) {
        return next(new Error('SOCKET_AUTH_FAILED: User account not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      return next();
    } catch (err) {
      console.error('[Socket Auth] Authentication error:', err.message);
      return next(new Error('SOCKET_AUTH_FAILED: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (userId) {
      // 1. Join user personal room: user:<userId> for multi-device sync
      socket.join(`user:${userId}`);
      // Backward compatibility room for notifications
      socket.join(userId.toString());
      console.log(`[Socket] User ${userId} connected (Socket ID: ${socket.id})`);
    }

    // Allow manual join for compatibility
    socket.on('join', (data) => {
      const roomUserId = typeof data === 'object' ? data?.userId : data;
      if (roomUserId) {
        socket.join(`user:${roomUserId}`);
        socket.join(roomUserId.toString());
      }
    });

    /**
     * Event: join_conversation
     * Client joins conversation room: conversation:<conversationId>
     * Server strictly validates membership/workspace authorization before joining.
     */
    socket.on('join_conversation', async (data, callback) => {
      try {
        const conversationId = typeof data === 'object' ? data?.conversationId : data;
        if (!conversationId) {
          if (typeof callback === 'function') callback({ error: 'INVALID_CONVERSATION_ID' });
          return;
        }

        const access = await verifyConversationAccess(conversationId, socket.userId);
        if (!access.authorized) {
          socket.emit('chat_error', {
            code: access.reason || 'NOT_CONVERSATION_MEMBER',
            message: 'You do not have permission to join this conversation',
            conversationId,
          });
          if (typeof callback === 'function') callback({ error: access.reason });
          return;
        }

        const roomName = `conversation:${conversationId}`;
        socket.join(roomName);
        console.log(`[Socket] User ${socket.userId} joined ${roomName}`);

        if (typeof callback === 'function') callback({ success: true, conversationId });
      } catch (err) {
        console.error('[Socket] join_conversation error:', err.message);
        socket.emit('chat_error', { code: 'SERVER_ERROR', message: err.message });
      }
    });

    /**
     * Event: leave_conversation
     * Client leaves conversation room
     */
    socket.on('leave_conversation', (data) => {
      const conversationId = typeof data === 'object' ? data?.conversationId : data;
      if (conversationId) {
        const roomName = `conversation:${conversationId}`;
        socket.leave(roomName);
        console.log(`[Socket] User ${socket.userId} left ${roomName}`);
      }
    });

    /**
     * Event: send_message
     * Client sends a message.
     * Flow:
     * 1. Validate payload and sender identity from socket.userId (never trust client senderId)
     * 2. Verify membership via chat.service
     * 3. MongoDB Message.create()
     * 4. Conversation.lastMessage update
     * 5. Emit new_message to conversation room
     * 6. Emit conversation_updated to participant personal rooms
     */
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, text, messageType, attachments } = data || {};

        if (!conversationId) {
          socket.emit('chat_error', { code: 'INVALID_CONVERSATION', message: 'conversationId is required' });
          if (typeof callback === 'function') callback({ error: 'INVALID_CONVERSATION' });
          return;
        }

        // Authorize conversation member
        const access = await verifyConversationAccess(conversationId, socket.userId);
        if (!access.authorized) {
          socket.emit('chat_error', {
            code: access.reason || 'NOT_CONVERSATION_MEMBER',
            message: 'You do not have permission to send messages in this conversation',
            conversationId,
          });
          if (typeof callback === 'function') callback({ error: access.reason });
          return;
        }

        const trimmedText = typeof text === 'string' ? text.trim() : '';
        const validAttachments = Array.isArray(attachments) ? attachments : [];

        if (!trimmedText && validAttachments.length === 0) {
          socket.emit('chat_error', { code: 'EMPTY_MESSAGE', message: 'Message text or attachment required' });
          if (typeof callback === 'function') callback({ error: 'EMPTY_MESSAGE' });
          return;
        }

        const msgType = ['text', 'file', 'image'].includes(messageType)
          ? messageType
          : validAttachments.length > 0
          ? validAttachments[0].type?.startsWith('image')
            ? 'image'
            : 'file'
          : 'text';

        // MongoDB First: Create message
        const messageDoc = await messageModel.create({
          conversationId,
          sender: socket.userId,
          messageType: msgType,
          text: trimmedText,
          attachments: validAttachments,
        });

        // Update Conversation.lastMessage
        const conversation = access.conversation || (await conversationModel.findById(conversationId));
        if (conversation) {
          conversation.lastMessage = {
            messageId: messageDoc._id,
            text: trimmedText || (msgType === 'image' ? '📷 Image' : '📎 Attachment'),
            sender: socket.userId,
            createdAt: messageDoc.createdAt,
          };

          // Mark as read by sender
          if (!conversation.readBy) conversation.readBy = [];
          const readIdx = conversation.readBy.findIndex(
            (r) => r.user?.toString() === socket.userId.toString()
          );
          if (readIdx !== -1) {
            conversation.readBy[readIdx].readAt = messageDoc.createdAt;
          } else {
            conversation.readBy.push({ user: socket.userId, readAt: messageDoc.createdAt });
          }

          await conversation.save();
        }

        // Populate sender info
        await messageDoc.populate('sender', 'name username email profileImage role rating');

        const messagePayload = {
          _id: messageDoc._id,
          messageId: messageDoc._id,
          conversationId: messageDoc.conversationId,
          sender: messageDoc.sender,
          text: messageDoc.text,
          messageType: messageDoc.messageType,
          attachments: messageDoc.attachments,
          createdAt: messageDoc.createdAt,
          updatedAt: messageDoc.updatedAt,
        };

        // Realtime Delivery:
        // A. Broadcast new_message to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', messagePayload);

        // B. Acknowledge back to sender
        socket.emit('message_sent', {
          success: true,
          message: messagePayload,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: messagePayload });
        }

        // C. Broadcast conversation_updated to each participant's personal room for sidebar updates
        if (conversation && Array.isArray(conversation.participants)) {
          conversation.participants.forEach((pId) => {
            const pIdStr = pId.toString();
            io.to(`user:${pIdStr}`).emit('conversation_updated', {
              conversationId: conversation._id,
              type: conversation.type,
              lastMessage: conversation.lastMessage,
              updatedAt: conversation.updatedAt,
            });
          });
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err.message);
        socket.emit('chat_error', { code: 'SEND_FAILED', message: err.message });
        if (typeof callback === 'function') callback({ error: 'SEND_FAILED' });
      }
    });

    /**
     * Event: typing_start
     * Broadcast to conversation room (excluding the sender)
     */
    socket.on('typing_start', (data) => {
      const conversationId = typeof data === 'object' ? data?.conversationId : data;
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('typing_start', {
          conversationId,
          userId: socket.userId,
          username: socket.user?.name || socket.user?.username || 'Collaborator',
        });
      }
    });

    /**
     * Event: typing_stop
     * Broadcast to conversation room (excluding the sender)
     */
    socket.on('typing_stop', (data) => {
      const conversationId = typeof data === 'object' ? data?.conversationId : data;
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('typing_stop', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    /**
     * Event: mark_conversation_read
     */
    socket.on('mark_conversation_read', async (data) => {
      try {
        const conversationId = typeof data === 'object' ? data?.conversationId : data;
        if (!conversationId) return;

        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) return;

        if (!conversation.readBy) conversation.readBy = [];
        const now = new Date();
        const readIdx = conversation.readBy.findIndex(
          (r) => r.user?.toString() === socket.userId.toString()
        );

        if (readIdx !== -1) {
          conversation.readBy[readIdx].readAt = now;
        } else {
          conversation.readBy.push({ user: socket.userId, readAt: now });
        }

        await conversation.save();

        socket.emit('conversation_read', {
          conversationId,
          readAt: now,
        });
      } catch (err) {
        console.error('[Socket] mark_conversation_read error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId || socket.id} disconnected`);
    });
  });

  return io;
}

/**
 * Returns the current Socket.io instance
 * @returns {Server|null}
 */
function getIO() {
  return io;
}

/**
 * Checks if a specific user currently has active socket connections
 * @param {string} userId
 * @returns {boolean}
 */
function isUserOnline(userId) {
  if (!io || !userId) return false;
  const userRoom = io.sockets.adapter.rooms.get(`user:${userId.toString()}`);
  const legacyRoom = io.sockets.adapter.rooms.get(userId.toString());
  return !!((userRoom && userRoom.size > 0) || (legacyRoom && legacyRoom.size > 0));
}

module.exports = {
  initSocket,
  getIO,
  isUserOnline,
};
