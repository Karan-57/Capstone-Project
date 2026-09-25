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

/**
 * @route POST api/users/:projectId/reviewEditor
 * @description Creator adds a review for an editor based on projectId
 * @access Private (Creator)
 */
usersRouter.post('/:projectId/reviewEditor', authMiddleware.authUser, usersController.reviewEditorController);

/**
 * @route POST api/users/:projectId/reviewCreator
 * @description Editor adds a review for a creator based on projectId
 * @access Private (Editor)
 */
usersRouter.post('/:projectId/reviewCreator', authMiddleware.authUser, usersController.reviewCreatorController);

module.exports = usersRouter;