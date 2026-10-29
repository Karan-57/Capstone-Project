const mongoose = require('mongoose');
const milestoneModel = require('../model/milestone.model');
const projectModel = require('../model/project.model');
const workspaceModel = require('../model/workspace.model');
const userModel = require('../model/user.model');
const { generateMilestonesForRole } = require('../constants/roles.constants');
const { createNotification } = require('../services/notification.service');

/**
 * Helper: Find or auto-initialize 3 standard milestones for a project role hiring.
 * Ensures that both creator and freelancer always access the exact same documents in MongoDB.
 */
async function getOrInitializeMilestones({
  projectId,
  hiringId,
  workspaceId = null,
  creatorId = null,
  freelancerId = null,
  roleId = 'video_editor',
  roleTitle = 'Video Editor',
  budget = 10000,
  deadline = null,
}) {
  if (!projectId || !hiringId) return [];

  // Query existing milestone documents for this hiring
  let milestones = await milestoneModel
    .find({ projectId, hiringId })
    .sort({ index: 1 });

  if (milestones && milestones.length > 0) {
    // Fast batch self-heal workspaceId or freelancerId in a single update
    const updateSet = {};
    if (workspaceId) updateSet.workspaceId = workspaceId;
    if (freelancerId) updateSet.freelancerId = freelancerId;

    if (Object.keys(updateSet).length > 0) {
      const needsUpdate = milestones.some(
        (m) => (!m.workspaceId && workspaceId) || (!m.freelancerId && freelancerId)
      );
      if (needsUpdate) {
        milestoneModel
          .updateMany(
            {
              projectId,
              hiringId,
              $or: [{ workspaceId: null }, { freelancerId: null }],
            },
            { $set: updateSet }
          )
          .catch(() => {});
        milestones.forEach((m) => {
          if (workspaceId && !m.workspaceId) m.workspaceId = workspaceId;
          if (freelancerId && !m.freelancerId) m.freelancerId = freelancerId;
        });
      }
    }
    return milestones;
  }

  // Resolve project and creator if not provided
  let effectiveCreatorId = creatorId;
  let effectiveFreelancerId = freelancerId;
  let effectiveBudget = budget;
  let effectiveRoleId = roleId;
  let effectiveRoleTitle = roleTitle;
  let effectiveDeadline = deadline;

  const project = await projectModel.findById(projectId).lean();
  if (project) {
    effectiveCreatorId = effectiveCreatorId || project.creatorId;
    if (Array.isArray(project.hirings)) {
      const h = project.hirings.find((item) => item._id.toString() === hiringId.toString());
      if (h) {
        effectiveFreelancerId = effectiveFreelancerId || h.hiredFreelancerId;
        effectiveBudget = h.budget || effectiveBudget;
        effectiveRoleId = h.roleId || effectiveRoleId;
        effectiveRoleTitle = h.roleTitle || effectiveRoleTitle;
        effectiveDeadline = h.firstDeadline || effectiveDeadline;
      }
    }
  }

  if (!effectiveCreatorId) {
    effectiveCreatorId = project?.creatorId;
  }

  const numericBudget = Number(effectiveBudget) || 10000;
  const generated = generateMilestonesForRole(
    effectiveRoleId,
    numericBudget,
    effectiveDeadline,
    effectiveRoleTitle
  );

  const docsToInsert = generated.map((g) => ({
    projectId,
    hiringId,
    workspaceId: workspaceId || null,
    creatorId: effectiveCreatorId,
    freelancerId: effectiveFreelancerId || null,
    index: g.index,
    title: g.title,
    description: g.description,
    amount: g.amount,
    percent: g.percent,
    deadline: g.deadline,
    status: 'pending',
  }));

  let createdDocs = [];
  try {
    createdDocs = await milestoneModel.insertMany(docsToInsert, { ordered: false });
  } catch (insertErr) {
    // In case of parallel initialization, fetch whatever was created
    createdDocs = await milestoneModel.find({ projectId, hiringId }).sort({ index: 1 });
  }

  if (createdDocs.length > 0 && project) {
    projectModel
      .updateOne(
        { _id: projectId, 'hirings._id': hiringId },
        { $set: { 'hirings.$.milestones': createdDocs.map((c) => c._id) } }
      )
      .catch(() => {});
    return createdDocs;
  }

  return createdDocs;
}

