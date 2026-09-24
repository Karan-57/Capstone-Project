const { Router } = require('express');
const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const applicationRouter = Router();

/**
 * @route POST api/application/:id/apply
 * @description Apply to a project with a proposal (:id is project ID)
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
 * @description View application details by application ID (:id is application ID)
 * @access Private (Applicant Editor or Project Creator)
 */
applicationRouter.get('/:id', authMiddleware, applicationController.getApplicationByIdController);

/**
 * @route PATCH api/application/:id
 * @description Update proposal, bidAmount, or delivery days (:id is application ID)
 * @access Private (Editor who submitted the application)
 */
applicationRouter.patch('/:id', authMiddleware, applicationController.updateApplicationController);

/**
 * @route DELETE api/application/:id
 * @description Withdraw application (:id is application ID)
 * @access Private (Editor who submitted the application)
 */
applicationRouter.delete('/:id', authMiddleware, applicationController.withdrawApplicationController);

module.exports = applicationRouter;