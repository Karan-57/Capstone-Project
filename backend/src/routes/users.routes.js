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
 * @route GET api/users/me/settings
 * @description get user app settings
 * @access Private
 */
usersRouter.get('/me/settings', authMiddleware.authUser, usersController.getSettingsController);

/**
 * @route PATCH api/users/me/settings
 * @description update user app settings
 * @access Private
 */
usersRouter.patch('/me/settings', authMiddleware.authUser, usersController.updateSettingsController);

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
usersRouter.get('/search', authMiddleware.optionalAuthMiddleware, usersController.searchUsersController);

/**
 * @route GET api/users/:userId/collaboration-status
 * @description check if logged-in user and target user have worked together on any project
 * @access Private
 */
usersRouter.get('/:userId/collaboration-status', authMiddleware.authUser, usersController.getCollaborationStatusController);

/**
 * @route POST api/users/:userId/rate
 * @description submit rating and review for a user you have collaborated with on a project
 * @access Private
 */
usersRouter.post('/:userId/rate', authMiddleware.authUser, usersController.rateUserController);

/**
 * @route GET api/users/:userId/get-review
 * @description get all reviews of a user with pagination (limit 10)
 * @access Public
 */
usersRouter.get('/:userId/get-review', usersController.getUserReviewsController);

/**
 * @route GET api/users/:userId/ratings
 * @description get average ratings and metrics for a user based on role
 * @access Public
 */
usersRouter.get('/:userId/ratings', usersController.getUserRatingsController);

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