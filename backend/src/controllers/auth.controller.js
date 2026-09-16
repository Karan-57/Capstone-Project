const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
    
const userModel = require('../model/user.model');
const config = require('../config/config');
const otpModel = require('../model/otp.model');
const sessionModel = require('../model/session.model');
const { sendEmail } = require('../services/email.service.js');
const tokenBlacklistModel = require('../model/tokenBlacklist.model.js');
const { generateOTP, generateOTPEmailHTML } = require('../utils/utils.js');

function hashToken(token) {
    return crypto.createHash('sha256').update(token.toString()).digest('hex');
}





/**
 * @name registerUserController
 * @description register new user, expect name/username, email and password
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { name, username, email, password, role = "creator" } = req.body;
        const displayName = name || username;

        if (!displayName || !email || !password) {
            return res.status(400).json({
                message: "Name/username, email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const alreadyExists = await userModel.findOne({
            $or: [
                { email: normalizedEmail },
                ...(username ? [{ username: username.trim() }] : [])
            ]
        });

        if (alreadyExists) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name: displayName.trim(),
            username: (username || displayName).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        const otp = generateOTP();
        const html = generateOTPEmailHTML(otp);
        const otpHash = hashToken(otp);

        await otpModel.deleteMany({ email: normalizedEmail });

        await otpModel.create({
            email: normalizedEmail,
            user: user._id,
            otpHash
        });

        await sendEmail(normalizedEmail, "OTP verification", `Your OTP is ${otp}`, html);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified
            }
        });
    } catch (err) {
        console.error("Error in registerUserController:", err);
        return res.status(500).json({
            message: "Internal server error during registration",
            error: err.message
        });
    }
}



/**
 * @name loginUserController
 * @description login a user, expect email and password
 * @access Public
 */

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.verified) {
            return res.status(403).json({
                message: "User not verified. Please verify your email."
            });
        }

        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const refreshTokenHash = hashToken(refreshToken);

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown'
        });

        const accessToken = jwt.sign(
            { id: user._id, session: session._id },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Error in loginUserController:", err);
        return res.status(500).json({
            message: "Internal server error during login",
            error: err.message
        });
    }
}

/**
 * @name logoutUserController
 * @description logout a user and revoke session
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (refreshToken) {
            const refreshTokenHash = hashToken(refreshToken);
            const session = await sessionModel.findOne({
                refreshTokenHash,
                revoked: false
            });

            if (session) {
                session.revoked = true;
                await session.save();
            }
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const accessToken = authHeader.split(" ")[1];
            try {
                await tokenBlacklistModel.create({ token: accessToken });
            } catch (err) {
                // ignore duplicate
            }
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (err) {
        console.error("Error in logoutUserController:", err);
        return res.status(500).json({
            message: "Internal server error during logout",
            error: err.message
        });
    }
}

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

        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

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
 * @name verifyEmailController
 * @description verify email using OTP
 * @access Public
 */
async function verifyEmailController(req, res) {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({
                message: "OTP and email are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const otpHash = hashToken(otp.toString().trim());

        const otpDoc = await otpModel.findOne({
            email: normalizedEmail,
            otpHash
        });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        // 10 minutes expiry check
        const OTP_EXPIRY_MS = 10 * 60 * 1000;
        if (Date.now() - new Date(otpDoc.createdAt).getTime() > OTP_EXPIRY_MS) {
            await otpModel.deleteMany({ email: normalizedEmail });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        await userModel.findByIdAndUpdate(otpDoc.user, { verified: true });
        await otpModel.deleteMany({ email: normalizedEmail });

        return res.status(200).json({ message: "User verified successfully" });
    } catch (err) {
        console.error("Error in verifyEmailController:", err);
        return res.status(500).json({
            message: "Internal server error during verification",
            error: err.message
        });
    }
}

/**
 * @name refreshToken
 * @description to refresh access token using refresh token
 * @access Public
 */
async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const refreshTokenHash = hashToken(refreshToken);

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid or revoked refresh token"
            });
        }

        const accessToken = jwt.sign(
            { id: decoded.id, session: session._id },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        session.refreshTokenHash = hashToken(newRefreshToken);
        await session.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Access token refreshed",
            accessToken
        });
    } catch (err) {
        console.error("Error in refreshToken:", err);
        return res.status(500).json({
            message: "Internal server error during token refresh",
            error: err.message
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    verifyEmailController,
    refreshToken
};