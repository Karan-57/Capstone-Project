const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const { authUser } = require('../middleware/auth.middleware');

const aiRouter = Router();

/**
 * @route POST /api/ai/suggest-budget-timeline
 * @description Estimate budget range, turnaround timeline, and complexity using AI
 * @access Private
 */
aiRouter.post('/suggest-budget-timeline', authUser, aiController.suggestBudgetAndTimelineController);

/**
 * @route POST /api/ai/suggest-top-proposals/:projectId?
 * @description Analyze and rank top 3 candidate proposals for a project
 * @access Private (Creator)
 */
aiRouter.post(
  ['/suggest-top-proposals', '/suggest-top-proposals/:projectId'],
  authUser,
  aiController.suggestTopProposalsController
);

aiRouter.post(
  ['/suggest-editor-bid', '/suggest-editor-bid/:projectId'],
  authUser,
  aiController.suggestEditorBidController
);

/**
 * @route POST /api/ai/suggest-role-deadline
 * @description Generate AI-suggested deadline, milestone title, skills and tools for a specific hiring role
 * @access Private
 */
aiRouter.post(
  '/suggest-role-deadline',
  authUser,
  aiController.suggestRoleDeadlineController
);

module.exports = aiRouter;
