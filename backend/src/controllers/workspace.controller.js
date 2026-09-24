const workspaceModel = require('../model/workspace.model');
const progressUpdateModel = require('../model/progressUpdate.model');
const revisionModel = require('../model/revision.model');
const mongoose = require('mongoose');

/**
 * @name getWorkspaceProgressController
 * @description Get progress updates and latest status of a workspace
 * @route GET /api/workspace/:workspaceId/progress
 * @access Private (Workspace Creator or Editor)
 */
async function getWorkspaceProgressController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        const { workspaceId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }

        const workspace = await workspaceModel.findById(workspaceId)
            .populate('projectId', 'title category status budget deadline')
            .populate('creatorId', 'name username email profileImage rating')
            .populate('editorId', 'name username email profileImage rating');

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Verify user is either creator or editor of the workspace
        const isCreator = workspace.creatorId?._id?.toString() === userId.toString();
        const isEditor = workspace.editorId?._id?.toString() === userId.toString();

        if (!isCreator && !isEditor) {
            return res.status(403).json({
                message: "Forbidden: You are not a participant in this workspace"
            });
        }

        // Fetch all progress updates ordered by newest first
        const updates = await progressUpdateModel
            .find({ workspaceId })
            .populate('editorId', 'name username profileImage')
            .sort({ createdAt: -1 });

        const latestUpdate = updates.length > 0 ? updates[0] : null;

        return res.status(200).json({
            workspace: {
                _id: workspace._id,
                projectId: workspace.projectId,
                creator: workspace.creatorId,
                editor: workspace.editorId,
                status: workspace.status,
                currentProgress: latestUpdate ? latestUpdate.progressPercentage : 0,
                currentStatus: latestUpdate ? latestUpdate.status : 'pending'
            },
            latestUpdate,
            totalUpdates: updates.length,
            updates
        });
    } catch (err) {
        console.error("Error in getWorkspaceProgressController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching workspace progress",
            error: err.message
        });
    }
}

/**
 * @name updateWorkspaceProgressController
 * @description Add a progress update to workspace (and optionally update workspace status)
 * @route PATCH /api/workspace/:workspaceId/progress
 * @access Private (Assigned Editor)
 */
// Predefined production milestone percentages for video editing
const MILESTONE_PERCENTAGES = {
    'footage_organized': 15,
    'rough_cut': 35,
    'broll_and_graphics': 55,
    'sound_and_music': 75,
    'color_and_polish': 90,
    'review_ready': 100
};

/**
 * @name updateWorkspaceProgressController
 * @description Add a progress update to workspace using milestones or percentage
 * @route PATCH /api/workspace/:workspaceId/progress
 * @access Private (Assigned Editor)
 */
async function updateWorkspaceProgressController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const { workspaceId } = req.params;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can update progress" });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }

        const workspace = await workspaceModel.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Verify the logged-in editor is the assigned editor for this workspace
        if (workspace.editorId.toString() !== editorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: You are not the assigned editor for this workspace"
            });
        }

        if (workspace.status === 'completed' || workspace.status === 'cancelled') {
            return res.status(400).json({
                message: `Cannot update progress. Workspace is already ${workspace.status}`
            });
        }

        const { message, milestone, progressPercentage, status } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ message: "Progress message is required" });
        }

        // Calculate progress percentage:
        // 1. If valid milestone provided, use its mapped percentage
        // 2. Or allow custom percentage (0 - 100)
        let calculatedPercentage;
        if (milestone && MILESTONE_PERCENTAGES[milestone] !== undefined) {
            calculatedPercentage = progressPercentage !== undefined 
                ? Math.min(100, Math.max(0, Number(progressPercentage))) 
                : MILESTONE_PERCENTAGES[milestone];
        } else if (progressPercentage !== undefined && !isNaN(Number(progressPercentage))) {
            const num = Number(progressPercentage);
            if (num < 0 || num > 100) {
                return res.status(400).json({ message: "progressPercentage must be a number between 0 and 100" });
            }
            calculatedPercentage = num;
        } else {
            return res.status(400).json({
                message: "Either a valid milestone ('footage_organized', 'rough_cut', 'broll_and_graphics', 'sound_and_music', 'color_and_polish', 'review_ready') or progressPercentage (0-100) is required",
                availableMilestones: Object.keys(MILESTONE_PERCENTAGES)
            });
        }

        // Determine progress update status
        const allowedStatuses = ['pending', 'in_progress', 'review_ready', 'completed'];
        let progressStatus = status || 'in_progress';
        if (milestone === 'review_ready' || calculatedPercentage === 100) {
            progressStatus = status || 'review_ready';
        }

        if (!allowedStatuses.includes(progressStatus)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
            });
        }

        // Create new progress update record
        const progressUpdate = await progressUpdateModel.create({
            workspaceId,
            editorId,
            message: message.trim(),
            milestone: milestone || null,
            progressPercentage: calculatedPercentage,
            status: progressStatus
        });

        // Sync workspace status
        if (progressStatus === 'review_ready' && workspace.status !== 'in_review') {
            workspace.status = 'in_review';
            await workspace.save();
        } else if (progressStatus === 'completed' && calculatedPercentage === 100) {
            workspace.status = 'completed';
            await workspace.save();
        } else if (progressStatus === 'in_progress' && workspace.status !== 'active') {
            workspace.status = 'active';
            await workspace.save();
        }

        return res.status(200).json({
            message: "Workspace progress updated successfully",
            progressUpdate,
            workspaceStatus: workspace.status
        });
    } catch (err) {
        console.error("Error in updateWorkspaceProgressController:", err);
        return res.status(500).json({
            message: "Internal server error while updating workspace progress",
            error: err.message
        });
    }
}

