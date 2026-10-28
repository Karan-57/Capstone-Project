const projectModel = require('../model/project.model');
const milestoneModel = require('../model/milestone.model');
const workspaceModel = require('../model/workspace.model');
const applicationModel = require('../model/application.model');
const deliveryModel = require('../model/delivery.model');
const transactionModel = require('../model/transaction.model');
const progressUpdateModel = require('../model/progressUpdate.model');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notification.service');
const { uploadToImageKit } = require('../services/imagekit.service');
const { generateMilestonesForRole } = require('../constants/roles.constants');

/**
 * Helper to check whether a freelancer / editor has started work or received payments on a project.
 * Checks transactions (both ESCROW_RELEASE and ESCROW_LOCK), deliveries, progress updates, and milestone submissions.
 */
async function checkMemberWorkStarted({ projectId, workspaceId, freelancerId, creatorId, hiring = null }) {
  if (!freelancerId) return false;
  const fIdStr = (freelancerId._id || freelancerId.id || freelancerId).toString();
  const pIdStr = projectId ? projectId.toString() : '';
  const wsIdStr = workspaceId ? workspaceId.toString() : '';

  const workspaceIds = [];
  if (projectId) workspaceIds.push(projectId);
  if (workspaceId) workspaceIds.push(workspaceId);

  try {
    // 1. Check transactions: any ESCROW_RELEASE or ESCROW_LOCK for this project/workspace or to this freelancer
    const txConditions = [
      { referenceWorkspaceId: { $in: workspaceIds }, status: 'SUCCESS' },
      { referenceWorkspaceId: pIdStr, status: 'SUCCESS' },
      { toUser: new mongoose.Types.ObjectId(fIdStr), status: 'SUCCESS' }
    ];
    if (wsIdStr) {
      txConditions.push({ referenceWorkspaceId: wsIdStr, status: 'SUCCESS' });
    }
    if (creatorId) {
      txConditions.push({
        fromUser: new mongoose.Types.ObjectId(creatorId.toString()),
        toUser: new mongoose.Types.ObjectId(fIdStr),
        status: 'SUCCESS'
      });
    }

    const hasTransactions = await transactionModel.exists({
      status: 'SUCCESS',
      $or: txConditions
    });

    if (hasTransactions) return true;
  } catch (txErr) {
    console.warn('[checkMemberWorkStarted] Transaction check warning:', txErr.message);
  }

  try {
    // 2. Check deliveries
    const deliveryConditions = [
      { projectId, status: { $ne: 'rejected' } }
    ];
    if (workspaceId) {
      deliveryConditions.push({ workspaceId, status: { $ne: 'rejected' } });
    }
    const hasDeliveries = await deliveryModel.exists({ $or: deliveryConditions });
    if (hasDeliveries) return true;
  } catch (delErr) {
    console.warn('[checkMemberWorkStarted] Delivery check warning:', delErr.message);
  }

  try {
    // 3. Check progress updates
    const progressConditions = [
      { projectId }
    ];
    if (workspaceId) {
      progressConditions.push({ workspaceId });
    }
    const hasProgress = await progressUpdateModel.exists({ $or: progressConditions });
    if (hasProgress) return true;
  } catch (progErr) {
    console.warn('[checkMemberWorkStarted] Progress check warning:', progErr.message);
  }

  try {
    const hasFundedMilestone = await milestoneModel.exists({
      projectId,
      freelancerId: new mongoose.Types.ObjectId(fIdStr),
      status: { $in: ['funded', 'completed'] }
    });

    if (hasFundedMilestone) return true;
  } catch (mErr) {
    console.warn('[checkMemberWorkStarted] Milestone check warning:', mErr.message);
  }

  // 4. Check hiring milestones if provided
  if (hiring && Array.isArray(hiring.milestones)) {
    const hasMilestoneWork = hiring.milestones.some(m =>
      m.status === 'submitted' ||
      m.status === 'approved' ||
      m.status === 'funded' ||
      Boolean(m.submittedUrl && m.submittedUrl.trim())
    );
    if (hasMilestoneWork) return true;
  }

  return false;
}

