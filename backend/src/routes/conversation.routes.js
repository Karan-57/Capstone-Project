const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const conversationController = require('../controllers/conversation.controller');
const messageController = require('../controllers/message.controller');

const conversationRouter = Router();

// Protect all conversation routes
conversationRouter.use(authMiddleware);

/**
 * @route POST /api/conversations
 * @description Get or create a private conversation or lookup project conversation
 */
conversationRouter.post('/', conversationController.getOrCreatePrivateConversationController);

/**
 * @route GET /api/conversations
 * @description Get all private & project conversations for authenticated user
 */
conversationRouter.get('/', conversationController.getMyConversationsController);

/**
 * @route GET /api/conversations/project/:workspaceId
 * @description Get project conversation for a workspace
 */
conversationRouter.get('/project/:workspaceId', conversationController.getProjectConversationByWorkspaceController);

/**
 * @route GET /api/conversations/:conversationId
 * @description Get conversation details
 */
conversationRouter.get('/:conversationId', conversationController.getConversationByIdController);

/**
 * @route PATCH /api/conversations/:conversationId/read
 * @description Mark a conversation as read
 */
conversationRouter.patch('/:conversationId/read', conversationController.markConversationReadController);

/**
 * @route GET /api/conversations/:conversationId/messages
 * @description Get paginated messages for a conversation
 */
conversationRouter.get('/:conversationId/messages', messageController.getConversationMessagesController);

/**
 * @route POST /api/conversations/:conversationId/messages
 * @description Send message via REST API
 */
conversationRouter.post('/:conversationId/messages', messageController.sendRestMessageController);

module.exports = conversationRouter;
