const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const projectModel = require('../model/project.model');
const workspaceModel = require('../model/workspace.model');
const reviewModel = require('../model/review.model');
const mongoose = require('mongoose');
const config = require('../config/config');
const { uploadToImageKit } = require('../services/imagekit.service');

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
            'phone'
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body && req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
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

        const user = await userModel.findById(userId).select("-password");

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

        const users = await userModel.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
        .select('name username profileImage role bio location')
        .limit(10);

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

        // Update totalReviews count on User model
        const totalReviews = await reviewModel.countDocuments({ revieweeId });
        await userModel.findByIdAndUpdate(revieweeId, {
            totalReviews
        });

        await review.populate('reviewerId', 'name username profileImage role');
        await review.populate('revieweeId', 'name username profileImage role totalReviews');
        await review.populate('projectId', 'title category status');

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

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can submit reviews for creators" });
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

        // Update totalReviews count on User model
        const totalReviews = await reviewModel.countDocuments({ revieweeId: creatorId });
        await userModel.findByIdAndUpdate(creatorId, {
            totalReviews
        });

        await review.populate('reviewerId', 'name username profileImage role');
        await review.populate('revieweeId', 'name username profileImage role totalReviews');
        await review.populate('projectId', 'title category status');

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

module.exports = {
    getMeController,
    updateMeController,
    uploadProfileImageController,
    getUserByIdController,
    searchUsersController,
    reviewEditorController,
    reviewCreatorController,
    addReviewController: reviewEditorController
};