/**
 * Helper to get all relevant recipients for a project excluding the actor
 */
async function getProjectRecipients(project, actorId) {
  const recipients = new Set();
  if (project.creatorId) recipients.add(project.creatorId.toString());
  if (project.selectedEditorId) recipients.add(project.selectedEditorId.toString());
  if (Array.isArray(project.assignedEditors)) {
    project.assignedEditors.forEach(id => id && recipients.add(id.toString()));
  }
  if (Array.isArray(project.members)) {
    project.members.forEach(id => id && recipients.add(id.toString()));
  }

  try {
    const workspace = await workspaceModel.findOne({ projectId: project._id });
    if (workspace) {
      if (workspace.creatorId) recipients.add(workspace.creatorId.toString());
      if (workspace.editorId) recipients.add(workspace.editorId.toString());
      if (Array.isArray(workspace.assignedEditors)) {
        workspace.assignedEditors.forEach(id => id && recipients.add(id.toString()));
      }
      if (Array.isArray(workspace.members)) {
        workspace.members.forEach(m => {
          const userId = m?.user?._id || m?.user || m;
          const status = m?.status || 'active';
          if (userId && status !== 'removed' && status !== 'inactive') {
            recipients.add(userId.toString());
          }
        });
      }
    }
  } catch (err) {
    console.error('[Notification Helper] Error fetching workspace:', err.message);
  }

  if (actorId) recipients.delete(actorId.toString());
  return Array.from(recipients);
}

/**
 * @name createProjectController
 * @description create a new project by creator
 * @access Private (Creator)
 */
async function createProjectController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized, creator ID not found" });
    }

    // Only creators can create projects
    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can create projects" });
    }

    const {
      title,
      description,
      category,
      editingStyle,
      requiredSkills,
      requiredSoftware,
      videoDuration,
      complexity,
      budget,
      deadline,
      referenceLinks,
      referenceImages,
      sampleFiles,
      additionalInstructions
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description, and category are required"
      });
    }

    let finalRefImages = Array.isArray(referenceImages) ? [...referenceImages] : [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 3); i++) {
        const file = req.files[i];
        const fileExtension = file.originalname.split('.').pop() || 'png';
        const fileName = `ref_${creatorId}_${Date.now()}_${i}.${fileExtension}`;
        const uploadResult = await uploadToImageKit(
          file.buffer,
          fileName,
          '/Capstone-storage/reference-images'
        );
        finalRefImages.push(uploadResult.url);
      }
    }
    finalRefImages = finalRefImages.slice(0, 3);

    const numericTotalBudget = Number(req.body.totalBudget) || (budget && budget.fixed ? Number(budget.fixed) : 0);
    const resolvedDuration = req.body.duration || req.body.projectDuration || '';
    const resolvedExpectedVideoDuration = req.body.expectedVideoDuration || (videoDuration ? String(videoDuration) : '');

    const project = await projectModel.create({
      creatorId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      editingStyle: editingStyle ? editingStyle.trim() : undefined,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      requiredSoftware: Array.isArray(requiredSoftware) ? requiredSoftware : [],
      videoDuration: Number(videoDuration) || 0,
      expectedVideoDuration: resolvedExpectedVideoDuration,
      projectDuration: resolvedDuration,
      duration: resolvedDuration,
      complexity: complexity || 'Intermediate',
      totalBudget: numericTotalBudget,
      budget: budget || (numericTotalBudget ? { fixed: numericTotalBudget, currency: req.body.currency || 'INR' } : {}),
      deadline: deadline ? new Date(deadline) : undefined,
      referenceLinks: Array.isArray(referenceLinks) ? referenceLinks : [],
      referenceImages: finalRefImages,
      sampleFiles: Array.isArray(sampleFiles) ? sampleFiles : [],
      additionalInstructions: additionalInstructions ? additionalInstructions.trim() : '',
      hirings: []
    });

    return res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (err) {
    console.error("Error in createProjectController:", err);
    return res.status(500).json({
      message: "Internal server error during project creation",
      error: err.message
    });
  }
}

