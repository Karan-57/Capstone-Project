const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const tokenBlacklistModel = require('../model/tokenBlacklist.model');
const config = require('../config/config');

// In-memory cache for token blacklist lookups (saves remote DB round-trip on every authenticated request)
const blacklistCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache

function markTokenBlacklisted(token) {
    if (token) {
        blacklistCache.set(token, { isBlacklisted: true, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    }
}

async function isTokenBlacklisted(token) {
    const now = Date.now();
    const cached = blacklistCache.get(token);
    if (cached && cached.expiresAt > now) {
        return cached.isBlacklisted;
    }

    const doc = await tokenBlacklistModel.findOne({ token }).lean();
    const isBlacklisted = Boolean(doc);
    blacklistCache.set(token, { isBlacklisted, expiresAt: now + CACHE_TTL_MS });

    if (blacklistCache.size > 2000) {
        for (const [k, v] of blacklistCache.entries()) {
            if (v.expiresAt <= now) blacklistCache.delete(k);
        }
    }
    return isBlacklisted;
}

async function authMiddleware(req, res, next) {
    try {
        const accessToken = req.cookies?.accessToken || req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                message: "unauthorized user, access token missing"
            });
        }

        const blacklisted = await isTokenBlacklisted(accessToken);
        if (blacklisted) {
            return res.status(401).json({
                message: "unauthorized user, access token is invalid"
            });
        }

        const decoded = jwt.verify(accessToken, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("-password").lean();

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

async function optionalAuthMiddleware(req, res, next) {
    try {
        const accessToken = req.cookies?.accessToken || req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return next();
        }

        const blacklisted = await isTokenBlacklisted(accessToken);
        if (blacklisted) {
            return next();
        }

        const decoded = jwt.verify(accessToken, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password").lean();
        if (user) {
            req.user = user;
        }
        return next();
    } catch {
        return next();
    }
}

module.exports = {
    authMiddleware,
    authUser: authMiddleware,
    optionalAuthMiddleware,
    markTokenBlacklisted
};