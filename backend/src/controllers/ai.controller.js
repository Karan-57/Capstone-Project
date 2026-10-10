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
 * @name suggestTopProposalsController
 * @route POST /api/ai/suggest-top-proposals/:projectId?
 * @description Analyzes project proposals and ranks top 3 candidates against project requirements
 * @access Private (Creator / Authenticated User)
 */
async function suggestTopProposalsController(req, res) {
  try {
    const projectId = req.params.projectId || req.body.projectId;

    let projectData = req.body.project || {};
    let proposalsData = req.body.proposals || [];

    // If projectId is provided, load real data from database
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId provided' });
      }

      const project = await projectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check authorization: creators can only evaluate their own projects (unless admin)
      if (req.user?.role === 'creator' && project.creatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only analyze proposals for your own projects' });
      }

      projectData = {
        title: project.title,
        description: project.description,
        category: project.category,
        editingStyle: project.editingStyle,
        requiredSkills: [...(project.requiredSkills || []), ...(project.requiredSoftware || [])],
        expectedVideoDuration: project.videoDuration ? `${project.videoDuration} mins` : 'N/A',
        budget: project.budget?.amount || project.budget?.max || project.budget || 'Open',
        timeline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : 'Flexible'
      };

      // Fetch active applications for this project
      const applications = await applicationModel
        .find({ projectId, status: { $ne: 'withdrawn' } })
        .populate('editorId', 'name rating totalReviews email');

      if (!applications || applications.length === 0) {
        return res.status(200).json({
          message: 'No proposals submitted for this project yet',
          data: {
            topPicks: [],
            summaryEvaluation: 'No proposals have been submitted for this project yet.',
            adviceForCreator: 'Wait for editors to submit applications or invite verified editors to apply.'
          }
        });
      }

      // Fetch portfolios for all applicant editors to enrich skills & tools data
      const editorIds = applications.map(app => app.editorId?._id).filter(Boolean);
      const portfolios = await portfolioModel.find({ editor: { $in: editorIds } });
      const portfolioMap = new Map();
      portfolios.forEach(p => {
        if (p.editor) portfolioMap.set(p.editor.toString(), p);
      });

      proposalsData = applications.map(app => {
        const editor = app.editorId;
        const portfolio = editor?._id ? portfolioMap.get(editor._id.toString()) : null;

        return {
          proposalId: app._id.toString(),
          editorName: editor?.name || 'Anonymous Editor',
          bidAmount: app.bidAmount,
          deliveryDays: app.estimatedDeliveryDays,
          coverNote: app.proposal,
          editor: {
            rating: editor?.rating ?? 0,
            totalReviews: editor?.totalReviews ?? 0,
            tools: portfolio?.software || [],
            skills: portfolio?.skills || [],
            completedProjects: portfolio?.portfolioItems?.length || 0,
            experienceLevel: portfolio ? `${portfolio.experience} ${portfolio.experienceUnit}` : 'Professional'
          }
        };
      });
    }

    if (!proposalsData || proposalsData.length === 0) {
      return res.status(400).json({
        message: 'No proposals provided for evaluation'
      });
    }

    const analysis = await aiService.suggestTopProposals({
      project: projectData,
      proposals: proposalsData
    });

    return res.status(200).json({
      message: 'Top proposals analyzed and ranked successfully',
      data: analysis
    });
  } catch (err) {
    console.error('Error in suggestTopProposalsController:', err);
    if (err.message && err.message.includes('Rate Limit Exceeded')) {
      return res.status(429).json({
        message: 'AI rate limit exceeded. Please wait a moment and try again.',
        error: err.message
      });
    }
    return res.status(500).json({
      message: 'Failed to analyze top proposals',
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

      projectData = {
        title: project.title,
        description: project.description,
        category: project.category,
        editingStyle: project.editingStyle,
        requiredSkills: [...(project.requiredSkills || []), ...(project.requiredSoftware || [])],
        expectedVideoDuration: project.videoDuration ? `${project.videoDuration} mins` : 'Standard',
        budget: project.budget?.amount || project.budget?.max || project.budget || 'Flexible',
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

module.exports = {
  suggestBudgetAndTimelineController,
  suggestTopProposalsController,
  suggestEditorBidController
};