/**
 * @name uploadReferenceImagesController
 * @description Upload reference images/moodboard to ImageKit (max 3 images)
 * @access Private (Creator)
 */
async function uploadReferenceImagesController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized, creator ID not found" });
    }

    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can upload reference images" });
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    if (files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 reference images allowed" });
    }

    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.originalname.split('.').pop() || 'png';
      const fileName = `ref_${creatorId}_${Date.now()}_${i}.${fileExtension}`;
      const uploadResult = await uploadToImageKit(
        file.buffer,
        fileName,
        '/Capstone-storage/reference-images'
      );
      uploadedUrls.push(uploadResult.url);
    }

    return res.status(200).json({
      message: "Reference images uploaded successfully",
      urls: uploadedUrls
    });
  } catch (err) {
    console.error("Error in uploadReferenceImagesController:", err);
    return res.status(500).json({
      message: "Internal server error during reference images upload",
      error: err.message
    });
  }
}

/**
 * @name getMyProjectsController
 * @description get all projects created by the authenticated creator
 * @access Private (Creator)
 */
async function getMyProjectsController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized, creator ID not found" });
    }

    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can access their projects" });
    }

    const { status } = req.query;
    const filter = { creatorId };

    if (status) {
      filter.status = status;
    }

    const projects = await projectModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('selectedEditorId', 'name username profileImage')
      .populate('hirings.hiredFreelancerId', 'name username profileImage role subRoles rating')
      .lean();

    const pIds = projects.map(p => p._id);
    const milestonesList = await milestoneModel.find({ projectId: { $in: pIds } }).select('projectId status amount index').lean();
    const pMilestonesMap = new Map();
    milestonesList.forEach((m) => {
      const pKey = m.projectId ? m.projectId.toString() : null;
      if (pKey) {
        if (!pMilestonesMap.has(pKey)) pMilestonesMap.set(pKey, []);
        pMilestonesMap.get(pKey).push(m);
      }
    });

    const enrichedProjects = projects.map((p) => {
      const pIdStr = p._id.toString();
      const mList = pMilestonesMap.get(pIdStr) || [];
      let totalM = mList.length;
      let approvedM = mList.filter(m => m.status === 'completed' || m.status === 'approved' || m.status === 'released').length;
      let progressPercent = 0;
      if (p.status === 'completed') {
        progressPercent = 100;
      } else if (totalM > 0) {
        progressPercent = Math.round((approvedM / totalM) * 100);
      }
      return {
        ...p,
        progress: progressPercent,
        totalMilestones: totalM,
        completedMilestones: approvedM,
        milestones: mList
      };
    });

    return res.status(200).json({
      count: enrichedProjects.length,
      projects: enrichedProjects
    });
  } catch (err) {
    console.error("Error in getMyProjectsController:", err);
    return res.status(500).json({
      message: "Internal server error while fetching projects",
      error: err.message
    });
  }
}

/**
 * @name updateProjectController
 * @description update a project (only by the creator who owns it)
 * @access Private (Creator)
 */
async function updateProjectController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId } = req.params;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can update projects" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId });

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized to edit" });
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'editingStyle',
      'requiredSkills',
      'requiredSoftware',
      'videoDuration',
      'complexity',
      'budget',
      'deadline',
      'referenceLinks',
      'sampleFiles',
      'additionalInstructions',
      'status'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid update fields provided" });
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Dynamically notify all relevant active project members (multi-member safe)
    const relevantRecipients = await getProjectRecipients(updatedProject, creatorId);

    if (relevantRecipients.length > 0) {
      if (updates.deadline) {
        relevantRecipients.forEach(memberId => {
          createNotification({
            recipient: memberId,
            type: 'DEADLINE_UPDATED',
            title: 'Project Deadline Updated',
            message: `The deadline for project "${updatedProject.title}" has been updated to ${new Date(updates.deadline).toLocaleDateString()}.`,
            project: updatedProject._id,
            relatedUser: creatorId
          }).catch(err => console.error("[Notification] Error:", err.message));
        });
      }

      const reqFields = ['description', 'additionalInstructions', 'requiredSkills', 'requiredSoftware', 'editingStyle', 'videoDuration'];
      const hasReqUpdated = reqFields.some(f => updates[f] !== undefined);
      if (hasReqUpdated) {
        relevantRecipients.forEach(memberId => {
          createNotification({
            recipient: memberId,
            type: 'REQUIREMENTS_UPDATED',
            title: 'Project Requirements Updated',
            message: `The requirements/instructions for project "${updatedProject.title}" have been updated by the creator.`,
            project: updatedProject._id,
            relatedUser: creatorId
          }).catch(err => console.error("[Notification] Error:", err.message));
        });
      }
    }

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    console.error("Error in updateProjectController:", err);
    return res.status(500).json({
      message: "Internal server error during project update",
      error: err.message
    });
  }
}

