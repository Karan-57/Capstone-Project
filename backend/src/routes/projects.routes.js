const { Router } = require('express');
const projectController = require('../controllers/projects.controller');

const projectRouter = Router();
 
/**
 * @route GET api/projects
 * @description get all open projects
 * @access Public
 */
projectRouter.get('/', projectController.getAllOpenProjectsController);

/**
 * @route GET api/projects/creator/:creatorId
 * @description get all public projects of a specific creator
 * @access Public
 */
projectRouter.get('/creator/:creatorId', projectController.getCreatorPublicProjectsController);

/**
 * @route GET api/projects/search
 * @description search open projects by query
 * @access Public
 */
projectRouter.get('/search', projectController.searchProjectsController);

/**
 * @route GET api/projects/:id
 * @description get project details by project ID
 * @access Public
 */
projectRouter.get('/:id', projectController.getProjectByIdController);

const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route POST api/projects/:id/apply
 * @description apply to a project as editor
 * @access Private (Editor)
 */
projectRouter.post('/:id/apply', authMiddleware, applicationController.applyToProjectController);

module.exports = projectRouter;