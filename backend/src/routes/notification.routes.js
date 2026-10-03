const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

const notificationRouter = Router();

/**
 * @route GET /api/notifications
 * @description Get all notifications for the authenticated user
 * @access Private
 */
notificationRouter.get('/', authMiddleware, notificationController.getNotificationsController);

/**
 * @route PATCH /api/notifications/read-all
 * @description Mark all notifications as read for the authenticated user
 * @access Private
 */
notificationRouter.patch('/read-all', authMiddleware, notificationController.markAllNotificationsReadController);

/**
 * @route PATCH /api/notifications/:notificationId/read
 * @description Mark a specific notification as read
 * @access Private
 */
notificationRouter.patch(['/:notificationId/read', '/:id/read'], authMiddleware, notificationController.markNotificationReadController);

/**
 * @route DELETE /api/notifications/:notificationId
 * @description Delete a specific notification
 * @access Private
 */
notificationRouter.delete(['/:notificationId', '/:id'], authMiddleware, notificationController.deleteNotificationController);

module.exports = notificationRouter;
