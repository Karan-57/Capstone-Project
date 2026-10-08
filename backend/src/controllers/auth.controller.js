const crypto = require('crypto')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
    
const userModel = require('../model/user.model');
const config = require('../config/config');
const otpModel = require('../model/otp.model');
const sessionModel = require('../model/session.model');
const { sendEmail } = require('../services/email.service.js');
const tokenBlacklistModel = require('../model/tokenBlacklist.model.js');
const { generateOTP, generateOTPEmailHTML } = require('../utils/utils.js');

/**
 * Hash token using SHA-256 for secure session storage/lookup
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
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
        const otpHash = await bcrypt.hash(otp, 10);

        await otpModel.deleteMany({ email: normalizedEmail });

        await otpModel.create({
            email: normalizedEmail,
            user: user._id,
            otpHash
        });

        await sendEmail(normalizedEmail, "OTP verification", `Your OTP is ${otp}`, html);

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

        return res.status(201).json({
            message: "User registered successfully",
            accessToken,
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
 * @description login a user, expect email/username and password
 * @access Public
 */

async function loginUserController(req, res) {
    try {
        const { email, username, identifier, password } = req.body;
        const loginIdentifier = (identifier || email || username || '').trim();

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                message: "Email or username, and password are required"
            });
        }

        const normalizedIdentifier = loginIdentifier.toLowerCase();

        const user = await userModel.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: loginIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
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
        const refreshToken = req.cookies?.refreshToken;

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
 * @name logoutAllController
 * @description logout all sessions of user and revoke them
 * @access Public
 */