/**
 * @name createRevisionController
 * @description Create a revision request for a workspace (typically by creator or editor)
 * @route POST /api/workspace/:workspaceId/revision
 * @access Private (Workspace Creator or Editor)
 */
async function createRevisionController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        const { workspaceId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }

        const workspace = await workspaceModel.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Verify the user is a participant (creator or editor)
        const isCreator = workspace.creatorId.toString() === userId.toString();
        const isEditor = workspace.editorId.toString() === userId.toString();

        if (!isCreator && !isEditor) {
            return res.status(403).json({
                message: "Forbidden: You are not a participant in this workspace"
            });
        }

        if (workspace.status === 'completed' || workspace.status === 'cancelled') {
            return res.status(400).json({
                message: `Cannot request revision. Workspace is ${workspace.status}`
            });
        }

        const { description, fileId } = req.body;

        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ message: "Revision description is required" });
        }

        if (fileId && !mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const revision = await revisionModel.create({
            workspaceId,
            requestedBy: userId,
            fileId: fileId || null,
            description: description.trim(),
            status: 'pending'
        });

        // Set workspace status to in_review if it was active
        if (workspace.status === 'active') {
            workspace.status = 'in_review';
            await workspace.save();
        }

        return res.status(201).json({
            message: "Revision requested successfully",
            revision,
            workspaceStatus: workspace.status
        });
    } catch (err) {
        console.error("Error in createRevisionController:", err);
        return res.status(500).json({
            message: "Internal server error while creating revision",
            error: err.message
        });
    }
}

/**
 * @name getWorkspaceRevisionsController
 * @description View all revisions for a workspace
 * @route GET /api/workspace/:workspaceId/revision
 * @access Private (Workspace Creator or Editor)
 */
async function getWorkspaceRevisionsController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        const { workspaceId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }

        const workspace = await workspaceModel.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isCreator = workspace.creatorId.toString() === userId.toString();
        const isEditor = workspace.editorId.toString() === userId.toString();

        if (!isCreator && !isEditor) {
            return res.status(403).json({
                message: "Forbidden: You are not a participant in this workspace"
            });
        }

        const { status } = req.query;
        const filter = { workspaceId };
        if (status) {
            filter.status = status;
        }

        const revisions = await revisionModel
            .find(filter)
            .populate('requestedBy', 'name username role profileImage')
            .populate('fileId', 'originalName fileUrl fileType')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: revisions.length,
            revisions
        });
    } catch (err) {
        console.error("Error in getWorkspaceRevisionsController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching revisions",
            error: err.message
        });
    }
}

/**
 * @name updateRevisionController
 * @description Update a revision request status or description
 * @route PATCH /api/workspace/:revisionId/revision
 * @access Private (Workspace Creator or Editor)
 */
async function updateRevisionController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        const revisionId = req.params.revisionId || req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(revisionId)) {
            return res.status(400).json({ message: "Invalid revision ID" });
        }

        const revision = await revisionModel.findById(revisionId);
        if (!revision) {
            return res.status(404).json({ message: "Revision not found" });
        }

        const workspace = await workspaceModel.findById(revision.workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Associated workspace not found" });
        }

        // Verify the user is a participant (creator or editor)
        const isCreator = workspace.creatorId.toString() === userId.toString();
        const isEditor = workspace.editorId.toString() === userId.toString();

        if (!isCreator && !isEditor) {
            return res.status(403).json({
                message: "Forbidden: You are not a participant in this workspace"
            });
        }

        if (workspace.status === 'completed' || workspace.status === 'cancelled') {
            return res.status(400).json({
                message: `Cannot update revision. Workspace is already ${workspace.status}`
            });
        }

        const { status, description } = req.body;

        if (!status && description === undefined) {
            return res.status(400).json({
                message: "At least one field (status or description) is required to update"
            });
        }

        if (status) {
            const allowedStatuses = ['pending', 'in_progress', 'resolved'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
                });
            }
            revision.status = status;
            if (status === 'resolved') {
                revision.resolvedAt = new Date();
            } else {
                revision.resolvedAt = null;
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.trim() === '') {
                return res.status(400).json({ message: "Revision description cannot be empty" });
            }
            revision.description = description.trim();
        }

        await revision.save();

        await revision.populate('requestedBy', 'name username role profileImage');
        await revision.populate('fileId', 'originalName fileUrl fileType');

        return res.status(200).json({
            message: "Revision updated successfully",
            revision
        });
    } catch (err) {
        console.error("Error in updateRevisionController:", err);
        return res.status(500).json({
            message: "Internal server error while updating revision",
            error: err.message
        });
    }
}

module.exports = {
    getWorkspaceProgressController,
    updateWorkspaceProgressController,
    createRevisionController,
    getWorkspaceRevisionsController,
    updateRevisionController
};

