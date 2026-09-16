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
 * @route GET api/auth/get-me
 * @description to get user info
 * @access Private   
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController);

/**
 * @route POST api/auth/verify-email
 * @description to verify user email
 * @access Private
 */
authRouter.post('/verify-email', authMiddleware.authUser, authController.verifyEmailController);

/**
 * @route POST api/auth/refresh-token
 * @description refresh access token using refresh token
 * @access Public
 */
authRouter.post('/refresh-token', authController.refreshToken);

module.exports = authRouter;