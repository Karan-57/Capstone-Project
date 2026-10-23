const mongoose = require('mongoose');
const aiService = require('../services/ai.service');
const projectModel = require('../model/project.model');
const applicationModel = require('../model/application.model');
const portfolioModel = require('../model/portfolio.model');

/**
 * @name suggestBudgetAndTimelineController
 * @route POST /api/ai/suggest-budget-timeline
 * @description Provides AI estimation for video editing budget range, timeline, and complexity
 * @access Private (Authenticated User)
 */
async function suggestBudgetAndTimelineController(req, res) {
  try {
    const {
      category,
      editingStyle,
      requiredSkills,
      expectedVideoDuration,
      currency = 'INR'
    } = req.body;

    if (!category && !editingStyle && !expectedVideoDuration && (!requiredSkills || requiredSkills.length === 0)) {
      return res.status(400).json({
        message: 'Please provide at least a category, editing style, duration, or required skills to estimate budget & timeline'
      });
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : (typeof requiredSkills === 'string' && requiredSkills.trim() ? requiredSkills.split(',').map(s => s.trim()) : []);

    const suggestion = await aiService.suggestBudgetAndTimeline({
      category: category ? String(category).trim() : 'Video Editing',
      editingStyle: editingStyle ? String(editingStyle).trim() : 'Standard',
      requiredSkills: skillsArray,
      expectedVideoDuration: expectedVideoDuration ? String(expectedVideoDuration).trim() : 'Standard',
      currency: currency ? String(currency).trim().toUpperCase() : 'INR'
    });

    return res.status(200).json({
      message: 'AI budget and timeline suggested successfully',
      data: suggestion
    });
  } catch (err) {
    console.error('Error in suggestBudgetAndTimelineController:', err);
    if (err.message && err.message.includes('Rate Limit Exceeded')) {
      return res.status(429).json({
        message: 'AI rate limit exceeded. Please wait a moment and try again.',
        error: err.message
      });
    }
    return res.status(500).json({
      message: 'Failed to generate AI budget and timeline suggestion',
      error: err.message
    });
  }
}

/**
 * @name suggestEditorBidController
 * @route POST /api/ai/suggest-editor-bid/:projectId?
 * @description Generates a strategic bid amount, turnaround timeline, and tailored pitch note for an editor
 * @access Private (Editor / Authenticated User)
 */
async function suggestEditorBidController(req, res) {
  try {
    const projectId = req.params.projectId || req.body.projectId;

    let projectData = req.body.project || {};

    // If projectId is provided, fetch project specs from DB
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId provided' });
      }

      const project = await projectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Extract role info if available
      const hiringId = req.body.hiringId;
      const roleId = req.body.roleId;
      let roleSpecificBudget = req.body.roleBudget || req.body.project?.budget;

      if ((!roleSpecificBudget || roleSpecificBudget === 'Flexible') && Array.isArray(project.hirings) && project.hirings.length > 0) {
        let matchedHiring = null;
        if (hiringId) {
          matchedHiring = project.hirings.find(h => String(h._id) === String(hiringId));
        }
        if (!matchedHiring && roleId) {
          matchedHiring = project.hirings.find(h => h.roleId === roleId || h.roleTitle === roleId);
        }
        if (matchedHiring && matchedHiring.budget) {
          roleSpecificBudget = matchedHiring.budget;
        }
      }

      projectData = {
        title: project.title,
        description: project.description,
        category: project.category,
        editingStyle: project.editingStyle,
        requiredSkills: [...(project.requiredSkills || []), ...(project.requiredSoftware || [])],
        expectedVideoDuration: project.videoDuration ? `${project.videoDuration} mins` : 'Standard',
        budget: roleSpecificBudget || project.budget?.amount || project.budget?.max || project.budget || 'Flexible',
        currency: project.budget?.currency || req.body.currency || 'INR',
        timeline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : 'Flexible'
      };
    }

    // Load editor profile from logged-in user and portfolio
    const editorId = req.user?._id || req.user?.id;
    let portfolio = null;
    if (editorId) {
      portfolio = await portfolioModel.findOne({ editor: editorId });
    }

    const editorData = {
      skills: req.body.editor?.skills || portfolio?.skills || ['Video Editing', 'Pacing'],
      tools: req.body.editor?.tools || portfolio?.software || ['Premiere Pro', 'After Effects'],
      rating: req.body.editor?.rating ?? req.user?.rating ?? 5,
      completedProjects: req.body.editor?.completedProjects ?? portfolio?.portfolioItems?.length ?? 0,
      experienceLevel: req.body.editor?.experienceLevel || (portfolio ? `${portfolio.experience} ${portfolio.experienceUnit}` : 'Professional')
    };

    const suggestion = await aiService.suggestEditorBid({
      project: projectData,
      editor: editorData
    });

    return res.status(200).json({
      message: 'AI bid and pitch suggestions generated successfully',
      data: suggestion
    });
  } catch (err) {
    console.error('Error in suggestEditorBidController:', err);
    if (err.message && err.message.includes('Rate Limit Exceeded')) {
      return res.status(429).json({
        message: 'AI rate limit exceeded. Please wait a moment and try again.',
        error: err.message
      });
    }
    return res.status(500).json({
      message: 'Failed to generate editor bid suggestion',
      error: err.message
    });
  }
}

/**
 * @name suggestRoleDeadlineController
 * @route POST /api/ai/suggest-role-deadline
 * @description Provides AI estimation for role turnaround deadline, skills, and tools
 * @access Private (Authenticated User)
 */
async function suggestRoleDeadlineController(req, res) {
  try {
    const {
      roleTitle,
      roleCategory,
      projectTitle,
      projectBudget,
      category,
      editingStyle,
      videoDuration,
      expectedVideoDuration,
      duration,
      roleBudget,
      skills = [],
      tools = [],
      currency = 'INR'
    } = req.body;

    if (!roleTitle) {
      return res.status(400).json({
        message: 'Please provide at least a roleTitle'
      });
    }

    const suggestion = await aiService.suggestRoleDeadlineAndDetails({
      roleTitle: String(roleTitle).trim(),
      roleCategory: roleCategory ? String(roleCategory).trim() : '',
      projectTitle: projectTitle ? String(projectTitle).trim() : '',
      projectBudget: Number(projectBudget) || 0,
      category: category ? String(category).trim() : '',
      editingStyle: editingStyle ? String(editingStyle).trim() : '',
      videoDuration: videoDuration ? String(videoDuration).trim() : '',
      expectedVideoDuration: expectedVideoDuration ? String(expectedVideoDuration).trim() : '',
      duration: duration ? String(duration).trim() : '',
      roleBudget: Number(roleBudget) || 0,
      skills: Array.isArray(skills) ? skills : [],
      tools: Array.isArray(tools) ? tools : [],
      currency: String(currency || 'INR')
    });

    return res.status(200).json({
      message: 'AI role budget and deadline suggested successfully',
      data: suggestion
    });
  } catch (err) {
    console.error('Error in suggestRoleDeadlineController:', err);
    if (err.message && err.message.includes('Rate Limit Exceeded')) {
      return res.status(429).json({
        message: 'AI rate limit exceeded. Please wait a moment and try again.',
        error: err.message
      });
    }
    return res.status(500).json({
      message: 'Failed to generate AI role deadline suggestion',
      error: err.message
    });
  }
}

module.exports = {
  suggestBudgetAndTimelineController,
  suggestEditorBidController,
  suggestRoleDeadlineController
};
