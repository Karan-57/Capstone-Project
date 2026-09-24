const projectModel = require('../model/project.model');

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
 * @name getProjectByIdController
 * @description get project details by project ID
 * @access Public
 */
async function getProjectByIdController(req, res) {
    try {
        const projectId = req.params.projectId || req.params.id;

        const project = await projectModel.findById(projectId)
            .populate('creatorId', 'name username profileImage rating')
            .populate('selectedEditorId', 'name username profileImage rating');

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ project });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid project ID" });
        }
        console.error("Error in getProjectByIdController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching project",
            error: err.message
        });
    }
}

/**
 * @name getAllOpenProjectsController
 * @description get all open projects available for editors to browse and apply
 * @access Public
 */
async function getAllOpenProjectsController(req, res) {
    try {
        const { category, page = 1, limit = 20 } = req.query;

        const filter = { status: 'open' };
        if (category) {
            filter.category = category;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [projects, total] = await Promise.all([
            projectModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('creatorId', 'name username profileImage rating'),
            projectModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            count: projects.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            projects
        });
    } catch (err) {
        console.error("Error in getAllOpenProjectsController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching open projects",
            error: err.message
        });
    }
}

/**
 * @name searchProjectsController
 * @description search open projects by title, description, category, or skills
 * @access Public
 */
async function searchProjectsController(req, res) {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q || !q.trim()) {
            return res.status(200).json({ count: 0, total: 0, projects: [] });
        }

        const query = q.trim();
        const filter = {
            status: 'open',
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { requiredSkills: { $regex: query, $options: 'i' } },
                { requiredSoftware: { $regex: query, $options: 'i' } }
            ]
        };

        const skip = (Number(page) - 1) * Number(limit);

        const [projects, total] = await Promise.all([
            projectModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('creatorId', 'name username profileImage rating'),
            projectModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            count: projects.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            projects
        });
    } catch (err) {
        console.error("Error in searchProjectsController:", err);
        return res.status(500).json({
            message: "Internal server error during project search",
            error: err.message
        });
    }
}

module.exports = {
    getCreatorPublicProjectsController,
    getProjectByIdController,
    getAllOpenProjectsController,
    searchProjectsController
};