/**
 * @name deleteProjectController
 * @description delete a project (only by the creator who owns it)
 * @access Private (Creator)
 */
async function deleteProjectController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId } = req.params;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can delete projects" });
    }

    const deletedProject = await projectModel.findOneAndDelete({ _id: projectId, creatorId });

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found or unauthorized to delete" });
    }

    return res.status(200).json({
      message: "Project deleted successfully"
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    console.error("Error in deleteProjectController:", err);
    return res.status(500).json({
      message: "Internal server error during project deletion",
      error: err.message
    });
  }
}

/**
 * @name cancelProjectController
 * @description cancel a project and set its status to 'cancelled' (only by owning creator)
 * @access Private (Creator)
 */
async function cancelProjectController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId } = req.params;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'creator') {
      return res.status(403).json({ message: "Forbidden: Only creators can cancel projects" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId });

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    if (project.status === 'cancelled') {
      return res.status(400).json({ message: "Project is already cancelled" });
    }

    if (project.status === 'in_progress') {
      return res.status(400).json({ message: "Project is in progress" });
    }

    if (project.status === 'completed') {
      return res.status(400).json({ message: "Cannot cancel a completed project" });
    }

    project.status = 'cancelled';
    await project.save();

    const recipients = await getProjectRecipients(project, creatorId);
    recipients.forEach(recipientId => {
      createNotification({
        recipient: recipientId,
        type: 'PROJECT_CANCELLED',
        title: 'Project Cancelled',
        message: `Project "${project.title}" has been cancelled by the creator.`,
        project: project._id,
        relatedUser: creatorId
      }).catch(err => console.error("[Notification] Error:", err.message));
    });

    return res.status(200).json({
      message: "Project cancelled successfully",
      project
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    console.error("Error in cancelProjectController:", err);
    return res.status(500).json({
      message: "Internal server error during project cancellation",
      error: err.message
    });
  }
}

/**
 * @name addProjectHiringController
 * @description Add a new role hiring to a project
 * @route POST /api/creator/projects/:projectId/hirings
 * @access Private (Creator)
 */
async function addProjectHiringController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId });
    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    const {
      roleId,
      roleTitle,
      description,
      requiredSkills = [],
      requiredTools = [],
      budget = 0,
      currency = 'INR',
      firstDeadline,
      references = [],
      additionalNotes = ''
    } = req.body;

    if (!roleId || !roleTitle) {
      return res.status(400).json({ message: "Role ID and role title are required" });
    }

    const numericBudget = Number(budget) || 0;
    const projectTotalBudget = Number(project.totalBudget || project.budget?.amount || project.budget?.max || 0);

    // Validation: Role budget cannot exceed total project budget
    if (projectTotalBudget > 0 && numericBudget > projectTotalBudget) {
      return res.status(400).json({
        message: `Role budget (${currency} ${numericBudget}) cannot exceed total project budget (${currency} ${projectTotalBudget})`
      });
    }

    // Validation: Milestone deadline cannot exceed project turnaround duration
    let parsedDeadline = undefined;
    if (firstDeadline) {
      parsedDeadline = new Date(firstDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ message: "Invalid date format for firstDeadline" });
      }

      const now = new Date();
      const durationText = String(project.projectDuration || project.duration || '').toLowerCase();

      let maxDaysAllowed = null;
      if (durationText.includes('month')) maxDaysAllowed = 30;
      else if (durationText.includes('week')) {
        const wMatch = durationText.match(/(\d+)\s*week/);
        maxDaysAllowed = wMatch ? parseInt(wMatch[1], 10) * 7 : 21;
      } else if (durationText.includes('day')) {
        const dMatch = durationText.match(/(\d+)\s*-\s*(\d+)\s*day/);
        if (dMatch) maxDaysAllowed = parseInt(dMatch[2], 10);
        else {
          const sMatch = durationText.match(/(\d+)\s*day/);
          if (sMatch) maxDaysAllowed = parseInt(sMatch[1], 10);
        }
      }

      if (maxDaysAllowed) {
        const maxAllowedDate = new Date(now.getTime() + maxDaysAllowed * 24 * 60 * 60 * 1000);
        // Allow a small grace margin of 12 hours
        if (parsedDeadline.getTime() > maxAllowedDate.getTime() + 12 * 60 * 60 * 1000) {
          return res.status(400).json({
            message: `Milestone deadline exceeds project turnaround duration of ${project.projectDuration || project.duration} (${maxDaysAllowed} days)`
          });
        }
      }
    }

    // Compute or accept custom milestones for this role
    let roleMilestones = [];
    if (Array.isArray(req.body.milestones) && req.body.milestones.length > 0) {
      roleMilestones = req.body.milestones;
    } else {
      roleMilestones = generateMilestonesForRole(
        roleId,
        numericBudget,
        parsedDeadline,
        roleTitle
      );
    }

    const newHiring = {
      roleId,
      roleTitle,
      description: description ? description.trim() : '',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      requiredTools: Array.isArray(requiredTools) ? requiredTools : [],
      budget: numericBudget,
      currency: currency || 'INR',
      firstDeadline: parsedDeadline,
      references: Array.isArray(references) ? references : [],
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      milestones: roleMilestones,
      status: 'open',
    };

    if (!Array.isArray(project.hirings)) {
      project.hirings = [];
    }

    project.hirings.push(newHiring);
    await project.save();

    const createdHiring = project.hirings[project.hirings.length - 1];

    return res.status(201).json({
      message: "Role hiring posted successfully",
      hiring: createdHiring,
      hirings: project.hirings
    });
  } catch (err) {
    console.error("Error in addProjectHiringController:", err);
    return res.status(500).json({
      message: "Internal server error while adding role hiring",
      error: err.message
    });
  }
}

