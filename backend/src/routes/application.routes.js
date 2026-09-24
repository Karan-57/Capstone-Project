const { Router } = require('express');
const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const applicationRouter = Router();

/**
 * @route POST api/application/:projectId/apply
 * @description Apply to a project with a proposal
 * @access Private (Editor)
 */
applicationRouter.post('/:projectId/apply', authMiddleware, applicationController.applyToProjectController);

/**
 * @route GET api/application/my
 * @description View all applications submitted by the logged-in editor
 * @access Private (Editor)
 */
applicationRouter.get('/my', authMiddleware, applicationController.getMyApplicationsController);

/**
 * @route GET api/application/:applicationId
 * @description View application details by applicationId
 * @access Private (Applicant Editor or Project Creator)
 */
applicationRouter.get('/:applicationId', authMiddleware, applicationController.getApplicationByIdController);

/**
 * @route PATCH api/application/:applicationId
 * @description Update proposal, bidAmount, or delivery days by applicationId
 * @access Private (Editor who submitted the application)
 */
applicationRouter.patch('/:applicationId', authMiddleware, applicationController.updateApplicationController);

/**
 * @route DELETE api/application/:applicationId
 * @description Withdraw application by applicationId
 * @access Private (Editor who submitted the application)
 */
applicationRouter.delete('/:applicationId', authMiddleware, applicationController.withdrawApplicationController);

/**
 * @route POST api/application/:applicationId/accept
 * @description Accept an application and assign editor to project by applicationId
 * @access Private (Creator who owns the project)
 */
applicationRouter.post('/:applicationId/accept', authMiddleware, applicationController.acceptApplicationController);

/**
 * @route POST api/application/:applicationId/reject
 * @description Reject an application by applicationId
 * @access Private (Creator who owns the project)
 */
applicationRouter.post('/:applicationId/reject', authMiddleware, applicationController.rejectApplicationController);

module.exports = applicationRouter;