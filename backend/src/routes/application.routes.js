const { Router } = require('express');
const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const applicationRouter = Router();

/**
 * @route POST api/application/:id/apply
 * @description Apply to a project with a proposal
 * @access Private (Editor)
 */
applicationRouter.post('/:id/apply', authMiddleware, applicationController.applyToProjectController);

/**
 * @route GET api/application/my
 * @description View all applications submitted by the logged-in editor
 * @access Private (Editor)
 */
applicationRouter.get('/my', authMiddleware, applicationController.getMyApplicationsController);

/**
 * @route GET api/application/:id
 * @description View all applications for a project (creator only) using project id (:id)
 * @access Private (Creator)
 */
applicationRouter.get('/:id', authMiddleware, applicationController.getProjectApplicationsController);

module.exports = applicationRouter;