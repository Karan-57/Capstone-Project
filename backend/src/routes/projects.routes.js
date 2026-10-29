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
 * @route GET api/projects/:projectId
 * @description get project details by project ID
 * @access Public
 */
projectRouter.get('/:projectId', projectController.getProjectByIdController);

const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const usersController = require('../controllers/users.controller');
const creatorController = require('../controllers/creator.controller');

/**
 * @route POST api/projects/:projectId/apply
 * @description apply to a project as editor
 * @access Private (Editor)
 */
projectRouter.post('/:projectId/apply', authMiddleware, applicationController.applyToProjectController);

/**
 * @route PATCH api/projects/:projectId
 * @description update a project (creator only)
 * @access Private (Creator)
 */
projectRouter.patch('/:projectId', authMiddleware, creatorController.updateProjectController);

/**
 * @route PATCH api/projects/:projectId/cancel
 * @description close/cancel a project
 * @access Private (Creator)
 */
projectRouter.patch('/:projectId/cancel', authMiddleware, creatorController.cancelProjectController);

/**
 * @route POST api/projects/:projectId/reviews
 * @description Submit project review (creator reviews editor or editor reviews creator)
 * @access Private (Project Creator or Assigned Editor)
 */
projectRouter.post('/:projectId/reviews', authMiddleware, async (req, res, next) => {
    if (req.user?.role === 'creator') {
        return usersController.reviewEditorController(req, res, next);
    }
    return usersController.reviewCreatorController(req, res, next);
});

module.exports = projectRouter;
