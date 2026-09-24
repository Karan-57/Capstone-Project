const { Router } = require('express');
const creatorController = require('../controllers/creator.controller');
const authMiddleware = require('../middleware/auth.middleware');

const creatorRouter = Router();

/**
 * @route POST api/creator/projects
 * @description create a new project
 * @access Private (Creator)
 */
creatorRouter.post('/projects', authMiddleware.authUser, creatorController.createProjectController);

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
 * @description cancel a project and set status to cancelled
 * @access Private (Creator)
 */
creatorRouter.patch('/projects/:projectId/cancel', authMiddleware.authUser, creatorController.cancelProjectController);

const applicationController = require('../controllers/application.controller');

/**
 * @route GET api/creator/projects/:projectId/applications
 * @description get all applications for a specific creator project
 * @access Private (Creator)
 */
creatorRouter.get('/projects/:projectId/applications', authMiddleware.authUser, applicationController.getProjectApplicationsController);

module.exports = creatorRouter;