/**
 * GET /api/milestones
 * Fetch authoritative milestones for a workspace, project, or role hiring.
 * Both creator and freelancer query this single endpoint for real-time consistency.
 */
async function getMilestonesController(req, res) {
  try {
    const { workspaceId, projectId, hiringId, freelancerId } = req.query;
    const currentUserId = req.user?._id || req.user?.id;

    let targetProjectId = projectId;
    let targetHiringId = hiringId;
    let targetFreelancerId = freelancerId;
    let targetWorkspaceId = workspaceId;

    let workspaceDoc = null;
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      workspaceDoc = await workspaceModel.findById(workspaceId);
      if (workspaceDoc && workspaceDoc.projectId && !targetProjectId) {
        targetProjectId = workspaceDoc.projectId;
      }
    }

    let projectDoc = null;
    if (targetProjectId && mongoose.Types.ObjectId.isValid(targetProjectId)) {
      projectDoc = await projectModel.findById(targetProjectId);
    }

    // If hiringId not explicitly provided, find the relevant hiring
    if (!targetHiringId && projectDoc && Array.isArray(projectDoc.hirings)) {
      // If current user is a freelancer, find their hiring role
      if (req.user?.role === 'editor' || req.user?.role === 'freelancer' || targetFreelancerId) {
        const lookupId = (targetFreelancerId || currentUserId)?.toString();
        const matched = projectDoc.hirings.find((h) => {
          const fid = (h.hiredFreelancerId?._id || h.hiredFreelancerId)?.toString();
          return fid === lookupId;
        });
        if (matched) {
          targetHiringId = matched._id;
          targetFreelancerId = lookupId;
        }
      }

      // If still not found and only one hiring exists
      if (!targetHiringId && projectDoc.hirings.length === 1) {
        targetHiringId = projectDoc.hirings[0]._id;
        targetFreelancerId = targetFreelancerId || projectDoc.hirings[0].hiredFreelancerId;
      }
    }

    // If project is known but specific hiring is not requested (e.g. project-wide overview),
    // ensure all project hirings have milestones initialized and return all project milestones.
    if (!targetHiringId && targetProjectId) {
      if (projectDoc && Array.isArray(projectDoc.hirings) && projectDoc.hirings.length > 0) {
        await Promise.all(
          projectDoc.hirings.map((h) =>
            getOrInitializeMilestones({
              projectId: targetProjectId,
              hiringId: h._id,
              workspaceId: targetWorkspaceId,
              creatorId: projectDoc.creatorId,
              freelancerId: h.hiredFreelancerId,
              roleId: h.roleId || 'video_editor',
              roleTitle: h.roleTitle || 'Video Editor',
              budget: h.budget || projectDoc.totalBudget || 10000,
              deadline: h.firstDeadline,
            })
          )
        );
      }
      const allProjectMilestones = await milestoneModel
        .find({ projectId: targetProjectId })
        .sort({ index: 1 })
        .lean();
      return res.status(200).json({
        success: true,
        milestones: allProjectMilestones,
        projectId: targetProjectId,
      });
    }

    if (!targetProjectId || !targetHiringId) {
      // Return any milestones directly associated with workspaceId if available
      if (targetWorkspaceId && mongoose.Types.ObjectId.isValid(targetWorkspaceId)) {
        const wsMilestones = await milestoneModel
          .find({ workspaceId: targetWorkspaceId })
          .sort({ index: 1 });
        return res.status(200).json({ success: true, milestones: wsMilestones });
      }
      return res.status(200).json({ success: true, milestones: [] });
    }

    // Auto-initialize 3 milestones if they don't exist yet
    const matchedHiring = (projectDoc?.hirings || []).find(
      (h) => h._id.toString() === targetHiringId.toString()
    );

    const milestones = await getOrInitializeMilestones({
      projectId: targetProjectId,
      hiringId: targetHiringId,
      workspaceId: targetWorkspaceId,
      creatorId: projectDoc?.creatorId,
      freelancerId: targetFreelancerId || matchedHiring?.hiredFreelancerId,
      roleId: matchedHiring?.roleId || 'video_editor',
      roleTitle: matchedHiring?.roleTitle || 'Video Editor',
      budget: matchedHiring?.budget || projectDoc?.totalBudget || 10000,
      deadline: matchedHiring?.firstDeadline,
    });

    return res.status(200).json({
      success: true,
      milestones,
      projectId: targetProjectId,
      hiringId: targetHiringId,
    });
  } catch (err) {
    console.error('Error in getMilestonesController:', err);
    return res.status(500).json({
      message: 'Failed to fetch milestones',
      error: err.message,
    });
  }
}

