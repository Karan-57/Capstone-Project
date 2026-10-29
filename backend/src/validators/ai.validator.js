const { z } = require('zod');

const suggestBudgetTimelineInputSchema = z.object({
  category: z.string().optional().default('Video Editing'),
  editingStyle: z.string().optional().default('Standard'),
  requiredSkills: z.union([z.array(z.string()), z.string()]).optional().default([]),
  expectedVideoDuration: z.string().optional().default('Standard'),
  currency: z.string().optional().default('INR'),
}).refine(
  (data) => {
    const hasSkills = Array.isArray(data.requiredSkills)
      ? data.requiredSkills.length > 0
      : Boolean(data.requiredSkills && data.requiredSkills.trim());
    return Boolean(data.category || data.editingStyle || data.expectedVideoDuration || hasSkills);
  },
  {
    message: 'Please provide at least a category, editing style, duration, or required skills to estimate budget & timeline',
  }
);

const suggestEditorBidInputSchema = z.object({
  projectId: z.string().optional(),
  hiringId: z.string().optional(),
  roleId: z.string().optional(),
  roleBudget: z.union([z.number(), z.string()]).optional(),
  project: z.record(z.any()).optional().default({}),
});

const suggestRoleDeadlineInputSchema = z.object({
  roleTitle: z.string().min(1, 'Role title is required'),
  roleCategory: z.string().optional().default('Video Editing'),
  projectDescription: z.string().optional().default(''),
  videoDuration: z.union([z.number(), z.string()]).optional().default(''),
  complexity: z.string().optional().default('Intermediate'),
});

module.exports = {
  suggestBudgetTimelineInputSchema,
  suggestEditorBidInputSchema,
  suggestRoleDeadlineInputSchema,
};
