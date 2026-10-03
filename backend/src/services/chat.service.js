const conversationModel = require('../model/conversation.model');
const workspaceModel = require('../model/workspace.model');
const mongoose = require('mongoose');

/**
 * Get or create the unique project group conversation for a given workspace/project.
 * Synchronizes participants with active members of the workspace.
 * 
 * @param {string|mongoose.Types.ObjectId} workspaceId
 * @returns {Promise<Document>} Conversation document
 */
async function getOrCreateProjectConversation(workspaceId) {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new Error('Invalid workspace ID');
  }

  const workspace = await workspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Determine all active member user IDs
  const activeUserIds = new Set();

  if (Array.isArray(workspace.members) && workspace.members.length > 0) {
    workspace.members.forEach((m) => {
      const uId = m.user?._id || m.user || m;
      const status = m.status || 'active';
      if (uId && status === 'active') {
        activeUserIds.add(uId.toString());
      }
    });
  }

  // Include creator and editor fallback
  if (workspace.creatorId) {
    activeUserIds.add((workspace.creatorId?._id || workspace.creatorId).toString());
  }
  if (workspace.editorId) {
    activeUserIds.add((workspace.editorId?._id || workspace.editorId).toString());
  }

  const participants = Array.from(activeUserIds).map((id) => new mongoose.Types.ObjectId(id));

  // Find existing project conversation by workspaceId or projectId
  let conversation = await conversationModel.findOne({
    type: 'project',
    $or: [{ workspaceId: workspace._id }, { projectId: workspace.projectId }],
  });

  if (!conversation) {
    conversation = await conversationModel.create({
      type: 'project',
      projectId: workspace.projectId,
      workspaceId: workspace._id,
      participants,
    });
  } else {
    // Sync participants if membership changed
    const currentParticipantIds = new Set(conversation.participants.map((p) => p.toString()));
    const needsSync =
      participants.length !== currentParticipantIds.size ||
      participants.some((p) => !currentParticipantIds.has(p.toString()));

    if (needsSync) {
      conversation.participants = participants;
      await conversation.save();
    }
  }

  return conversation;
}

/**
 * Sync active workspace members into project conversation participants.
 * Revokes access from removed/inactive members.
 * 
 * @param {string|mongoose.Types.ObjectId} workspaceId
 * @returns {Promise<Document|null>}
 */
async function syncWorkspaceChatMembers(workspaceId) {
  try {
    return await getOrCreateProjectConversation(workspaceId);
  } catch (err) {
    console.error('[Chat Service] Error syncing workspace chat members:', err.message);
    return null;
  }
}

/**
 * Verify whether a user is an authorized active participant of a conversation.
 * For private chats: user must be in participants.
 * For project chats: user must be in participants AND an active member in workspace.
 * 
 * @param {string|mongoose.Types.ObjectId} conversationId
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<{ authorized: boolean, conversation: Document|null, reason?: string }>}
 */
async function verifyConversationAccess(conversationId, userId) {
  if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return { authorized: false, conversation: null, reason: 'INVALID_ID' };
  }

  const conversation = await conversationModel.findById(conversationId);
  if (!conversation) {
    return { authorized: false, conversation: null, reason: 'CONVERSATION_NOT_FOUND' };
  }

  const uIdStr = userId.toString();

  if (conversation.type === 'private') {
    const isParticipant = conversation.participants.some((p) => p.toString() === uIdStr);
    if (!isParticipant) {
      return { authorized: false, conversation, reason: 'NOT_CONVERSATION_MEMBER' };
    }
    return { authorized: true, conversation };
  }

  if (conversation.type === 'project') {
    if (!conversation.workspaceId) {
      return { authorized: false, conversation, reason: 'WORKSPACE_NOT_LINKED' };
    }

    const workspace = await workspaceModel.findById(conversation.workspaceId);
    if (!workspace) {
      return { authorized: false, conversation, reason: 'WORKSPACE_NOT_FOUND' };
    }

    // Check active workspace membership
    let isActiveMember = false;

    if (workspace.creatorId && (workspace.creatorId?._id || workspace.creatorId).toString() === uIdStr) {
      isActiveMember = true;
    } else if (workspace.editorId && (workspace.editorId?._id || workspace.editorId).toString() === uIdStr) {
      isActiveMember = true;
    } else if (Array.isArray(workspace.members)) {
      isActiveMember = workspace.members.some((m) => {
        const mUserId = (m.user?._id || m.user || m).toString();
        const status = m.status || 'active';
        return mUserId === uIdStr && status === 'active';
      });
    }

    if (!isActiveMember) {
      // If user was previously in conversation participants, remove them
      if (conversation.participants.some((p) => p.toString() === uIdStr)) {
        conversation.participants = conversation.participants.filter((p) => p.toString() !== uIdStr);
        await conversation.save();
      }
      return { authorized: false, conversation, reason: 'NOT_ACTIVE_WORKSPACE_MEMBER' };
    }

    // Make sure user is in participants list
    if (!conversation.participants.some((p) => p.toString() === uIdStr)) {
      conversation.participants.push(new mongoose.Types.ObjectId(uIdStr));
      await conversation.save();
    }

    return { authorized: true, conversation };
  }

  return { authorized: false, conversation, reason: 'UNKNOWN_CONVERSATION_TYPE' };
}

module.exports = {
  getOrCreateProjectConversation,
  syncWorkspaceChatMembers,
  verifyConversationAccess,
};