/**
 * @name getProjectHiringsController
 * @description Get active hirings and hired freelancers for a project
 * @route GET /api/creator/projects/:projectId/hirings
 * @access Private (Creator)
 */
async function getProjectHiringsController(req, res) {
  try {
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await projectModel.findById(projectId)
      .populate('hirings.hiredFreelancerId', 'name username profileImage rating role subRoles');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const allHirings = project.hirings || [];
    const activeHirings = allHirings.filter(h => h.status === 'open' || h.status === 'in_review');
    const hiredFreelancers = allHirings
      .filter(h => h.status === 'hired' && h.hiredFreelancerId)
      .map(h => ({
        hiringId: h._id,
        roleTitle: h.roleTitle,
        freelancer: h.hiredFreelancerId,
        budget: h.budget,
        currency: h.currency,
        hiredAt: h.hiredAt
      }));

    return res.status(200).json({
      hirings: allHirings,
      activeHirings,
      hiredFreelancers,
      totalBudget: project.totalBudget || (project.budget && project.budget.fixed ? project.budget.fixed : 0),
      project
    });
  } catch (err) {
    console.error("Error in getProjectHiringsController:", err);
    return res.status(500).json({
      message: "Internal server error while fetching hirings",
      error: err.message
    });
  }
}

/**
 * @name deleteProjectHiringController
 * @description Delete a hiring role from project
 * @route DELETE /api/creator/projects/:projectId/hirings/:hiringId
 * @access Private (Creator)
 */
