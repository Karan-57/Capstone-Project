const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

const usersRouter = Router();

/**
 * @route GET api/users/get-me
 * @description to get current user info
 * @access Private   
 */
usersRouter.get('/get-me', authMiddleware.authUser, usersController.getMeController);

module.exports = usersRouter;