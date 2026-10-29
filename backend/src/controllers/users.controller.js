const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const projectModel = require('../model/project.model');
const workspaceModel = require('../model/workspace.model');
const reviewModel = require('../model/review.model');
const mongoose = require('mongoose');
const config = require('../config/config');
const { uploadToImageKit } = require('../services/imagekit.service');
const { createNotification } = require('../services/notification.service');

/**
 * @name getMeController
 * @description to get current user info
 * @access Private
 */
async function getMeController(req, res) {
    try {
        if (req.user) {
            return res.status(200).json({ user: req.user });
        }

        const token = req.cookies?.accessToken || req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user, decoded });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

/**
 * @name updateMeController
 * @description update current user profile (text details)
 * @access Private
 */
async function updateMeController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user ID not found" });
        }

        const allowedUpdates = [
            'name',
            'username',
            'bio',
            'location',
            'phone',
            'phoneNumber',
            'category',
            'title',
            'tools',
            'skills',
            'settings',
            'subRoles'
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body && req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        // Keep phone and phoneNumber synced
        if (updates.phoneNumber !== undefined) {
            updates.phone = typeof updates.phoneNumber === 'string' ? updates.phoneNumber.trim() : updates.phoneNumber;
            updates.phoneNumber = updates.phone;
        } else if (updates.phone !== undefined) {
            updates.phoneNumber = typeof updates.phone === 'string' ? updates.phone.trim() : updates.phone;
            updates.phone = updates.phoneNumber;
        }

        if (updates.category && typeof updates.category === 'string') {
            updates.category = updates.category.trim();
        }
        if (updates.title && typeof updates.title === 'string') {
            updates.title = updates.title.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        if (updates.username) {
            const existingUsername = await userModel.findOne({
                username: updates.username.trim(),
                _id: { $ne: userId }
            });
            if (existingUsername) {
                return res.status(409).json({ message: "Username is already taken" });
            }
            updates.username = updates.username.trim();
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error("Error in updateMeController:", err);
        return res.status(500).json({
            message: "Internal server error during profile update",
            error: err.message
        });
    }
}

/**
 * @name uploadProfileImageController
 * @description upload and update user profile image
 * @access Private
 */
async function uploadProfileImageController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user ID not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Profile image file is required" });
        }

        const fileExtension = req.file.originalname.split('.').pop() || 'png';
        const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;

        const uploadResult = await uploadToImageKit(
            req.file.buffer,
            fileName,
            '/Capstone-storage/profile-pictures'
        );

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { profileImage: uploadResult.url } },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile image updated successfully",
            profileImage: uploadResult.url,
            user: updatedUser
        });
    } catch (err) {
        console.error("Error in uploadProfileImageController:", err);
        return res.status(500).json({
            message: "Internal server error during profile image upload",
            error: err.message
        });
    }
}

/**
 * @name getUserByIdController
 * @description get user public profile by ID
 * @access Public
 */
