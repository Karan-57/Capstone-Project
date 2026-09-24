const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/file.middleware');

const usersRouter = Router();

/**
 * @route GET api/users/me
 * @description to get current user info
 * @access Private   
 */
usersRouter.get('/me', authMiddleware.authUser, usersController.getMeController);

/**
 * @route PATCH api/users/me
 * @description update current user profile
 * @access Private
 */
usersRouter.patch('/me', authMiddleware.authUser, usersController.updateMeController);

/**
 * @route PATCH api/users/me/profile-image
 * @description upload and update profile image
 * @access Private
 */
usersRouter.patch('/me/profile-image', authMiddleware.authUser, upload.single('profileImage'), usersController.uploadProfileImageController);

/**
 * @route GET api/users/search
 * @description search users by username or name
 * @access Public
 */
usersRouter.get('/search', usersController.searchUsersController);

/**
 * @route GET api/users/:userId
 * @description get user public profile by ID
 * @access Public
 */
usersRouter.get('/:userId', usersController.getUserByIdController);

module.exports = usersRouter;