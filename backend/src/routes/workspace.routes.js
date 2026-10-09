const { Router } = require('express');
const multer = require('multer');
const workspaceController = require('../controllers/workspace.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const workspaceRouter = Router();

// In-memory multer storage for workspace uploads (up to 25MB per file)
const workspaceUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }
});

/**
 * @route GET api/workspace
 * @description Get all workspaces accessible by current user
 * @access Private
 */
workspaceRouter.get('/', authMiddleware, workspaceController.getMyWorkspacesController);

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
workspaceRouter.post(['/:deliveryId/revision', '/:deliveryId/revisions'], authMiddleware, workspaceController.createRevisionController);

/**
 * @route GET api/workspace/:revisionId/revision
 * @description Get a revision by its ID
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get(['/:revisionId/revision', '/:revisionId/revsion', '/revision/:revisionId', '/:revisionId/revisions'], authMiddleware, workspaceController.getRevisionByIdController);

/**
 * @route GET api/workspace/:workspaceId/revision
 * @description View all revisions for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get(['/:workspaceId/revision', '/:workspaceId/revisions'], authMiddleware, workspaceController.getWorkspaceRevisionsController);

/**
 * @route PATCH api/workspace/:revisionId/revision
 * @description Update a revision request status or description
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.patch(['/:revisionId/revision', '/:revisionId/revisions', '/revision/:revisionId'], authMiddleware, workspaceController.updateRevisionController);

/**
 * @route POST api/workspace/:workspaceId/deliver
 * @description Deliver final video cut for a workspace
 * @access Private (Assigned Editor)
 */
workspaceRouter.post(['/:workspaceId/deliver', '/:workspaceId/deliveries'], authMiddleware, workspaceController.deliverWorkspaceController);

/**
 * @route GET api/workspace/:workspaceId/deliveries
 * @description View all deliveries for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get('/:workspaceId/deliveries', authMiddleware, workspaceController.getWorkspaceDeliveriesController);

/**
 * @route POST api/workspace/:deliveryId/approve
 * @description Approve a delivery for a workspace
 * @access Private (Workspace Creator)
 */
workspaceRouter.post(['/:deliveryId/approve', '/delivery/:deliveryId/approve'], authMiddleware, workspaceController.approveDeliveryController);

/**
 * @route POST api/workspace/:workspaceId/files
 * @description Upload or add a file to the workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.post('/:workspaceId/files', authMiddleware, workspaceUpload.any(), workspaceController.uploadWorkspaceFileController);

/**
 * @route GET api/workspace/:workspaceId/files
 * @description View all files for a workspace
 * @access Private (Workspace Creator or Editor)
 */
workspaceRouter.get('/:workspaceId/files', authMiddleware, workspaceController.getWorkspaceFilesController);

/**
 * @route DELETE api/workspace/:workspaceId/files/:fileId
 * @description Delete a file from a workspace
 * @access Private (Workspace Creator or Uploader)
 */
workspaceRouter.delete(['/:workspaceId/files/:fileId', '/:workspaceId/files/:id'], authMiddleware, workspaceController.deleteWorkspaceFileController);

/**
 * @route GET api/workspace/:workspaceId
 * @description Get workspace details by workspace ID
 * @access Private
 */
workspaceRouter.get('/:workspaceId', authMiddleware, workspaceController.getWorkspaceByIdController);

module.exports = workspaceRouter;


