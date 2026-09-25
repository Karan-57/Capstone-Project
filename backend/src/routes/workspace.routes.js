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

/**
 * @route POST api/workspace/:deliveryId/revision
 * @description Request a revision for a delivery
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.post(['/:deliveryId/revision', '/delivery/:deliveryId/revision'], authMiddleware, workspaceController.createRevisionController);

/**
 * @route GET api/workspace/:revisionId/revsion
 * @route GET api/workspace/revision/:revisionId
 * @description Get a revision by its ID
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get(['/:revisionId/revsion', '/revision/:revisionId'], authMiddleware, workspaceController.getRevisionByIdController);

/**
 * @route GET api/workspace/:workspaceId/revision
 * @description View all revisions for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get('/:workspaceId/revision', authMiddleware, workspaceController.getWorkspaceRevisionsController);

/**
 * @route PATCH api/workspace/:revisionId/revision
 * @description Update a revision request status or description
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.patch(['/:revisionId/revision', '/revision/:revisionId'], authMiddleware, workspaceController.updateRevisionController);

/**
 * @route POST api/workspace/:workspaceId/deliver
 * @description Deliver final video cut for a workspace
 * @access Private (Assigned Editor)
 */
workspaceRouter.post('/:workspaceId/deliver', authMiddleware, workspaceController.deliverWorkspaceController);

/**
 * @route GET api/workspace/:workspaceId/deliveries
 * @description View all deliveries for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get('/:workspaceId/deliveries', authMiddleware, workspaceController.getWorkspaceDeliveriesController);

module.exports = workspaceRouter;


