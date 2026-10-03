const messageModel = require('../model/message.model');
const conversationModel = require('../model/conversation.model');
const mongoose = require('mongoose');
const { verifyConversationAccess } = require('../services/chat.service');

/**
 * @name getConversationMessagesController
 * @description Get paginated message history for a conversation
 * @route GET /api/conversations/:conversationId/messages
 * @access Private
 */
async function getConversationMessagesController(req, res) {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const { conversationId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const access = await verifyConversationAccess(conversationId, currentUserId);
    if (!access.authorized) {
      return res.status(403).json({
        message: 'Forbidden: You do not have access to this conversation',
        code: access.reason,
      });
    }

    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
    const before = req.query.before; // ISO date string or message ID

    const query = {
      conversationId,
      deletedAt: null,
    };

    if (before) {
      if (mongoose.Types.ObjectId.isValid(before)) {
        const refMsg = await messageModel.findById(before);
        if (refMsg) {
          query.createdAt = { $lt: refMsg.createdAt };
        }
      } else if (!isNaN(Date.parse(before))) {
        query.createdAt = { $lt: new Date(before) };
      }
    }

    // Fetch messages sorted newest first, then reverse for chat display
    const messages = await messageModel
      .find(query)
      .populate('sender', 'name username email profileImage role rating')
      .sort({ createdAt: -1 })
      .limit(limit);

    const hasMore = messages.length === limit;
    const orderedMessages = messages.reverse();

    return res.status(200).json({
      count: orderedMessages.length,
      hasMore,
      oldestTimestamp: orderedMessages.length > 0 ? orderedMessages[0].createdAt : null,
      messages: orderedMessages,
    });
  } catch (err) {
    console.error('Error in getConversationMessagesController:', err);
    return res.status(500).json({
      message: 'Internal server error while fetching messages',
      error: err.message,
    });
  }
}

/**
 * @name sendRestMessageController
 * @description Fallback REST endpoint for sending a message (e.g. file upload or HTTP client)
 * @route POST /api/conversations/:conversationId/messages
 * @access Private
 */
async function sendRestMessageController(req, res) {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const { conversationId } = req.params;
    const { text, messageType, attachments } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const access = await verifyConversationAccess(conversationId, currentUserId);
    if (!access.authorized) {
      return res.status(403).json({
        message: 'Forbidden: You do not have access to this conversation',
        code: access.reason,
      });
    }

    const validAttachments = Array.isArray(attachments) ? attachments : [];
    const trimmedText = typeof text === 'string' ? text.trim() : '';

    if (!trimmedText && validAttachments.length === 0) {
      return res.status(400).json({ message: 'Message text or attachments required' });
    }

    const msgType = ['text', 'file', 'image'].includes(messageType)
      ? messageType
      : validAttachments.length > 0
      ? validAttachments[0].type?.startsWith('image')
        ? 'image'
        : 'file'
      : 'text';

    // 1. Create message in MongoDB
    const newMessage = await messageModel.create({
      conversationId,
      sender: currentUserId,
      messageType: msgType,
      text: trimmedText,
      attachments: validAttachments,
    });

    // 2. Update conversation.lastMessage
    const conversation = await conversationModel.findById(conversationId);
    if (conversation) {
      conversation.lastMessage = {
        messageId: newMessage._id,
        text: trimmedText || (msgType === 'image' ? '📷 Image' : '📎 Attachment'),
        sender: currentUserId,
        createdAt: newMessage.createdAt,
      };

      if (!conversation.readBy) conversation.readBy = [];
      const readIdx = conversation.readBy.findIndex(
        (r) => r.user?.toString() === currentUserId.toString()
      );
      if (readIdx !== -1) {
        conversation.readBy[readIdx].readAt = newMessage.createdAt;
      } else {
        conversation.readBy.push({ user: currentUserId, readAt: newMessage.createdAt });
      }

      await conversation.save();
    }

    await newMessage.populate('sender', 'name username email profileImage role rating');

    // 3. Emit through Socket.io if available
    const { getIO } = require('../socket');
    const io = getIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit('new_message', newMessage);

      // Notify participant personal rooms
      if (conversation && Array.isArray(conversation.participants)) {
        conversation.participants.forEach((pId) => {
          io.to(`user:${pId.toString()}`).emit('conversation_updated', {
            conversationId: conversation._id,
            lastMessage: conversation.lastMessage,
            updatedAt: conversation.updatedAt,
          });
        });
      }
    }

    return res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (err) {
    console.error('Error in sendRestMessageController:', err);
    return res.status(500).json({
      message: 'Internal server error while sending message',
      error: err.message,
    });
  }
}

module.exports = {
  getConversationMessagesController,
  sendRestMessageController,
};