async function logoutAllController(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const sessions = await sessionModel.find({
                user:refreshToken.id,
                revoked: false
            })

            if(sessions.length > 0) {
                for(const session in sessions) {
                    session.revoked = true;
                    await session.save();
                }
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
            message: "User logged out successfully from all sessions"
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
 * @name verifyEmailController
 * @description verify email using OTP
 * @access Public
 */
async function verifyEmailController(req, res) {
    try {
        const { otp } = req.body;
        const email = req.user?.email || req.body?.email;

        if (!otp || !email) {
            return res.status(400).json({
                message: "OTP is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpDoc = await otpModel.findOne({
            email: normalizedEmail
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const isMatch = await bcrypt.compare(otp.toString().trim(), otpDoc.otpHash);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // 10 minutes expiry check
        const OTP_EXPIRY_MS = 10 * 60 * 1000;
        if (Date.now() - new Date(otpDoc.createdAt).getTime() > OTP_EXPIRY_MS) {
            await otpModel.deleteMany({ email: normalizedEmail });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const userId = req.user?._id || req.user?.id || otpDoc.user;
        await userModel.findByIdAndUpdate(userId, { verified: true });
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
 * @name resendOtp
 * @description resend verification OTP to user email
 * @access private
 */
async function resendOtpController(req, res) {
    try {
        const email = req.user?.email || req.body?.email || req.query?.email;

        if(!email){
            return res.status(400).json({
                message: "Email is required to resend OTP"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = req.user || (await userModel.findOne({ email: normalizedEmail }));

        if (!user) {
            return res.status(404).json({
                message: "No user found with this email"
            });
        }

        const otp = generateOTP();
        const html = generateOTPEmailHTML(otp);
        const otpHash = await bcrypt.hash(otp, 10);

        await otpModel.deleteMany({ email: normalizedEmail });

        await otpModel.create({
            email: normalizedEmail,
            user: user._id,
            otpHash
        });

        await sendEmail(normalizedEmail, "OTP verification", `Your OTP is ${otp}`, html);

        return res.status(200).json({
            message: "Verification OTP resent successfully"
        });
    } catch (err) {
        console.error("Error in resendOtpController:", err);
        return res.status(500).json({
            message: "Internal server error during OTP resend",
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

/**
 * @name forgotPasswordController
 * @description send password reset link to user's email
 * @access Public
 */
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        // Always return success response to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: "If an account with that email exists, a password reset link has been sent."
            });
        }

        // Generate temporary reset token (15m validity)
        const resetToken = jwt.sign(
            { id: user._id, type: "password-reset" },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Placeholder link (to be updated with frontend URL later)
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hello ${user.name || user.username},</p>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <p><a href="${resetLink}" style="display:inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${resetLink}</p>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
        `;

        await sendEmail(
            normalizedEmail,
            "Reset Your Password",
            `Reset your password: ${resetLink}`,
            html
        );

        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (err) {
        console.error("Error in forgotPasswordController:", err);
        return res.status(500).json({
            message: "Internal server error during password reset request",
            error: err.message
        });
    }
}

/**
 * @name resetPasswordController
 * @description verify reset token and update user password
 * @access Public
 */
async function resetPasswordController(req, res) {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        if (decoded.type !== "password-reset") {
            return res.status(400).json({
                message: "Invalid token type"
            });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        // Revoke all existing sessions so old logins are terminated
        await sessionModel.updateMany(
            { user: user._id, revoked: false },
            { $set: { revoked: true } }
        );

        return res.status(200).json({
            message: "Password reset successfully. You can now login with your new password."
        });
    } catch (err) {
        console.error("Error in resetPasswordController:", err);
        return res.status(500).json({
            message: "Internal server error during password reset",
            error: err.message
        });
    }
}

/**
 * @name socialLoginController
 * @description Google and Facebook OAuth sign-in / registration
 * @access Public
 */
async function socialLoginController(req, res) {
    try {
        const { provider, email, name, avatar, role = 'creator' } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required for social authentication"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            // Generate clean username from name or email
            const base = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .slice(0, 20) || 'user';
            let candidateUsername = base;
            let counter = 1;
            while (await userModel.findOne({ username: candidateUsername })) {
                candidateUsername = `${base}_${counter++}`;
            }

            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await userModel.create({
                name: (name || candidateUsername).trim(),
                username: candidateUsername,
                email: normalizedEmail,
                password: hashedPassword,
                role: role === 'editor' ? 'editor' : 'creator',
                verified: true,
                profileImage: avatar || ''
            });
        } else if (!user.verified) {
            user.verified = true;
            if (avatar && !user.profileImage) {
                user.profileImage = avatar;
            }
            await user.save();
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
            userAgent: req.headers['user-agent'] || `${provider || 'social'}-oauth`
        });

        const accessToken = jwt.sign(
            { id: user._id, session: session._id },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: `${provider || 'Social'} login successful`,
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                verified: user.verified
            }
        });
    } catch (err) {
        console.error("Error in socialLoginController:", err);
        return res.status(500).json({
            message: "Social login failed",
            error: err.message
        });
    }
}

module.exports = {
    socialLoginController,
    registerUserController,
    loginUserController,
    logoutUserController,
    logoutAllController,
    verifyEmailController,
    resendOtpController,
    refreshToken,
    forgotPasswordController,
    resetPasswordController
};
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
    
const userModel = require('../model/user.model');
const config = require('../config/config');
const otpModel = require('../model/otp.model');
const sessionModel = require('../model/session.model');
const { sendEmail } = require('../services/email.service.js');
const tokenBlacklistModel = require('../model/tokenBlacklist.model.js');
const { generateOTP, generateOTPEmailHTML } = require('../utils/utils.js');

/**
 * Hash token using SHA-256 for secure session storage/lookup
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
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
        const otpHash = await bcrypt.hash(otp, 10);

        await otpModel.deleteMany({ email: normalizedEmail });

        await otpModel.create({
            email: normalizedEmail,
            user: user._id,
            otpHash
        });

        await sendEmail(normalizedEmail, "OTP verification", `Your OTP is ${otp}`, html);

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

        return res.status(201).json({
            message: "User registered successfully",
            accessToken,
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
 * @description login a user, expect email/username and password
 * @access Public
 */

async function loginUserController(req, res) {
    try {
        const { email, username, identifier, password } = req.body;
        const loginIdentifier = (identifier || email || username || '').trim();

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                message: "Email or username, and password are required"
            });
        }

        const normalizedIdentifier = loginIdentifier.toLowerCase();

        const user = await userModel.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: loginIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Guard: Google-only accounts have no local password
        if (!user.password) {
            return res.status(400).json({
                message: "This account was created with Google. Please use 'Sign in with Google' instead."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
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
        const refreshToken = req.cookies?.refreshToken;

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
 * @name logoutAllController
 * @description logout all sessions of user and revoke them
 * @access Public
 */
async function logoutAllController(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const sessions = await sessionModel.find({
                user:refreshToken.id,
                revoked: false
            })

            if(sessions.length > 0) {
                for(const session in sessions) {
                    session.revoked = true;
                    await session.save();
                }
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
            message: "User logged out successfully from all sessions"
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
 * @name verifyEmailController
 * @description verify email using OTP
 * @access Public
 */
async function verifyEmailController(req, res) {
    try {
        const { otp } = req.body;
        const email = req.user?.email || req.body?.email;

        if (!otp || !email) {
            return res.status(400).json({
                message: "OTP is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpDoc = await otpModel.findOne({
            email: normalizedEmail
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const isMatch = await bcrypt.compare(otp.toString().trim(), otpDoc.otpHash);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // 10 minutes expiry check
        const OTP_EXPIRY_MS = 10 * 60 * 1000;
        if (Date.now() - new Date(otpDoc.createdAt).getTime() > OTP_EXPIRY_MS) {
            await otpModel.deleteMany({ email: normalizedEmail });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const userId = req.user?._id || req.user?.id || otpDoc.user;
        await userModel.findByIdAndUpdate(userId, { verified: true });
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
 * @name resendOtp
 * @description resend verification OTP to user email
 * @access private
 */
async function resendOtpController(req, res) {
    try {
        const user = req.user;
        const email = req.user?.email || req.body?.email;
        const normalizedEmail = email.toLowerCase().trim();


        if(!email){
            return res.status(400).json({
                message: "Email is required to resend OTP"
            });
        }

        const otp = generateOTP();
        const html = generateOTPEmailHTML(otp);
        const otpHash = await bcrypt.hash(otp, 10);

        await otpModel.deleteMany({ email: normalizedEmail });

        await otpModel.create({
            email: normalizedEmail,
            user: user._id,
            otpHash
        });

        await sendEmail(normalizedEmail, "OTP verification", `Your OTP is ${otp}`, html);
    } catch (err) {
        console.error("Error in resendOtpController:", err);
        return res.status(500).json({
            message: "Internal server error during OTP resend",
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

/**
 * @name forgotPasswordController
 * @description send password reset link to user's email
 * @access Public
 */
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        // Always return success response to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: "If an account with that email exists, a password reset link has been sent."
            });
        }

        // Generate temporary reset token (15m validity)
        const resetToken = jwt.sign(
            { id: user._id, type: "password-reset" },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Placeholder link (to be updated with frontend URL later)
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hello ${user.name || user.username},</p>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <p><a href="${resetLink}" style="display:inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${resetLink}</p>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
        `;

        await sendEmail(
            normalizedEmail,
            "Reset Your Password",
            `Reset your password: ${resetLink}`,
            html
        );

        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (err) {
        console.error("Error in forgotPasswordController:", err);
        return res.status(500).json({
            message: "Internal server error during password reset request",
            error: err.message
        });
    }
}

/**
 * @name resetPasswordController
 * @description verify reset token and update user password
 * @access Public
 */
async function resetPasswordController(req, res) {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        if (decoded.type !== "password-reset") {
            return res.status(400).json({
                message: "Invalid token type"
            });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Use findByIdAndUpdate to bypass full-document Mongoose validation on unrelated fields
        // (e.g. Google OAuth users who have no password field set)
        await userModel.findByIdAndUpdate(
            user._id,
            { $set: { password: hashedPassword } },
            { runValidators: false }
        );


        // Revoke all existing sessions so old logins are terminated
        await sessionModel.updateMany(
            { user: user._id, revoked: false },
            { $set: { revoked: true } }
        );

        return res.status(200).json({
            message: "Password reset successfully. You can now login with your new password."
        });
    } catch (err) {
        console.error("Error in resetPasswordController:", err);
        return res.status(500).json({
            message: "Internal server error during password reset",
            error: err.message
        });
    }
}

/**
 * @name googleAuthController
 * @description Sign in or register via Google OAuth credential token.
 *   - Verifies Google's credential JWT using google-auth-library.
 *   - Finds existing user by email or creates a new one (verified: true, no OTP needed).
 *   - If user signed up via email/password earlier with same email, links their googleId.
 *   - Issues the exact same accessToken + refreshToken cookie as normal login/register.
 * @access Public
 */
const { OAuth2Client } = require('google-auth-library');

async function googleAuthController(req, res) {
    try {
        const { credential, role = 'creator' } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential token is required" });
        }

        // Verify the Google ID token cryptographically using google-auth-library
        // This ensures the token was genuinely issued by Google for our Client ID
        const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: config.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (err) {
            return res.status(401).json({ message: "Invalid Google credential token" });
        }

        const { sub: googleId, email, name, picture } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // Find existing user by email (covers: already registered via email/password)
        let user = await userModel.findOne({ email: normalizedEmail });

        if (user) {
            // Account already exists — link Google ID if not already linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google'; // note: they now have both, but we track original
                user.verified = true;          // if they hadn't verified their email, Google proves it now
                await user.save();
            }
        } else {
            // New user — create account. Google already verified the email so verified: true
            // Generate clean username format: [namePrefix][separator][4-digit-number] (e.g. john_4821 or alex.7391)
            const rawPrefix = (name || normalizedEmail.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .slice(0, 20) || 'user';

            // Separator chosen from '_' or '.'
            const separators = ['_', '.'];
            const sep = separators[Math.floor(Math.random() * separators.length)];

            // Ensure 4-digit number (1000 - 9999)
            let uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
            let usernameCandidate = `${rawPrefix}${sep}${uniqueSuffix}`;

            // Handle rare collision check
            let collisionCheck = await userModel.findOne({ username: usernameCandidate });
            while (collisionCheck) {
                uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
                usernameCandidate = `${rawPrefix}${sep}${uniqueSuffix}`;
                collisionCheck = await userModel.findOne({ username: usernameCandidate });
            }

            user = await userModel.create({
                name: name || rawPrefix,
                username: usernameCandidate,
                email: normalizedEmail,
                googleId,
                authProvider: 'google',
                role,
                verified: true,
                profileImage: picture || '',
            });
        }


        // From here — identical session + token logic as loginUserController & registerUserController
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
            message: "Google sign-in successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified,
                profileImage: user.profileImage,
                authProvider: user.authProvider
            }
        });
    } catch (err) {
        console.error("Error in googleAuthController:", err);
        return res.status(500).json({
            message: "Internal server error during Google sign-in",
            error: err.message
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    logoutAllController,
    verifyEmailController,
    resendOtpController,
    refreshToken,
    forgotPasswordController,
    resetPasswordController,
    googleAuthController
};
