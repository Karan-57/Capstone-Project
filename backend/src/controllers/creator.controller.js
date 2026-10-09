const projectModel = require('../model/project.model');
const workspaceModel = require('../model/workspace.model');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notification.service');
const { uploadToImageKit } = require('../services/imagekit.service');

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

        const project = await projectModel.create({
            creatorId,
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            editingStyle: editingStyle ? editingStyle.trim() : undefined,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
            requiredSoftware: Array.isArray(requiredSoftware) ? requiredSoftware : [],
            videoDuration: Number(videoDuration) || 0,
            complexity: complexity || 'Intermediate',
            budget: budget || {},
            deadline: deadline ? new Date(deadline) : undefined,
            referenceLinks: Array.isArray(referenceLinks) ? referenceLinks : [],
            referenceImages: finalRefImages,
            sampleFiles: Array.isArray(sampleFiles) ? sampleFiles : [],
            additionalInstructions: additionalInstructions ? additionalInstructions.trim() : ''
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
            .populate('selectedEditorId', 'name username profileImage');

        return res.status(200).json({
            count: projects.length,
            projects
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

        if (project.status === 'in_progress'){
            return res.status(400).json({message:"Project is in progress"});
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

module.exports = {
    createProjectController,
    uploadReferenceImagesController,
    getMyProjectsController,
    updateProjectController,
    deleteProjectController,
    cancelProjectController
};
