const projectModel = require('../model/project.model');

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
            sampleFiles,
            additionalInstructions
        } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description, and category are required"
            });
        }

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
 * @name getCreatorPublicProjectsController
 * @description get all public projects of a specific creator (for other users to view)
 * @access Public
 */
async function getCreatorPublicProjectsController(req, res) {
    try {
        const { creatorId } = req.params;

        const projects = await projectModel.find({
            creatorId,
            status: { $ne: 'cancelled' }
        })
        .sort({ createdAt: -1 });

        return res.status(200).json({
            count: projects.length,
            projects
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid creator ID" });
        }
        console.error("Error in getCreatorPublicProjectsController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching creator projects",
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
    getMyProjectsController,
    getCreatorPublicProjectsController,
    updateProjectController,
    deleteProjectController,
    cancelProjectController
};