async function deleteProjectHiringController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId, hiringId } = req.params;

    if (!projectId || !hiringId) {
      return res.status(400).json({ message: "Project ID and hiring ID are required" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId });
    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    project.hirings = (project.hirings || []).filter(h => h._id.toString() !== hiringId.toString());
    await project.save();

    return res.status(200).json({
      message: "Hiring role removed successfully",
      hirings: project.hirings
    });
  } catch (err) {
    console.error("Error in deleteProjectHiringController:", err);
    return res.status(500).json({
      message: "Internal server error while removing hiring role",
      error: err.message
    });
  }
}

/**
 * @name updateRoleMilestonesController
 * @description Update milestones or a milestone status/submission for a specific hiring role
 * @route PATCH /api/creator/projects/:projectId/hirings/:hiringId/milestones
 * @access Private (Creator or Assigned Freelancer)
 */
async function updateRoleMilestonesController(req, res) {
  try {
    const { projectId, hiringId } = req.params;
    const { milestones } = req.body;

    if (!projectId || !hiringId) {
      return res.status(400).json({ message: "Project ID and hiring ID are required" });
    }

    if (!Array.isArray(milestones)) {
      return res.status(400).json({ message: "Milestones array is required" });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hiring = (project.hirings || []).find(h => h._id.toString() === hiringId.toString());
    if (!hiring) {
      return res.status(404).json({ message: "Hiring role not found on project" });
    }

    // Validate milestone sum does not exceed role budget
    const totalMilestonesAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    if (hiring.budget > 0 && totalMilestonesAmount > hiring.budget) {
      return res.status(400).json({
        message: `Sum of milestones (₹${totalMilestonesAmount.toLocaleString()}) cannot exceed the role budget (₹${hiring.budget.toLocaleString()})`
      });
    }

    hiring.milestones = milestones;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Milestones updated successfully",
      milestones: hiring.milestones,
      hiring
    });
  } catch (err) {
    console.error("Error in updateRoleMilestonesController:", err);
    return res.status(500).json({
      message: "Internal server error while updating role milestones",
      error: err.message
    });
  }
}

/**
 * @name getProjectByIdController
 * @description Get comprehensive project details by ID with populated team members, hirings, and applications
 * @route GET /api/creator/projects/:projectId
 * @access Private (Creator)
 */
async function getProjectByIdController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId })
      .populate('creatorId', 'name username profileImage email')
      .populate('selectedEditorId', 'name username profileImage email rating role subRoles')
      .populate('hirings.hiredFreelancerId', 'name username profileImage email role subRoles rating');

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    // Auto-heal: If project does not have selectedEditorId set but has an accepted application
    if (!project.selectedEditorId) {
      try {
        const acceptedApp = await applicationModel.findOne({ projectId: project._id, status: 'accepted' })
          .populate('editorId', 'name username profileImage email rating role subRoles');
        if (acceptedApp && acceptedApp.editorId) {
          project.selectedEditorId = acceptedApp.editorId;
          if (project.status === 'open') {
            project.status = 'assigned';
          }
          await projectModel.updateOne(
            { _id: project._id },
            { selectedEditorId: acceptedApp.editorId._id, status: project.status }
          ).catch(() => {});
        }
      } catch (healErr) {
        console.warn('[getProjectById] Auto-heal check notice:', healErr.message);
      }
    }

    // Fetch associated workspace with members
    let workspace = null;
    try {
      workspace = await workspaceModel.findOne({ projectId: project._id })
        .populate('members.user', 'name username email profileImage rating role subRoles');
    } catch (wsErr) {
      console.warn('[getProjectById] Workspace fetch notice:', wsErr.message);
    }

    // Determine if lead editor has started work or received payments
    let leadEditorHasStartedWork = false;
    if (project.selectedEditorId) {
      leadEditorHasStartedWork = await checkMemberWorkStarted({
        projectId: project._id,
        workspaceId: workspace?._id,
        freelancerId: project.selectedEditorId,
        creatorId
      });
    }

    // Determine if each role hiring has started work
    const roleWorkStarted = {};
    if (Array.isArray(project.hirings)) {
      for (const h of project.hirings) {
        if (h.hiredFreelancerId) {
          const hStarted = await checkMemberWorkStarted({
            projectId: project._id,
            workspaceId: workspace?._id,
            freelancerId: h.hiredFreelancerId,
            creatorId,
            hiring: h
          });
          roleWorkStarted[h._id.toString()] = hStarted;
        }
      }
    }

    return res.status(200).json({
      success: true,
      project,
      workspace,
      leadEditorHasStartedWork,
      roleWorkStarted
    });
  } catch (err) {
    console.error("Error in getProjectByIdController:", err);
    return res.status(500).json({
      message: "Internal server error while fetching project details",
      error: err.message
    });
  }
}

