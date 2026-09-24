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

/**
 * @name getApplicationByIdController
 * @description get application details by application ID (editor who applied or project creator)
 * @route GET /api/application/:id
 * @access Private
 */
async function getApplicationByIdController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        const { id: applicationId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await applicationModel
            .findById(applicationId)
            .populate('editorId', 'name username email profileImage bio skills rating')
            .populate({
                path: 'projectId',
                select: 'title description category budget deadline status creatorId',
                populate: {
                    path: 'creatorId',
                    select: 'name username profileImage rating'
                }
            });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Allow access only to the editor who applied OR the creator of the project
        const isEditor = application.editorId?._id?.toString() === userId.toString();
        const isCreator = application.projectId?.creatorId?._id?.toString() === userId.toString();

        if (!isEditor && !isCreator) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to view this application"
            });
        }

        return res.status(200).json({
            application
        });
    } catch (err) {
        console.error("Error in getApplicationByIdController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name updateApplicationController
 * @description update application details (proposal, bidAmount, estimatedDeliveryDays)
 * @route PATCH /api/application/:id
 * @access Private (Editor who owns the application)
 */
async function updateApplicationController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const { id: applicationId } = req.params;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can update applications" });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await applicationModel.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.editorId.toString() !== editorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only update your own applications" });
        }

        // Applications can only be edited while pending
        if (application.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot edit application. It is already ${application.status}`
            });
        }

        const { proposal, bidAmount, estimatedDeliveryDays } = req.body;

        if (proposal !== undefined) {
            if (typeof proposal !== 'string' || proposal.trim() === '') {
                return res.status(400).json({ message: "Proposal cannot be empty" });
            }
            application.proposal = proposal.trim();
        }

        if (bidAmount !== undefined) {
            if (isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
                return res.status(400).json({ message: "Bid amount must be a number greater than 0" });
            }
            application.bidAmount = Number(bidAmount);
        }

        if (estimatedDeliveryDays !== undefined) {
            if (isNaN(Number(estimatedDeliveryDays)) || Number(estimatedDeliveryDays) <= 0) {
                return res.status(400).json({ message: "Estimated delivery days must be a number greater than 0" });
            }
            application.estimatedDeliveryDays = Number(estimatedDeliveryDays);
        }

        await application.save();

        return res.status(200).json({
            message: "Application updated successfully",
            application
        });
    } catch (err) {
        console.error("Error in updateApplicationController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name withdrawApplicationController
 * @description editor withdraws (deletes) their application
 * @route DELETE /api/application/:id
 * @access Private (Editor who owns the application)
 */
async function withdrawApplicationController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const { id: applicationId } = req.params;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can withdraw applications" });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await applicationModel.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.editorId.toString() !== editorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only withdraw your own applications" });
        }

        // Cannot withdraw if already accepted or rejected
        if (application.status === 'accepted') {
            return res.status(400).json({
                message: "Cannot withdraw an accepted application. Please contact the project creator."
            });
        }

        application.status = 'withdrawn';
        await application.save();

        return res.status(200).json({
            message: "Application withdrawn successfully",
            application
        });
    } catch (err) {
        console.error("Error in withdrawApplicationController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name acceptApplicationController
 * @description accept an application for a project (creator only)
 * @route POST /api/application/:id/accept
 * @access Private (Creator who owns the project)
 */
async function acceptApplicationController(req, res) {
    try {
        const creatorId = req.user?._id || req.user?.id;
        const { id: applicationId } = req.params;

        if (!creatorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({ message: "Forbidden: Only creators can accept applications" });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await applicationModel.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const project = await projectModel.findById(application.projectId);
        if (!project) {
            return res.status(404).json({ message: "Associated project not found" });
        }

        if (project.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to accept applications for this project"
            });
        }

        if (application.status === 'accepted') {
            return res.status(400).json({ message: "Application is already accepted" });
        }

        if (application.status === 'withdrawn') {
            return res.status(400).json({ message: "Cannot accept a withdrawn application" });
        }

        // Update application status
        application.status = 'accepted';
        await application.save();

        // Update project status to assigned and assign selected editor
        project.status = 'assigned';
        project.selectedEditorId = application.editorId;
        await project.save();

        return res.status(200).json({
            message: "Application accepted successfully. Project status updated to 'assigned'.",
            application,
            project
        });
    } catch (err) {
        console.error("Error in acceptApplicationController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name rejectApplicationController
 * @description reject an application for a project (creator only)
 * @route POST /api/application/:id/reject
 * @access Private (Creator who owns the project)
 */
async function rejectApplicationController(req, res) {
    try {
        const creatorId = req.user?._id || req.user?.id;
        const { id: applicationId } = req.params;

        if (!creatorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({ message: "Forbidden: Only creators can reject applications" });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await applicationModel.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const project = await projectModel.findById(application.projectId);
        if (!project) {
            return res.status(404).json({ message: "Associated project not found" });
        }

        if (project.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to reject applications for this project"
            });
        }

        if (application.status === 'rejected') {
            return res.status(400).json({ message: "Application is already rejected" });
        }

        if (application.status === 'accepted') {
            return res.status(400).json({ message: "Cannot reject an already accepted application" });
        }

        application.status = 'rejected';
        await application.save();

        return res.status(200).json({
            message: "Application rejected successfully",
            application
        });
    } catch (err) {
        console.error("Error in rejectApplicationController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name disbandEditorController
 * @description disband the selected editor and reopen the project to review applications again
 * @route POST /api/creator/projects/:projectId/disband
 * @access Private (Creator who owns the project)
 */
async function disbandEditorController(req, res) {
    try {
        const creatorId = req.user?._id || req.user?.id;
        const projectId = req.params.projectId || req.params.id;

        if (!creatorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({ message: "Forbidden: Only creators can disband editors from projects" });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to modify this project"
            });
        }

        if (project.status !== 'assigned') {
            return res.status(400).json({
                message: `Cannot disband editor. Project must be in 'assigned' stage, but is currently '${project.status}'`
            });
        }

        const previousEditorId = project.selectedEditorId;

        // Reset the accepted application back to rejected (or withdrawn) for that editor
        if (previousEditorId) {
            await applicationModel.findOneAndUpdate(
                { projectId: project._id, editorId: previousEditorId, status: 'accepted' },
                { status: 'rejected' }
            );
        }

        // Reopen project and remove selected editor
        project.status = 'open';
        project.selectedEditorId = null;
        await project.save();

        return res.status(200).json({
            message: "Editor disbanded successfully. Project is now 'open' again for other applications.",
            project
        });
    } catch (err) {
        console.error("Error in disbandEditorController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = {
    applyToProjectController,
    getProjectApplicationsController,
    getMyApplicationsController,
    getApplicationByIdController,
    updateApplicationController,
    withdrawApplicationController,
    acceptApplicationController,
    rejectApplicationController,
    disbandEditorController
};
