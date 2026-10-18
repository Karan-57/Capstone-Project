const conversationModel = require('../model/conversation.model');
const userModel = require('../model/user.model');
const workspaceModel = require('../model/workspace.model');
const projectModel = require('../model/project.model');
const mongoose = require('mongoose');
const { getOrCreateProjectConversation, verifyConversationAccess } = require('../services/chat.service');

/**
 * @name getOrCreatePrivateConversationController
 * @description Create or retrieve an existing private conversation between 2 users
 * @route POST /api/conversations
 * @access Private
 */
async function getOrCreatePrivateConversationController(req, res) {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const { recipientId, workspaceId } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated' });
    }

    // If client requested project conversation via workspaceId
    if (workspaceId) {
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid workspace ID' });
      }

      const conversation = await getOrCreateProjectConversation(workspaceId);
      const access = await verifyConversationAccess(conversation._id, currentUserId);

      if (!access.authorized) {
        return res.status(403).json({
          message: 'Forbidden: You are not an active member of this project workspace',
          code: access.reason,
        });
      }

      await conversation.populate('participants', 'name username email profileImage role rating');
      await conversation.populate('projectId', 'title category status');
      await conversation.populate('workspaceId', 'status');

      return res.status(200).json({
        conversation,
      });
    }

    // Otherwise private 1-on-1 conversation
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Valid recipient ID is required' });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot create a private conversation with yourself' });
    }

    const recipient = await userModel.findById(recipientId).select('name username email profileImage role');
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Order-independent lookup for exactly [currentUserId, recipientId]
    let conversation = await conversationModel.findOne({
      type: 'private',
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    });

    let statusCode = 200;
    if (!conversation) {
      conversation = await conversationModel.create({
        type: 'private',
        participants: [currentUserId, recipientId],
        projectId: null,
        workspaceId: null,
      });
      statusCode = 201;
    }

    await conversation.populate('participants', 'name username email profileImage role rating');

    return res.status(statusCode).json({
      conversation,
    });
  } catch (err) {
    console.error('Error in getOrCreatePrivateConversationController:', err);
    return res.status(500).json({
      message: 'Internal server error while resolving conversation',
      error: err.message,
    });
  }
}

/**
 * @name getMyConversationsController
 * @description Get all private and project conversations for the authenticated user
 * @route GET /api/conversations
 * @access Private
 */
async function getMyConversationsController(req, res) {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated' });
    }

    const { type, projectId, workspaceId, scope } = req.query;
    const requestedType = type || (scope === 'dm' ? 'private' : (scope === 'project' || scope === 'workspace' ? 'project' : null));

    // Base participant filter
    const filter = {
      participants: currentUserId,
    };

    if (requestedType === 'private') {
      filter.type = 'private';
      filter.workspaceId = null;
    } else if (requestedType === 'project') {
      filter.$or = [
        { type: 'project' },
        { projectId: { $ne: null } },
        { workspaceId: { $ne: null } },
      ];
    }

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      filter.projectId = new mongoose.Types.ObjectId(projectId);
    }

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.workspaceId = new mongoose.Types.ObjectId(workspaceId);
    }

    // Only sync workspace project conversations when NOT strictly requesting private DMs
    if (requestedType !== 'private') {
      const activeWorkspaces = await workspaceModel.find({
        $or: [
          { creatorId: currentUserId },
          { editorId: currentUserId },
          { 'members.user': currentUserId, 'members.status': 'active' },
        ],
        status: { $ne: 'cancelled' },
      }).select('_id').lean();

      if (activeWorkspaces.length > 0) {
        const existingConversations = await conversationModel.find({
          type: 'project',
          workspaceId: { $in: activeWorkspaces.map((w) => w._id) },
        }).select('workspaceId').lean();

        const existingWsIds = new Set(
          existingConversations.map((c) => c.workspaceId ? c.workspaceId.toString() : '')
        );

        const missingWorkspaces = activeWorkspaces.filter(
          (ws) => !existingWsIds.has(ws._id.toString())
        );

        if (missingWorkspaces.length > 0) {
          await Promise.all(
            missingWorkspaces.map((ws) => getOrCreateProjectConversation(ws._id).catch(() => {}))
          );
        }
      }
    }

    // Query conversations with the constructed filter
    const conversations = await conversationModel
      .find(filter)
      .populate('participants', 'name username email profileImage role rating')
      .populate('projectId', 'title category status budget deadline')
      .populate('workspaceId', 'status')
      .populate('lastMessage.sender', 'name username profileImage')
      .sort({ updatedAt: -1 })
      .lean();

    // Compute unread status for each conversation
    const formatted = conversations.map((conv) => {
      const convObj = conv.toObject ? conv.toObject() : conv;
      const readEntry = conv.readBy?.find(
        (r) => r.user?.toString() === currentUserId.toString()
      );
      const lastReadAt = readEntry ? new Date(readEntry.readAt).getTime() : 0;
      const lastMessageTime = conv.lastMessage?.createdAt
        ? new Date(conv.lastMessage.createdAt).getTime()
        : 0;

      const isUnread =
        lastMessageTime > lastReadAt &&
        conv.lastMessage?.sender?._id?.toString() !== currentUserId.toString();

      return {
        ...convObj,
        isUnread,
      };
    });

    return res.status(200).json({
      count: formatted.length,
      conversations: formatted,
      filter: {
        type: requestedType || 'all',
        projectId: projectId || null,
        workspaceId: workspaceId || null,
      },
    });
  } catch (err) {
    console.error('Error in getMyConversationsController:', err);
    return res.status(500).json({
      message: 'Internal server error while fetching conversations',
      error: err.message,
    });
  }
}

