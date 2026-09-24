const { Router } = require('express');
const workspaceController = require('../controllers/workspace.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const workspaceRouter = Router();

/**
 * @route GET api/workspace/:workspaceId/progress
 * @description Get progress updates for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get('/:workspaceId/progress', authMiddleware, workspaceController.getWorkspaceProgressController);

/**
 * @route PATCH api/workspace/:workspaceId/progress
 * @description Add a progress update and update workspace progress
 * @access Private (Assigned Editor)
 */
workspaceRouter.patch('/:workspaceId/progress', authMiddleware, workspaceController.updateWorkspaceProgressController);

module.exports = workspaceRouter;
