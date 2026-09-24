const applicationModel = require('../model/application.model');
const projectModel = require('../model/project.model');
const mongoose = require('mongoose');

/**
 * @name applyToProjectController
 * @description submit an application/proposal to a project
 * @route POST /api/application/:id/apply (or /api/projects/:id/apply)
 * @access Private (Editor)
 */
async function applyToProjectController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const { id: projectId } = req.params;

        // 1. Check authenticated user
        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        // 2. Only users with role 'editor' can apply
        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can apply to projects" });
        }

        // 3. Validate project ID format
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        // 4. Check if project exists and is open
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.status !== 'open') {
            return res.status(400).json({
                message: `Cannot apply to this project. Project is currently ${project.status}`
            });
        }

        // 5. Check if user is trying to apply to their own project (safety check)
        if (project.creatorId.toString() === editorId.toString()) {
            return res.status(400).json({ message: "You cannot apply to your own project" });
        }

        // 6. Validate application body fields
        const { proposal, bidAmount, estimatedDeliveryDays } = req.body;

        if (!proposal || proposal.trim() === '') {
            return res.status(400).json({ message: "Proposal is required" });
        }

        if (bidAmount === undefined || bidAmount === null || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
            return res.status(400).json({ message: "Valid bid amount is required and must be greater than 0" });
        }

        if (estimatedDeliveryDays === undefined || estimatedDeliveryDays === null || isNaN(Number(estimatedDeliveryDays)) || Number(estimatedDeliveryDays) <= 0) {
            return res.status(400).json({ message: "Valid estimated delivery days is required and must be greater than 0" });
        }

        // 7. Check if editor has already applied
        const existingApplication = await applicationModel.findOne({
            projectId,
            editorId
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already submitted an application for this project",
                applicationId: existingApplication._id
            });
        }

        // 8. Create application
        const application = await applicationModel.create({
            projectId,
            editorId,
            proposal: proposal.trim(),
            bidAmount: Number(bidAmount),
            estimatedDeliveryDays: Number(estimatedDeliveryDays),
            status: 'pending'
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "You have already applied to this project" });
        }
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name getProjectApplicationsController
 * @description get all applications for a specific project (creator only)
 * @route GET /api/application/:id or /api/creator/projects/:projectId/applications
 * @access Private (Creator)
 */
async function getProjectApplicationsController(req, res) {
    try {
        const creatorId = req.user?._id || req.user?.id;
        const projectId = req.params.id || req.params.projectId;

        // 1. Check authenticated user
        if (!creatorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        // 2. Only creators can view applications for their projects
        if (req.user?.role !== 'creator') {
            return res.status(403).json({ message: "Forbidden: Only creators can view project applications" });
        }

        // 3. Validate project ID format
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        // 4. Verify project exists and belongs to the authenticated creator
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to view applications for this project" });
        }

        // 5. Query applications for this project with editor info
        const { status } = req.query;
        const filter = { projectId };
        if (status) {
            filter.status = status;
        }

        const applications = await applicationModel
            .find(filter)
            .populate('editorId', 'name username email profileImage bio skills rating')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: applications.length,
            applications
        });
    } catch (err) {
        console.error("Error in getProjectApplicationsController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name getMyApplicationsController
 * @description get all applications submitted by the authenticated editor
 * @route GET /api/application/my
 * @access Private (Editor)
 */
async function getMyApplicationsController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;

        // 1. Check authenticated user
        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        // 2. Only editors can access their applications
        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can view their applications" });
        }

        // 3. Filter and pagination
        const { status } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const filter = { editorId };
        if (status) {
            filter.status = status;
        }

        const [applications, total] = await Promise.all([
            applicationModel
                .find(filter)
                .populate({
                    path: 'projectId',
                    select: 'title description category budget deadline status creatorId',
                    populate: {
                        path: 'creatorId',
                        select: 'name username profileImage rating'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            applicationModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            count: applications.length,
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            applications
        });
    } catch (err) {
        console.error("Error in getMyApplicationsController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = {
    applyToProjectController,
    getProjectApplicationsController,
    getMyApplicationsController
};