/**
 * @name getConversationByIdController
 * @description Get details of a single conversation
 * @route GET /api/conversations/:conversationId
 * @access Private
 */
async function getConversationByIdController(req, res) {
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

    const conversation = await conversationModel
      .findById(conversationId)
      .populate('participants', 'name username email profileImage role rating')
      .populate('projectId', 'title category status budget deadline')
      .populate('workspaceId', 'status')
      .populate('lastMessage.sender', 'name username profileImage');

    return res.status(200).json({
      conversation,
    });
  } catch (err) {
    console.error('Error in getConversationByIdController:', err);
    return res.status(500).json({
      message: 'Internal server error while fetching conversation details',
      error: err.message,
    });
  }
}

/**
 * @name getProjectConversationByWorkspaceController
 * @description Get or initialize the project conversation for a workspace
 * @route GET /api/conversations/project/:workspaceId
 * @access Private
 */
async function getProjectConversationByWorkspaceController(req, res) {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const { workspaceId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    const conversation = await getOrCreateProjectConversation(workspaceId);
    const access = await verifyConversationAccess(conversation._id, currentUserId);

    if (!access.authorized) {
      return res.status(403).json({
        message: 'Forbidden: You are not an active member of this project workspace',
        code: access.reason,
      });
    }

    await conversation.populate('participants', 'name username email profileImage role rating');
    await conversation.populate('projectId', 'title category status budget deadline');
    await conversation.populate('workspaceId', 'status');

    return res.status(200).json({
      conversation,
    });
  } catch (err) {
    console.error('Error in getProjectConversationByWorkspaceController:', err);
    return res.status(500).json({
      message: 'Internal server error while fetching project conversation',
      error: err.message,
    });
  }
}

/**
 * @name markConversationReadController
 * @description Mark a conversation as read by the authenticated user
 * @route PATCH /api/conversations/:conversationId/read
 * @access Private
 */
async function markConversationReadController(req, res) {
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

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.readBy) {
      conversation.readBy = [];
    }

    const existingIdx = conversation.readBy.findIndex(
      (r) => r.user?.toString() === currentUserId.toString()
    );

    const now = new Date();
    if (existingIdx !== -1) {
      conversation.readBy[existingIdx].readAt = now;
    } else {
      conversation.readBy.push({ user: currentUserId, readAt: now });
    }

    await conversation.save();

    return res.status(200).json({
      message: 'Conversation marked as read',
      conversationId: conversation._id,
      readAt: now,
    });
  } catch (err) {
    console.error('Error in markConversationReadController:', err);
    return res.status(500).json({
      message: 'Internal server error while marking conversation read',
      error: err.message,
    });
  }
}

module.exports = {
  getOrCreatePrivateConversationController,
  getMyConversationsController,
  getConversationByIdController,
  getProjectConversationByWorkspaceController,
  markConversationReadController,
};
