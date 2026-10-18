const { Router } = require('express');
const creatorController = require('../controllers/creator.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/file.middleware');

const creatorRouter = Router();

/**
 * @route POST api/creator/projects
 * @description create a new project (supports optional multipart reference images)
 * @access Private (Creator)
 */
creatorRouter.post('/projects', [authMiddleware.authUser, upload.array('images', 3)], creatorController.createProjectController);

/**
 * @route POST api/creator/projects/reference-images
 * @route POST api/creator/upload-reference-images
 * @description upload reference images/moodboard to ImageKit (max 3 images)
 * @access Private (Creator)
 */
creatorRouter.post('/projects/reference-images', [authMiddleware.authUser, upload.array('images', 3)], creatorController.uploadReferenceImagesController);
creatorRouter.post('/upload-reference-images', [authMiddleware.authUser, upload.array('images', 3)], creatorController.uploadReferenceImagesController);

/**
 * @route GET api/creator/projects
 * @description get all projects created by authenticated creator
 * @access Private (Creator)
 */
creatorRouter.get('/projects', authMiddleware.authUser, creatorController.getMyProjectsController);

/**
 * @route PATCH api/creator/projects/:projectId
 * @description update a project
 * @access Private (Creator)
 */
creatorRouter.patch('/projects/:projectId', authMiddleware.authUser, creatorController.updateProjectController);

/**
 * @route DELETE api/creator/projects/:projectId
 * @description delete a project
 * @access Private (Creator)
 */
creatorRouter.delete('/projects/:projectId', authMiddleware.authUser, creatorController.deleteProjectController);

/**
 * @route PATCH api/creator/projects/:projectId/cancel
 * @description cancel or close a project and set status to cancelled
 * @access Private (Creator)
 */
creatorRouter.patch(['/projects/:projectId/cancel', '/projects/:projectId/close', '/:projectId/cancel', '/:projectId/close'], authMiddleware.authUser, creatorController.cancelProjectController);

const applicationController = require('../controllers/application.controller');

/**
 * @route GET api/creator/projects/:projectId/applications
 * @description get all applications for a specific creator project
 * @access Private (Creator)
 */
creatorRouter.get('/projects/:projectId/applications', authMiddleware.authUser, applicationController.getProjectApplicationsController);

/**
 * @route POST api/creator/projects/:projectId/disband
 * @description disband chosen editor during assigned stage and reopen project
 * @access Private (Creator)
 */
creatorRouter.post('/projects/:projectId/disband', authMiddleware.authUser, applicationController.disbandEditorController);

/**
 * @route GET api/creator/projects/:projectId
 * @description get comprehensive project details by ID
 * @access Private (Creator)
 */
creatorRouter.get('/projects/:projectId', authMiddleware.authUser, creatorController.getProjectByIdController);

/**
 * @route GET api/creator/projects/:projectId/hirings
 * @description get all role hirings and hired freelancers for a project
 * @access Private (Creator)
 */
creatorRouter.get('/projects/:projectId/hirings', authMiddleware.authUser, creatorController.getProjectHiringsController);

/**
 * @route POST api/creator/projects/:projectId/hirings
 * @description post a new hiring position for a project
 * @access Private (Creator)
 */
creatorRouter.post('/projects/:projectId/hirings', authMiddleware.authUser, creatorController.addProjectHiringController);

/**
 * @route DELETE api/creator/projects/:projectId/hirings/:hiringId
 * @description remove a hiring position from a project
 * @access Private (Creator)
 */
creatorRouter.delete('/projects/:projectId/hirings/:hiringId', authMiddleware.authUser, creatorController.deleteProjectHiringController);

/**
 * @route POST api/creator/projects/:projectId/hirings/:hiringId/remove-member
 * @description remove an approved team member who hasn't started work yet and reopen the role
 * @access Private (Creator)
 */
creatorRouter.post('/projects/:projectId/hirings/:hiringId/remove-member', authMiddleware.authUser, creatorController.removeHiredMemberController);

/**
 * @route PATCH api/creator/projects/:projectId/hirings/:hiringId/milestones
 * @description update milestones for a specific hiring role
 * @access Private (Creator or Authenticated User)
 */
creatorRouter.patch('/projects/:projectId/hirings/:hiringId/milestones', authMiddleware.authUser, creatorController.updateRoleMilestonesController);

module.exports = creatorRouter;