const mongoose = require('mongoose');
const notificationService = require('../services/notification.service');

/**
 * @name getNotificationsController
 * @route GET /api/notifications
 * @description Retrieves paginated notifications for the authenticated user
 * @access Private
 */
async function getNotificationsController(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { page, limit, unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true' || unreadOnly === true,
    });

    return res.status(200).json({
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error in getNotificationsController:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching notifications',
      error: error.message,
    });
  }
}

/**
 * @name markNotificationReadController
 * @route PATCH /api/notifications/:id/read
 * @description Marks a single notification as read (must belong to authenticated user)
 * @access Private
 */
async function markNotificationReadController(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const id = req.params.notificationId || req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await notificationService.markNotificationAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found or you are not authorized to update it',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Error in markNotificationReadController:', error);
    return res.status(500).json({
      message: 'Internal server error while updating notification',
      error: error.message,
    });
  }
}

/**
 * @name markAllNotificationsReadController
 * @route PATCH /api/notifications/read-all
 * @description Marks all notifications for the authenticated user as read
 * @access Private
 */
async function markAllNotificationsReadController(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    await notificationService.markAllNotificationsAsRead(userId);

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error in markAllNotificationsReadController:', error);
    return res.status(500).json({
      message: 'Internal server error while marking all notifications as read',
      error: error.message,
    });
  }
}

/**
 * @name deleteNotificationController
 * @route DELETE /api/notifications/:id
 * @description Deletes a notification belonging to the authenticated user
 * @access Private
 */
async function deleteNotificationController(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const id = req.params.notificationId || req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const deleted = await notificationService.deleteNotification(id, userId);

    if (!deleted) {
      return res.status(404).json({
        message: 'Notification not found or you are not authorized to delete it',
      });
    }

    return res.status(200).json({
      message: 'Notification deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error in deleteNotificationController:', error);
    return res.status(500).json({
      message: 'Internal server error while deleting notification',
      error: error.message,
    });
  }
}

module.exports = {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
};
