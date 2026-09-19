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

module.exports = {
    getMeController
};
