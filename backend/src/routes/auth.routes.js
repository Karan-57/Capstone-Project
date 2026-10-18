
const { Router } = require('express');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter, forgotPasswordLimiter, resendOtpLimiter } = require('../middleware/rateLimiter.middleware');

const authRouter = Router();

/**
 * @route POST api/auth/register
 * @description register new user (5 requests per 15 min)
 * @access Public
 */
authRouter.post('/register', authLimiter, authController.registerUserController);

/**
 * @route POST api/auth/login
 * @description login a user (5 requests per 15 min)
 * @access Public
 */
authRouter.post('/login', authLimiter, authController.loginUserController);

/**
 * @route GET api/auth/logout
 * @description logout a user
 * @access Public   
 */
authRouter.get('/logout', authController.logoutUserController);

/**
 * @route GET api/auth/logout-all
 * @description logout all the sesssions of user
 * @access Public   
 */
authRouter.get('/logout-all', authController.logoutAllController);


/**
 * @route POST api/auth/verify-email
 * @description to verify user email
 * @access Private
 */
authRouter.post('/verify-email', authMiddleware.optionalAuthMiddleware, authController.verifyEmailController);

/**
 * @route GET & POST api/auth/resend-otp
 * @description resend OTP for email verification (3 requests per 15 min)
 * @access Public / Optional Auth
 */
authRouter.get('/resend-otp', [resendOtpLimiter, authMiddleware.optionalAuthMiddleware], authController.resendOtpController);
authRouter.post('/resend-otp', [resendOtpLimiter, authMiddleware.optionalAuthMiddleware], authController.resendOtpController);

/**
 * @route GET api/auth/refresh-token
 * @description refresh access token using refresh token
 * @access Public
 */
authRouter.get('/refresh-token', authController.refreshToken);

/**
 * @route POST api/auth/forgot-password
 * @description send password reset link to user's email (3 requests per 15 min)
 * @access Public
 */
authRouter.post('/forgot-password', forgotPasswordLimiter, authController.forgotPasswordController);

/**
 * @route POST api/auth/reset-password
 * @description reset user password using token
 * @access Public
 */
authRouter.post('/reset-password', authController.resetPasswordController);

/**
 * @route POST api/auth/google
 * @description Sign in or register via Google OAuth (credential from @react-oauth/google) (5 requests per 15 min)
 * @body { credential: string, role?: 'creator' | 'editor' }
 * @access Public
 */
authRouter.post('/google', authLimiter, authController.googleAuthController);

module.exports = authRouter;