/**
 * @name removeHiredMemberController
 * @description Remove an approved team member (either from a role hiring or the lead assigned editor)
 * ONLY if work has not started (no submissions/funding/releases yet).
 * Doing so reopens the hiring position for other freelancers.
 * @route POST /api/creator/projects/:projectId/hirings/:hiringId/remove-member
 * @access Private (Creator)
 */
async function removeHiredMemberController(req, res) {
  try {
    const creatorId = req.user?._id || req.user?.id;
    const { projectId, hiringId } = req.params;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!projectId || !hiringId) {
      return res.status(400).json({ message: "Project ID and hiring ID are required" });
    }

    const project = await projectModel.findOne({ _id: projectId, creatorId })
      .populate('hirings.hiredFreelancerId', 'name username email')
      .populate('selectedEditorId', 'name username email');

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    // Freelancers can only be removed while the project is in the 'assigned' (or 'open') state.
    // Once the project has progressed beyond 'assigned' (e.g. 'in_progress', 'review', 'completed'), removal is forbidden.
    const allowedStatuses = ['assigned', 'open'];
    if (!allowedStatuses.includes(project.status)) {
      return res.status(400).json({
        message: "Cannot remove freelancer: Project is already in progress or completed. Freelancers can only be removed while in the assigned state before work begins."
      });
    }

    // Case 1: Member is the lead assigned editor (selectedEditorId)
    const isRemovingSelectedEditor =
      hiringId === 'selected_editor' ||
      hiringId === 'lead' ||
      (project.selectedEditorId && (project.selectedEditorId._id || project.selectedEditorId).toString() === hiringId.toString());

    if (isRemovingSelectedEditor && project.selectedEditorId) {
      const removedEditor = project.selectedEditorId;
      const removedEditorId = removedEditor?._id || removedEditor?.id || removedEditor;

      // Thorough check: check transactions, deliveries, and progress updates
      const workspace = await workspaceModel.findOne({ projectId: project._id });
      const hasStarted = await checkMemberWorkStarted({
        projectId: project._id,
        workspaceId: workspace?._id,
        freelancerId: removedEditorId,
        creatorId
      });

      if (hasStarted) {
        return res.status(400).json({
          message: "Cannot remove editor: Milestone deliverables or escrow payments have already commenced for this member."
        });
      }

      project.selectedEditorId = null;
      if (project.status === 'assigned') {
        project.status = 'open';
      }
      await project.save();

      // Reset accepted application so other applications can be reviewed
      try {
        await applicationModel.updateMany(
          { projectId: project._id, editorId: removedEditorId, status: 'accepted' },
          { status: 'rejected' }
        );
      } catch (appErr) {
        console.warn('[removeHiredMember] Application reset notice:', appErr.message);
      }

      // Workspace cleanup
      try {
        if (workspace) {
          if (Array.isArray(workspace.members)) {
            workspace.members = workspace.members.filter(m => {
              const mUid = m?.user?._id || m?.user || m;
              return mUid.toString() !== removedEditorId.toString();
            });
          }
          if (workspace.editorId && workspace.editorId.toString() === removedEditorId.toString()) {
            workspace.editorId = null;
          }
          await workspace.save();
        }
      } catch (wsErr) {
        console.warn('[removeHiredMember] Workspace cleanup notice:', wsErr.message);
      }

      // Notification
      try {
        await createNotification({
          recipient: removedEditorId,
          type: 'PROJECT_UPDATED',
          title: 'Project Assignment Updated',
          message: `You were unassigned from "${project.title}". The position has been reopened for other editors.`,
          project: project._id,
          relatedUser: creatorId
        });
      } catch (notifErr) {
        console.warn('[removeHiredMember] Notification notice:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `Removed ${removedEditor.name || 'Lead Video Editor'}. Project is now open again for applications!`,
        project
      });
    }

    // Case 2: Member is in project.hirings
    const hiring = (project.hirings || []).find(h => h._id.toString() === hiringId.toString());
    if (!hiring) {
      return res.status(404).json({ message: "Hiring position not found" });
    }

    if (!hiring.hiredFreelancerId && hiring.status !== 'hired') {
      return res.status(400).json({ message: "No approved freelancer assigned to this role" });
    }

    const removedFreelancer = hiring.hiredFreelancerId;
    const removedFreelancerId = removedFreelancer?._id || removedFreelancer?.id || removedFreelancer;

    // Restriction: Creator can only remove a member if they have just been approved and haven't started work yet
    const workspace = await workspaceModel.findOne({ projectId: project._id });
    const hasStarted = await checkMemberWorkStarted({
      projectId: project._id,
      workspaceId: workspace?._id,
      freelancerId: removedFreelancerId,
      creatorId,
      hiring
    });

    if (hasStarted) {
      return res.status(400).json({
        message: "Cannot remove freelancer: Work, milestone deliverables, or escrow payments have already commenced for this role."
      });
    }

    // Reset hiring position back to 'open'
    hiring.status = 'open';
    hiring.hiredFreelancerId = null;
    hiring.hiredAt = null;

    // Reset milestone statuses back to pending
    if (Array.isArray(hiring.milestones)) {
      hiring.milestones = hiring.milestones.map(m => ({
        ...m,
        status: 'pending',
        submittedUrl: '',
        submissionNotes: ''
      }));
    }

    // If the project had selectedEditorId pointing to this freelancer, reset it
    if (removedFreelancerId && project.selectedEditorId && (project.selectedEditorId._id || project.selectedEditorId).toString() === removedFreelancerId.toString()) {
      project.selectedEditorId = null;
      if (project.status === 'assigned') {
        project.status = 'open';
      }
    }

    await project.save();

    // Also clean up member from workspace if workspace exists
    if (removedFreelancerId) {
      try {
        const workspace = await workspaceModel.findOne({ projectId: project._id });
        if (workspace) {
          if (Array.isArray(workspace.members)) {
            workspace.members = workspace.members.filter(m => {
              const mUid = m?.user?._id || m?.user || m;
              return mUid.toString() !== removedFreelancerId.toString();
            });
          }
          if (workspace.editorId && workspace.editorId.toString() === removedFreelancerId.toString()) {
            workspace.editorId = null;
          }
          await workspace.save();
        }
      } catch (wsErr) {
        console.warn('[removeHiredMember] Workspace cleanup notice:', wsErr.message);
      }

      // Notify the freelancer that the role has been reopened
      try {
        await createNotification({
          recipient: removedFreelancerId,
          type: 'PROJECT_UPDATED',
          title: 'Role Assignment Updated',
          message: `You were unassigned from the role "${hiring.roleTitle}" on "${project.title}". The position has been reopened.`,
          project: project._id,
          relatedUser: creatorId
        });
      } catch (notifErr) {
        console.warn('[removeHiredMember] Notification notice:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Removed ${removedFreelancer?.name || 'freelancer'} from "${hiring.roleTitle}". Hiring opening is now live again!`,
      hiring,
      project
    });
  } catch (err) {
    console.error("Error in removeHiredMemberController:", err);
    return res.status(500).json({
      message: "Internal server error while removing member",
      error: err.message
    });
  }
}

module.exports = {
  createProjectController,
  uploadReferenceImagesController,
  getMyProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  cancelProjectController,
  addProjectHiringController,
  getProjectHiringsController,
  deleteProjectHiringController,
  updateRoleMilestonesController,
  removeHiredMemberController
};