async function getUserByIdController(req, res) {
    try {
        const userId = req.params.userId || req.params.id;

        const user = await userModel.findById(userId).select("-password").lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        console.error("Error in getUserByIdController:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

/**
 * @name searchUsersController
 * @description search users by username or name
 * @access Public
 */
async function searchUsersController(req, res) {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(200).json({ users: [] });
        }

        const query = q.trim();
        const filter = {
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        };

        if (req.user?._id) {
            filter._id = { $ne: req.user._id };
        }

        const users = await userModel.find(filter)
            .select('name username profileImage role bio location category title skills subRoles rating totalReviews')
            .limit(12)
            .lean();

        return res.status(200).json({ users });
    } catch (err) {
        console.error("Error in searchUsersController:", err);
        return res.status(500).json({
            message: "Internal server error during search",
            error: err.message
        });
    }
}

/**
 * @name getCollaborationStatusController
 * @description Check if authenticated user and target user have worked together on any project
 * @route GET /api/users/:userId/collaboration-status
 * @access Private
 */
async function getCollaborationStatusController(req, res) {
    try {
        const currentUserId = req.user?._id || req.user?.id;
        const { userId: targetUserId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(200).json({
                collaborated: false,
                canRate: false,
                isSelf: true,
                sharedProjects: [],
                reason: "You cannot rate yourself"
            });
        }

        const targetUser = await userModel.findById(targetUserId).select('name username role');
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentObjId = new mongoose.Types.ObjectId(currentUserId);
        const targetObjId = new mongoose.Types.ObjectId(targetUserId);

        // Fetch collaboration projects and shared workspaces in parallel
        const [projectsAsCreator, projectsAsFreelancer, sharedWorkspaces] = await Promise.all([
            // 1. Projects where creator is current user and target user is assigned or hired
            projectModel.find({
                creatorId: currentObjId,
                $or: [
                    { selectedEditorId: targetObjId },
                    { "hirings.hiredFreelancerId": targetObjId }
                ]
            }).select('title category status createdAt').lean(),

            // 2. Projects where creator is target user and current user is assigned or hired
            projectModel.find({
                creatorId: targetObjId,
                $or: [
                    { selectedEditorId: currentObjId },
                    { "hirings.hiredFreelancerId": currentObjId }
                ]
            }).select('title category status createdAt').lean(),

            // 3. Workspaces where both are members or creator/editor
            workspaceModel.find({
                $or: [
                    { creatorId: currentObjId, editorId: targetObjId },
                    { creatorId: targetObjId, editorId: currentObjId },
                    { "members.user": { $all: [currentObjId, targetObjId] } }
                ]
            }).populate('projectId', 'title category status createdAt').lean()
        ]);

        const projectMap = new Map();

        projectsAsCreator.forEach((p) => {
            projectMap.set(p._id.toString(), {
                _id: p._id,
                title: p.title,
                category: p.category,
                status: p.status,
                myRole: 'creator',
                targetRole: 'freelancer'
            });
        });

        projectsAsFreelancer.forEach((p) => {
            projectMap.set(p._id.toString(), {
                _id: p._id,
                title: p.title,
                category: p.category,
                status: p.status,
                myRole: 'freelancer',
                targetRole: 'creator'
            });
        });

        sharedWorkspaces.forEach((ws) => {
            if (ws.projectId && ws.projectId._id) {
                const pid = ws.projectId._id.toString();
                if (!projectMap.has(pid)) {
                    projectMap.set(pid, {
                        _id: ws.projectId._id,
                        title: ws.projectId.title,
                        category: ws.projectId.category,
                        status: ws.projectId.status || ws.status,
                        myRole: ws.creatorId?.toString() === currentUserId.toString() ? 'creator' : 'freelancer',
                        targetRole: ws.creatorId?.toString() === targetUserId.toString() ? 'creator' : 'freelancer'
                    });
                }
            }
        });

        const sharedProjects = Array.from(projectMap.values());
        const collaborated = sharedProjects.length > 0;

        if (!collaborated) {
            return res.status(200).json({
                collaborated: false,
                canRate: false,
                isSelf: false,
                sharedProjects: [],
                reason: "You can only rate creators or freelancers you have worked with on a project."
            });
        }

        // Check which projects already have reviews from currentUserId for targetUserId
        const projectIds = sharedProjects.map((p) => p._id);
        const existingReviews = await reviewModel.find({
            projectId: { $in: projectIds },
            reviewerId: currentObjId,
            revieweeId: targetObjId
        });

        const enrichedProjects = sharedProjects.map((p) => {
            const rev = existingReviews.find((r) => r.projectId.toString() === p._id.toString());
            return {
                ...p,
                hasReviewed: !!rev,
                review: rev || null
            };
        });

        const unreviewedProject = enrichedProjects.find((p) => !p.hasReviewed);
        const canRate = Boolean(unreviewedProject);

        return res.status(200).json({
            collaborated: true,
            canRate,
            isSelf: false,
            sharedProjects: enrichedProjects,
            eligibleProject: unreviewedProject || null,
            existingReview: existingReviews[0] || null,
            relationship: enrichedProjects[0]?.myRole === 'creator' ? 'creator_to_freelancer' : 'freelancer_to_creator'
        });
    } catch (err) {
        console.error("Error in getCollaborationStatusController:", err);
        return res.status(500).json({
            message: "Internal server error while checking collaboration status",
            error: err.message
        });
    }
}

/**
 * @name rateUserController
 * @description Submit a rating and review for a user you have collaborated with on a project
 * @route POST /api/users/:userId/rate
 * @access Private
 */
async function rateUserController(req, res) {
    try {
        const currentUserId = req.user?._id || req.user?.id;
        const { userId: targetUserId } = req.params;
        const {
            projectId,
            rating,
            reviewText,
            comment,
            speed,
            quality,
            behaviour,
            behavior,
            responseTime,
            response_time,
            boundaryRespect,
            boundary_respect
        } = req.body;

        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        if (rating === undefined || rating === null || isNaN(Number(rating))) {
            return res.status(400).json({ message: "Rating is required and must be a number between 1 and 5" });
        }
        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const currentObjId = new mongoose.Types.ObjectId(currentUserId);
        const targetObjId = new mongoose.Types.ObjectId(targetUserId);

        // Find all projects where they worked together in parallel
        const [projectsAsCreator, projectsAsFreelancer, sharedWorkspaces] = await Promise.all([
            projectModel.find({
                creatorId: currentObjId,
                $or: [
                    { selectedEditorId: targetObjId },
                    { "hirings.hiredFreelancerId": targetObjId }
                ]
            }).select('_id').lean(),

            projectModel.find({
                creatorId: targetObjId,
                $or: [
                    { selectedEditorId: currentObjId },
                    { "hirings.hiredFreelancerId": currentObjId }
                ]
            }).select('_id').lean(),

            workspaceModel.find({
                $or: [
                    { creatorId: currentObjId, editorId: targetObjId },
                    { creatorId: targetObjId, editorId: currentObjId },
                    { "members.user": { $all: [currentObjId, targetObjId] } }
                ]
            }).select('projectId').lean()
        ]);

        const sharedProjectIds = new Set([
            ...projectsAsCreator.map((p) => p._id.toString()),
            ...projectsAsFreelancer.map((p) => p._id.toString()),
            ...sharedWorkspaces.filter((w) => w.projectId).map((w) => w.projectId.toString())
        ]);

        if (sharedProjectIds.size === 0) {
            return res.status(403).json({
                message: "Forbidden: You can only rate users you have worked with on a project."
            });
        }

        // Fetch existing reviews for all shared projects in one single batch query
        const existingReviews = await reviewModel.find({
            projectId: { $in: Array.from(sharedProjectIds).map((pid) => new mongoose.Types.ObjectId(pid)) },
            reviewerId: currentObjId,
            revieweeId: targetObjId
        }).lean();

        const reviewedProjectIds = new Set(existingReviews.map((r) => r.projectId.toString()));

        let targetProjectId = projectId;
        if (targetProjectId) {
            if (!sharedProjectIds.has(targetProjectId.toString())) {
                return res.status(403).json({
                    message: "Forbidden: The specified project is not a valid collaboration between you and this user."
                });
            }
            if (reviewedProjectIds.has(targetProjectId.toString())) {
                const dup = existingReviews.find((r) => r.projectId.toString() === targetProjectId.toString());
                return res.status(400).json({
                    message: "You have already submitted a review for this project",
                    review: dup
                });
            }
        } else {
            // Find the first shared project that has not been reviewed yet
            for (const pid of sharedProjectIds) {
                if (!reviewedProjectIds.has(pid)) {
                    targetProjectId = pid;
                    break;
                }
            }
        }

        if (!targetProjectId) {
            return res.status(400).json({
                message: "You have already submitted reviews for all shared projects with this collaborator."
            });
        }

        const text = typeof reviewText === 'string'
            ? reviewText.trim()
            : (typeof comment === 'string' ? comment.trim() : '');

        const defaultMetric = Math.min(10, Math.max(1, Math.round(numRating * 2)));
        const numSpeed = speed != null && !isNaN(Number(speed)) ? Number(speed) : defaultMetric;
        const numQuality = quality != null && !isNaN(Number(quality)) ? Number(quality) : defaultMetric;
        const rawB = behaviour !== undefined ? behaviour : behavior;
        const numBehaviour = rawB != null && !isNaN(Number(rawB)) ? Number(rawB) : defaultMetric;
        const rawR = responseTime !== undefined ? responseTime : response_time;
        const numResponseTime = rawR != null && !isNaN(Number(rawR)) ? Number(rawR) : defaultMetric;
        const rawBound = boundaryRespect !== undefined ? boundaryRespect : boundary_respect;
        const numBoundaryRespect = rawBound != null && !isNaN(Number(rawBound)) ? Number(rawBound) : defaultMetric;

        const review = await reviewModel.create({
            projectId: new mongoose.Types.ObjectId(targetProjectId),
            reviewerId: currentUserId,
            revieweeId: targetUserId,
            rating: numRating,
            reviewText: text,
            comment: text,
            speed: numSpeed,
            quality: numQuality,
            behaviour: numBehaviour,
            responseTime: numResponseTime,
            boundaryRespect: numBoundaryRespect
        });

        // Calculate aggregated stats and update target user
        const stats = await reviewModel.aggregate([
            { $match: { revieweeId: targetObjId } },
            {
                $group: {
                    _id: "$revieweeId",
                    avgRating: { $avg: "$rating" },
                    avgSpeed: { $avg: "$speed" },
                    avgQuality: { $avg: "$quality" },
                    avgBehaviour: { $avg: "$behaviour" },
                    avgResponseTime: { $avg: "$responseTime" },
                    avgBoundaryRespect: { $avg: "$boundaryRespect" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const s = stats[0];
            const updateData = {
                totalReviews: s.totalReviews || 0,
                rating: s.avgRating != null ? Math.round(s.avgRating * 10) / 10 : 0,
                responseTime: s.avgResponseTime != null ? Math.round(s.avgResponseTime * 10) / 10 : 0,
                behaviour: s.avgBehaviour != null ? Math.round(s.avgBehaviour * 10) / 10 : 0
            };

            if (targetUser.role === 'creator') {
                const avgBound = s.avgBoundaryRespect != null ? Math.round(s.avgBoundaryRespect * 10) / 10 : 0;
                updateData.boundaryRespect = avgBound;
                updateData.boundary = avgBound;
            } else {
                updateData.speed = s.avgSpeed != null ? Math.round(s.avgSpeed * 10) / 10 : 0;
                updateData.quality = s.avgQuality != null ? Math.round(s.avgQuality * 10) / 10 : 0;
            }

            await userModel.findByIdAndUpdate(targetUserId, updateData);
        }

        await review.populate('reviewerId', 'name username profileImage role');
        await review.populate('revieweeId', 'name username profileImage role totalReviews rating');
        await review.populate('projectId', 'title category status');

        createNotification({
            recipient: targetUserId,
            type: 'NEW_REVIEW',
            title: 'New Review Received',
            message: `${req.user?.name || 'A collaborator'} left you a ${numRating}-star review.`,
            project: targetProjectId,
            relatedUser: currentUserId
        }).catch((err) => console.error("[Notification] Error:", err.message));

        return res.status(201).json({
            message: "Rating and review submitted successfully",
            review
        });
    } catch (err) {
        console.error("Error in rateUserController:", err);
        return res.status(500).json({
            message: "Internal server error while rating user",
            error: err.message
        });
    }
}

/**
 * @name reviewEditorController
 * @description Creator adds a review for an editor based on projectId
 * @route POST /api/users/:projectId/reviewEditor
 * @access Private (Creator)
 */
async function reviewEditorController(req, res) {
    try {
        const creatorId = req.user?._id || req.user?.id;
        const { projectId } = req.params;

        if (!creatorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({ message: "Forbidden: Only creators can submit reviews" });
        }

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Verify the creator worked on this project
        if (project.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: Only the creator who worked on this project can submit a review"
            });
        }

        // Identify the editor who worked on this project with this creator
        const workspace = await workspaceModel.findOne({ projectId: project._id });
        const assignedEditorId = workspace?.editorId || project.selectedEditorId;

        if (!assignedEditorId) {
            return res.status(400).json({
                message: "No editor has worked on or been assigned to this project"
            });
        }

        // If revieweeId was specified in req.body, ensure it strictly matches the assigned editor
        if (req.body.revieweeId && req.body.revieweeId.toString() !== assignedEditorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: You can only review the editor who worked on this project"
            });
        }

        const revieweeId = assignedEditorId;

        if (revieweeId.toString() === creatorId.toString()) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        // Prevent duplicate review for this project by the creator
        const existingReview = await reviewModel.findOne({
            projectId: project._id,
            reviewerId: creatorId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already submitted a review for this project",
                review: existingReview
            });
        }

        const { rating, reviewText, comment, speed, quality, behaviour, responseTime, response_time } = req.body;

        // Rating: Mandatory, max 5 (1 to 5)
        if (rating === undefined || rating === null || isNaN(Number(rating))) {
            return res.status(400).json({ message: "Rating is required and must be a number between 1 and 5" });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // speed: Mandatory, out of 10
        if (speed === undefined || speed === null || isNaN(Number(speed))) {
            return res.status(400).json({ message: "speed is mandatory and must be a number between 0 and 10" });
        }
        const numSpeed = Number(speed);
        if (numSpeed < 0 || numSpeed > 10) {
            return res.status(400).json({ message: "speed must be between 0 and 10" });
        }

        // quality: Mandatory, out of 10
        if (quality === undefined || quality === null || isNaN(Number(quality))) {
            return res.status(400).json({ message: "quality is mandatory and must be a number between 0 and 10" });
        }
        const numQuality = Number(quality);
        if (numQuality < 0 || numQuality > 10) {
            return res.status(400).json({ message: "quality must be between 0 and 10" });
        }

        // behaviour: Mandatory, out of 10
        if (behaviour === undefined || behaviour === null || isNaN(Number(behaviour))) {
            return res.status(400).json({ message: "behaviour is mandatory and must be a number between 0 and 10" });
        }
        const numBehaviour = Number(behaviour);
        if (numBehaviour < 0 || numBehaviour > 10) {
            return res.status(400).json({ message: "behaviour must be between 0 and 10" });
        }

        // responseTime: Mandatory, out of 10 (supports responseTime or response_time)
        const rawResponseTime = responseTime !== undefined ? responseTime : response_time;
        if (rawResponseTime === undefined || rawResponseTime === null || isNaN(Number(rawResponseTime))) {
            return res.status(400).json({ message: "responseTime is mandatory and must be a number between 0 and 10" });
        }
        const numResponseTime = Number(rawResponseTime);
        if (numResponseTime < 0 || numResponseTime > 10) {
            return res.status(400).json({ message: "responseTime must be between 0 and 10" });
        }

        // reviewText: Optional
        const text = typeof reviewText === 'string'
            ? reviewText.trim()
            : (typeof comment === 'string' ? comment.trim() : '');

        const review = await reviewModel.create({
            projectId: project._id,
            reviewerId: creatorId,
            revieweeId,
            rating: numRating,
            reviewText: text,
            comment: text,
            speed: numSpeed,
            quality: numQuality,
            behaviour: numBehaviour,
            responseTime: numResponseTime
        });

        // Calculate aggregated review metrics and update editor's userModel
        const stats = await reviewModel.aggregate([
            { $match: { revieweeId: new mongoose.Types.ObjectId(revieweeId) } },
            {
                $group: {
                    _id: "$revieweeId",
                    avgRating: { $avg: "$rating" },
                    avgSpeed: { $avg: "$speed" },
                    avgQuality: { $avg: "$quality" },
                    avgBehaviour: { $avg: "$behaviour" },
                    avgResponseTime: { $avg: "$responseTime" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const s = stats[0];
            await userModel.findByIdAndUpdate(revieweeId, {
                totalReviews: s.totalReviews || 0,
                rating: s.avgRating != null ? Math.round(s.avgRating * 10) / 10 : 0,
                speed: s.avgSpeed != null ? Math.round(s.avgSpeed * 10) / 10 : 0,
                quality: s.avgQuality != null ? Math.round(s.avgQuality * 10) / 10 : 0,
                behaviour: s.avgBehaviour != null ? Math.round(s.avgBehaviour * 10) / 10 : 0,
                responseTime: s.avgResponseTime != null ? Math.round(s.avgResponseTime * 10) / 10 : 0
            });
        }

        await review.populate('reviewerId', 'name username profileImage role');
        await review.populate('revieweeId', 'name username profileImage role totalReviews');
        await review.populate('projectId', 'title category status');

        // Notify the reviewed editor
        createNotification({
            recipient: revieweeId,
            type: 'NEW_REVIEW',
            title: 'New Review Received',
            message: `${req.user?.name || 'A creator'} left you a ${numRating}-star review for project "${project.title}".`,
            project: project._id,
            relatedUser: creatorId
        }).catch(err => console.error("[Notification] Error:", err.message));

        return res.status(201).json({
            message: "Review added successfully",
            review
        });
    } catch (err) {
        console.error("Error in reviewEditorController:", err);
        return res.status(500).json({
            message: "Internal server error while adding review for editor",
            error: err.message
        });
    }
}

/**
 * @name reviewCreatorController
 * @description Editor adds a review for a creator based on projectId
 * @route POST /api/users/:projectId/reviewCreator
 * @access Private (Editor)
 */
async function reviewCreatorController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const { projectId } = req.params;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor' && req.user?.role !== 'freelancer') {
            return res.status(403).json({ message: "Forbidden: Only freelancers can submit reviews for creators" });
        }

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Verify the editor worked on this project with this creator
        const workspace = await workspaceModel.findOne({ projectId: project._id });
        const assignedEditorId = workspace?.editorId || project.selectedEditorId;

        if (!assignedEditorId || assignedEditorId.toString() !== editorId.toString()) {
            return res.status(403).json({
                message: "Forbidden: Only the editor who worked on this project can submit a review for the creator"
            });
        }

        const creatorId = project.creatorId;

        if (creatorId.toString() === editorId.toString()) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        // Prevent duplicate review for this project by the editor
        const existingReview = await reviewModel.findOne({
            projectId: project._id,
            reviewerId: editorId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already submitted a review for this creator on this project",
                review: existingReview
            });
        }

        const { rating, reviewText, comment, behaviour, behavior, responseTime, response_time, boundaryRespect, boundary_respect } = req.body;

        // Rating: Mandatory, max 5 (1 to 5)
        if (rating === undefined || rating === null || isNaN(Number(rating))) {
            return res.status(400).json({ message: "Rating is required and must be a number between 1 and 5" });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // behaviour: Mandatory, out of 10 (supports behaviour or behavior)
        const rawBehaviour = behaviour !== undefined ? behaviour : behavior;
        if (rawBehaviour === undefined || rawBehaviour === null || isNaN(Number(rawBehaviour))) {
            return res.status(400).json({ message: "behaviour is mandatory and must be a number between 0 and 10" });
        }
        const numBehaviour = Number(rawBehaviour);
        if (numBehaviour < 0 || numBehaviour > 10) {
            return res.status(400).json({ message: "behaviour must be between 0 and 10" });
        }

        // responseTime: Mandatory, out of 10 (supports responseTime or response_time)
        const rawResponseTime = responseTime !== undefined ? responseTime : response_time;
        if (rawResponseTime === undefined || rawResponseTime === null || isNaN(Number(rawResponseTime))) {
            return res.status(400).json({ message: "responseTime is mandatory and must be a number between 0 and 10" });
        }
        const numResponseTime = Number(rawResponseTime);
        if (numResponseTime < 0 || numResponseTime > 10) {
            return res.status(400).json({ message: "responseTime must be between 0 and 10" });
        }

        // boundaryRespect: Mandatory, out of 10 (supports boundaryRespect or boundary_respect)
        const rawBoundaryRespect = boundaryRespect !== undefined ? boundaryRespect : boundary_respect;
        if (rawBoundaryRespect === undefined || rawBoundaryRespect === null || isNaN(Number(rawBoundaryRespect))) {
            return res.status(400).json({ message: "boundaryRespect is mandatory and must be a number between 0 and 10" });
        }
        const numBoundaryRespect = Number(rawBoundaryRespect);
        if (numBoundaryRespect < 0 || numBoundaryRespect > 10) {
            return res.status(400).json({ message: "boundaryRespect must be between 0 and 10" });
        }

        // reviewText: Optional
        const text = typeof reviewText === 'string'
            ? reviewText.trim()
            : (typeof comment === 'string' ? comment.trim() : '');

        const review = await reviewModel.create({
            projectId: project._id,
            reviewerId: editorId,
            revieweeId: creatorId,
            rating: numRating,
            reviewText: text,
            comment: text,
            behaviour: numBehaviour,
            responseTime: numResponseTime,
            boundaryRespect: numBoundaryRespect
        });

        // Calculate aggregated review metrics and update creator's userModel
        const stats = await reviewModel.aggregate([
            { $match: { revieweeId: new mongoose.Types.ObjectId(creatorId) } },
            {
                $group: {
                    _id: "$revieweeId",
                    avgRating: { $avg: "$rating" },
                    avgBehaviour: { $avg: "$behaviour" },
                    avgResponseTime: { $avg: "$responseTime" },
                    avgBoundaryRespect: { $avg: "$boundaryRespect" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const s = stats[0];
            const avgBoundary = s.avgBoundaryRespect != null ? Math.round(s.avgBoundaryRespect * 10) / 10 : 0;
            await userModel.findByIdAndUpdate(creatorId, {
                totalReviews: s.totalReviews || 0,
                rating: s.avgRating != null ? Math.round(s.avgRating * 10) / 10 : 0,
                behaviour: s.avgBehaviour != null ? Math.round(s.avgBehaviour * 10) / 10 : 0,
                responseTime: s.avgResponseTime != null ? Math.round(s.avgResponseTime * 10) / 10 : 0,
                boundaryRespect: avgBoundary,
                boundary: avgBoundary
            });
        }

        await review.populate('reviewerId', 'name username profileImage role');
        await review.populate('revieweeId', 'name username profileImage role totalReviews');
        await review.populate('projectId', 'title category status');

        // Notify the reviewed creator
        createNotification({
            recipient: creatorId,
            type: 'NEW_REVIEW',
            title: 'New Review Received',
            message: `${req.user?.name || 'An editor'} left you a ${numRating}-star review for project "${project.title}".`,
            project: project._id,
            relatedUser: editorId
        }).catch(err => console.error("[Notification] Error:", err.message));

        return res.status(201).json({
            message: "Review for creator added successfully",
            review
        });
    } catch (err) {
        console.error("Error in reviewCreatorController:", err);
        return res.status(500).json({
            message: "Internal server error while adding review for creator",
            error: err.message
        });
    }
}

/**
 * @name getUserReviewsController
 * @description Get all reviews of a user with pagination (limit 10), returning fields depending on the user's role
 * @route GET /api/users/:userId/get-review
 * @access Public
 */
async function getUserReviewsController(req, res) {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await userModel.findById(userId).select('role name username profileImage').lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = 10;
        const skip = (page - 1) * limit;

        // Determine fields projection depending on role
        let fieldSelection = '';
        if (user.role === 'editor' || user.role === 'freelancer') {
            // Freelancer/Editor metrics: rating, speed, quality, behaviour, responseTime (exclude boundaryRespect)
            fieldSelection = '-boundaryRespect';
        } else {
            // Creator metrics: rating, behaviour, responseTime, boundaryRespect (exclude speed, quality)
            fieldSelection = '-speed -quality';
        }

        const [totalReviews, reviews] = await Promise.all([
            reviewModel.countDocuments({ revieweeId: userId }),
            reviewModel.find({ revieweeId: userId })
                .select(fieldSelection)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('reviewerId', 'name username profileImage role')
                .populate('projectId', 'title category status')
                .lean()
        ]);

        const totalPages = Math.ceil(totalReviews / limit) || 1;

        return res.status(200).json({
            message: "User reviews retrieved successfully",
            userRole: user.role,
            pagination: {
                totalReviews,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            reviews
        });
    } catch (err) {
        console.error("Error in getUserReviewsController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching user reviews",
            error: err.message
        });
    }
}

/**
 * @name getUserRatingsController
 * @description Get aggregated average ratings and metrics for a user directly from userModel based on role
 * @route GET /api/users/:userId/ratings
 * @access Public
 */
async function getUserRatingsController(req, res) {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await userModel.findById(userId).select(
            'role name username profileImage rating speed quality behaviour responseTime boundaryRespect boundary totalReviews'
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let ratingsData = {};

        if (user.role === 'editor' || user.role === 'freelancer') {
            ratingsData = {
                userId: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                totalReviews: user.totalReviews || 0,
                rating: user.rating || 0,
                speed: user.speed || 0,
                quality: user.quality || 0,
                behaviour: user.behaviour || 0,
                responseTime: user.responseTime || 0
            };
        } else {
            // Creator
            ratingsData = {
                userId: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                totalReviews: user.totalReviews || 0,
                rating: user.rating || 0,
                behaviour: user.behaviour || 0,
                responseTime: user.responseTime || 0,
                boundaryRespect: user.boundaryRespect !== undefined ? user.boundaryRespect : (user.boundary || 0),
                boundary: user.boundary !== undefined ? user.boundary : (user.boundaryRespect || 0)
            };
        }

        return res.status(200).json({
            message: "User ratings retrieved successfully",
            ratings: ratingsData
        });
    } catch (err) {
        console.error("Error in getUserRatingsController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching user ratings",
            error: err.message
        });
    }
}

/**
 * @name getSettingsController
 * @description Get app settings for the authenticated user
 * @access Private
 */
async function getSettingsController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user ID not found" });
        }
        const user = await userModel.findById(userId).select("settings phone phoneNumber email name role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            settings: user.settings || {
                phoneVisibility: 'hired',
                emailNotifications: true,
                projectAlerts: true,
                soundAlerts: true,
                theme: 'dark'
            },
            phoneNumber: user.phoneNumber || user.phone || ''
        });
    } catch (err) {
        console.error("Error in getSettingsController:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

/**
 * @name updateSettingsController
 * @description Update user app settings
 * @access Private
 */
async function updateSettingsController(req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user ID not found" });
        }

        const allowedKeys = ['phoneVisibility', 'emailNotifications', 'projectAlerts', 'soundAlerts', 'theme'];
        const settingsUpdates = {};
        for (const key of allowedKeys) {
            if (req.body[key] !== undefined) {
                settingsUpdates[`settings.${key}`] = req.body[key];
            } else if (req.body.settings && req.body.settings[key] !== undefined) {
                settingsUpdates[`settings.${key}`] = req.body.settings[key];
            }
        }

        // Also allow updating phone number from settings if supplied
        const phoneVal = req.body.phoneNumber || req.body.phone;
        if (phoneVal !== undefined) {
            settingsUpdates.phone = String(phoneVal).trim();
            settingsUpdates.phoneNumber = String(phoneVal).trim();
        }

        if (Object.keys(settingsUpdates).length === 0) {
            return res.status(400).json({ message: "No valid settings fields provided" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: settingsUpdates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Settings updated successfully",
            settings: updatedUser.settings,
            user: updatedUser
        });
    } catch (err) {
        console.error("Error in updateSettingsController:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    getMeController,
    updateMeController,
    uploadProfileImageController,
    getUserByIdController,
    searchUsersController,
    reviewEditorController,
    reviewCreatorController,
    getUserReviewsController,
    getUserRatingsController,
    addReviewController: reviewEditorController,
    getSettingsController,
    updateSettingsController,
    getCollaborationStatusController,
    rateUserController
};
