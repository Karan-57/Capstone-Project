const { Router } = require('express');
const roleController = require('../controllers/role.controller');

const roleRouter = Router();

/**
 * @route GET /api/roles
 * @description List all content creator freelancer roles
 * @access Public
 */
roleRouter.get('/', roleController.getAllRolesController);

/**
 * @route GET /api/roles/:roleId
 * @description Get specific role details
 * @access Public
 */
roleRouter.get('/:roleId', roleController.getRoleByIdController);

module.exports = roleRouter;
