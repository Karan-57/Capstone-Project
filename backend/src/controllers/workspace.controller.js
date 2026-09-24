const workspaceModel = require('../model/workspace.model');
const progressUpdateModel = require('../model/progressUpdate.model');
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

        const { message, progressPercentage, status } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ message: "Progress message is required" });
        }

        if (progressPercentage === undefined || isNaN(Number(progressPercentage)) || Number(progressPercentage) < 0 || Number(progressPercentage) > 100) {
            return res.status(400).json({ message: "progressPercentage must be a number between 0 and 100" });
        }

        const allowedStatuses = ['pending', 'in_progress', 'review_ready', 'completed'];
        const progressStatus = status || 'in_progress';
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
            progressPercentage: Number(progressPercentage),
            status: progressStatus
        });

        // Optionally update workspace status according to progress
        if (progressStatus === 'review_ready' && workspace.status !== 'in_review') {
            workspace.status = 'in_review';
            await workspace.save();
        } else if (progressStatus === 'completed' && Number(progressPercentage) === 100) {
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

module.exports = {
    getWorkspaceProgressController,
    updateWorkspaceProgressController
};
