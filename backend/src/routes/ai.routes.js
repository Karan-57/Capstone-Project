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
 * @route POST /api/ai/suggest-editor-bid/:projectId?
 * @description Estimate strategic bid amount, delivery days, and cover proposal using AI
 * @access Private
 */
aiRouter.post(
  '/suggest-editor-bid/:projectId?',
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
