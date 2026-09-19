const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const config = require('../config/config');

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
 * @description update current user profile
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
            'profileImage',
            'bio',
            'location',
            'phone',
            'skills',
            'software',
            'experience',
            'portfolio'
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
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

module.exports = {
    getMeController,
    updateMeController
};
