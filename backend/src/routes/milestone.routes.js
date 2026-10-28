const { Router } = require('express');
const milestoneController = require('../controllers/milestone.controller');
const authMiddleware = require('../middleware/auth.middleware');

const milestoneRouter = Router();

/**
 * @route GET /api/milestones
 * @description Fetch authoritative milestones for a workspace, project, or role hiring
 * @access Private (Authenticated User)
 */
milestoneRouter.get('/', authMiddleware.authUser, milestoneController.getMilestonesController);

/**
 * @route POST /api/milestones/:milestoneId/submit
 * @description Submit deliverable cut URL and notes for creator review
 * @access Private (Hired Freelancer)
 */
milestoneRouter.post('/:milestoneId/submit', authMiddleware.authUser, milestoneController.submitMilestoneDeliverableController);

/**
 * @route POST /api/milestones/:milestoneId/request-revision
 * @description Creator requests a revision on a submitted milestone cut
 * @access Private (Creator)
 */
milestoneRouter.post('/:milestoneId/request-revision', authMiddleware.authUser, milestoneController.requestMilestoneRevisionController);

module.exports = milestoneRouter;