/**
 * POST /api/milestones/:milestoneId/submit
 * Freelancer submits their video cut / deliverable preview URL for creator review.
 */
async function submitMilestoneDeliverableController(req, res) {
  try {
    const { milestoneId } = req.params;
    const { submittedUrl, submissionNotes } = req.body;
    const currentUserId = req.user?._id || req.user?.id;

    if (!submittedUrl || !submittedUrl.trim()) {
      return res.status(400).json({ message: 'Deliverable cut URL is required.' });
    }

    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    // Check permissions: assigned freelancer or creator
    const isAssigned =
      !milestone.freelancerId ||
      milestone.freelancerId.toString() === currentUserId.toString();
    const isCreator =
      milestone.creatorId && milestone.creatorId.toString() === currentUserId.toString();

    if (!isAssigned && !isCreator) {
      return res.status(403).json({
        message: 'Only the assigned freelancer can submit deliverable cuts for this milestone.',
      });
    }

    if (milestone.status === 'pending') {
      return res.status(400).json({
        message: 'Cannot submit deliverable for an unfunded milestone. Creator must deposit escrow first.',
      });
    }

    milestone.submittedUrl = submittedUrl.trim();
    milestone.submissionNotes = (submissionNotes || '').trim();
    milestone.submittedAt = new Date();

    if (!Array.isArray(milestone.deliveries)) {
      milestone.deliveries = [];
    }

    const nextVersion = milestone.deliveries.length + 1;
    milestone.deliveries.push({
      version: nextVersion,
      submittedUrl: milestone.submittedUrl,
      notes: milestone.submissionNotes,
      submittedAt: milestone.submittedAt,
      submittedBy: currentUserId,
      status: 'pending_review',
    });

    await milestone.save();

    // Also sync to project hiring if present
    try {
      await projectModel.updateOne(
        {
          _id: milestone.projectId,
          'hirings._id': milestone.hiringId,
        },
        {
          $set: {
            'hirings.$.milestones.$[m].submittedUrl': milestone.submittedUrl,
            'hirings.$.milestones.$[m].submissionNotes': milestone.submissionNotes,
          },
        },
        {
          arrayFilters: [{ 'm.index': milestone.index }],
        }
      );
    } catch (syncErr) {
      console.warn('[submitMilestoneDeliverable] Project hiring sync notice:', syncErr.message);
    }

    // 1. Notify project creator about delivery or revision cut
    if (milestone.creatorId) {
      const isRevision = nextVersion > 1;
      createNotification({
        recipient: milestone.creatorId,
        type: isRevision ? 'REVISION_DELIVERED' : 'DELIVERABLE_SUBMITTED',
        title: isRevision
          ? `Revision Cut Received (v${nextVersion})`
          : `Milestone Deliverable Submitted (v1)`,
        message: isRevision
          ? `${req.user?.name || 'Freelancer'} submitted revision cut v${nextVersion} for "${milestone.title}". Click to review and release funds or request changes.`
          : `${req.user?.name || 'Freelancer'} submitted a video cut for "${milestone.title}". Click to review and release funds or request revisions.`,
        project: milestone.projectId,
        relatedUser: currentUserId,
        link: `/creator/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
        actionUrl: `/creator/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
      }).catch((err) => console.error('[Notification] Creator delivery notice:', err.message));
    }

    // 2. Notify freelancer of submission confirmation
    const freelancerRecipient = milestone.freelancerId || currentUserId;
    if (freelancerRecipient) {
      const isRevision = nextVersion > 1;
      createNotification({
        recipient: freelancerRecipient,
        type: isRevision ? 'REVISION_SUBMITTED' : 'DELIVERY_CONFIRMATION',
        title: isRevision ? `Revision Cut v${nextVersion} Submitted` : 'Deliverable Submitted',
        message: `Your video cut (v${nextVersion}) for "${milestone.title}" was submitted to the creator for review.`,
        project: milestone.projectId,
        relatedUser: currentUserId,
        link: `/editor/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
        actionUrl: `/editor/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
      }).catch((err) => console.error('[Notification] Freelancer submission confirmation:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Deliverable cut submitted successfully for creator review!',
      milestone,
    });
  } catch (err) {
    console.error('Error in submitMilestoneDeliverableController:', err);
    return res.status(500).json({
      message: 'Failed to submit milestone deliverable',
      error: err.message,
    });
  }
}

/**
 * POST /api/milestones/:milestoneId/request-revision
 * Creator asks for a revision on the milestone's latest delivery cut.
 */
async function requestMilestoneRevisionController(req, res) {
  try {
    const { milestoneId } = req.params;
    const { title, description } = req.body;
    const currentUserId = req.user?._id || req.user?.id;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Revision feedback/description is required.' });
    }

    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    // Only project creator can request revision
    const isCreator =
      milestone.creatorId && milestone.creatorId.toString() === currentUserId.toString();
    if (!isCreator && req.user?.role !== 'creator') {
      return res.status(403).json({ message: 'Only the creator can request a delivery revision.' });
    }

    if (!milestone.submittedUrl) {
      return res.status(400).json({ message: 'No delivery cut submitted yet to request revision on.' });
    }

    if (milestone.status === 'completed' || milestone.status === 'approved') {
      return res.status(400).json({ message: 'Cannot request revision for an already released milestone.' });
    }

    if (!Array.isArray(milestone.deliveries)) {
      milestone.deliveries = [];
    }

    // If milestone has no delivery entries yet (legacy single-url submission), create v1
    if (milestone.deliveries.length === 0 && milestone.submittedUrl) {
      milestone.deliveries.push({
        version: 1,
        submittedUrl: milestone.submittedUrl,
        notes: milestone.submissionNotes || '',
        submittedAt: milestone.submittedAt || new Date(),
        status: 'pending_review',
      });
    }

    // Revision request is once per delivery cut: check if latest delivery already has revision requested
    const latestDelivery = milestone.deliveries[milestone.deliveries.length - 1];
    if (latestDelivery && latestDelivery.status === 'revision_requested') {
      return res.status(400).json({ message: 'A revision has already been requested for this delivery version.' });
    }

    if (latestDelivery) {
      latestDelivery.status = 'revision_requested';
      latestDelivery.revisionRequest = {
        title: (title || 'Revision Requested').trim(),
        description: description.trim(),
        requestedAt: new Date(),
        requestedBy: currentUserId,
      };
    }

    await milestone.save();

    // 1. Notify freelancer with direct workspace & milestone navigation link
    if (milestone.freelancerId) {
      createNotification({
        recipient: milestone.freelancerId,
        type: 'REVISION_REQUESTED',
        title: `Revision Requested on Milestone Cut (v${latestDelivery?.version || 1})`,
        message: `${req.user?.name || 'Creator'} requested a revision for "${milestone.title}": "${description.trim().slice(0, 100)}"`,
        project: milestone.projectId,
        relatedUser: currentUserId,
        link: `/editor/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
        actionUrl: `/editor/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
      }).catch((err) => console.error('[Notification] Revision notice:', err.message));
    }

    // 2. Notify creator of revision request record
    const creatorRecipient = milestone.creatorId || currentUserId;
    if (creatorRecipient) {
      createNotification({
        recipient: creatorRecipient,
        type: 'REVISION_SENT',
        title: `Revision Request Sent (v${latestDelivery?.version || 1})`,
        message: `You requested changes for "${milestone.title}". Freelancer has been notified to deliver the next cut.`,
        project: milestone.projectId,
        relatedUser: currentUserId,
        link: `/creator/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
        actionUrl: `/creator/workspace?projectId=${milestone.projectId}&milestoneId=${milestone._id}`,
      }).catch((err) => console.error('[Notification] Creator revision record notice:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Revision requested successfully! Freelancer has been notified.',
      milestone,
    });
  } catch (err) {
    console.error('Error in requestMilestoneRevisionController:', err);
    return res.status(500).json({
      message: 'Failed to request revision',
      error: err.message,
    });
  }
}

module.exports = {
  getOrInitializeMilestones,
  getMilestonesController,
  submitMilestoneDeliverableController,
  requestMilestoneRevisionController,
};
