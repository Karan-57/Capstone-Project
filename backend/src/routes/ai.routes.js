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

/**
 * @route POST /api/ai/suggest-editor-bid/:projectId?
 * @description Generate strategic bid amount, turnaround time, and tailored proposal note for an editor
 * @access Private (Editor)
 */
aiRouter.post(
  ['/suggest-editor-bid', '/suggest-editor-bid/:projectId'],
  authUser,
  aiController.suggestEditorBidController
);

module.exports = aiRouter;
