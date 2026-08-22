const {Router} = require('express')

const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = Router();

/**
 * @route POST api/auth/register
 * @description register new user
 * @access Public
 */
authRouter.post('/register',authController.registerUserController);

/**
 * @route POST api/auth/login
 * @description login a user
 * @access Public
 */
authRouter.post('/login',authController.loginUserController);

/**
 * @route GET api/auth/logout
 * @description logout a user
 * @access Public   
 */
authRouter.get('/logout',authController.logoutUserController);

/**
 * @route GET api/auth/get-me
 * @description to get user info
 * @access Public   
 */
authRouter.get('/get-me',authMiddleware.authUser,authController.getMeController);

module.exports = authRouter;