const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

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

module.exports = usersRouter;