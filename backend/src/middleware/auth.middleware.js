const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const tokenBlacklistModel = require('../model/tokenBlacklist.model');
const config = require('../config/config');

async function authMiddleware(req, res, next) {
    try {
        const accessToken = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                message: "unauthorized user, access token missing"
            });
        }

        const isBlacklisted = await tokenBlacklistModel.findOne({ token: accessToken });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "unauthorized user, access token is invalid"
            });
        }

        const decoded = jwt.verify(accessToken, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "unauthorized user, account not found"
            });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            message: "unauthorized user, token is invalid"
        });
    }
}

module.exports = {
    authMiddleware,
    authUser: authMiddleware
};