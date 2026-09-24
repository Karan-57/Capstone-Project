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

module.exports = applicationRouter;