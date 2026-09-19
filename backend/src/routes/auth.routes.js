const { Router } = require('express');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const authRouter = Router();

/**
 * @route POST api/auth/register
 * @description register new user
 * @access Public
 */
authRouter.post('/register', authController.registerUserController);

/**
 * @route POST api/auth/login
 * @description login a user
 * @access Public
 */
authRouter.post('/login', authController.loginUserController);

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
authRouter.post('/verify-email', authMiddleware.authUser, authController.verifyEmailController);

/**
 * @route GET api/auth/resend-otp
 * @description resend OTP for email verification
 * @access Private
 */
authRouter.get('/resend-otp', authMiddleware.authUser, authController.resendOtpController);

/**
 * @route GET api/auth/refresh-token
 * @description refresh access token using refresh token
 * @access Public
 */
authRouter.get('/refresh-token', authController.refreshToken);

/**
 * @route POST api/auth/forgot-password
 * @description send password reset link to user's email
 * @access Public
 */
authRouter.post('/forgot-password', authController.forgotPasswordController);

/**
 * @route POST api/auth/reset-password
 * @description reset user password using token
 * @access Public
 */
authRouter.post('/reset-password', authController.resetPasswordController);

module.exports = authRouter;