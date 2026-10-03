const notificationModel = require('../model/notification.model');
const { getIO } = require('../socket');

/**
 * Creates and persists a system notification in MongoDB, then emits it in real-time
 * via Socket.io if the recipient is currently online.
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.recipient - User ID of the notification recipient (required)
 * @param {string} params.type - Controlled notification type from NOTIFICATION_TYPES (required)
 * @param {string} params.title - Short title for the notification (required)
 * @param {string} params.message - Descriptive notification message (required)
 * @param {string|import('mongoose').Types.ObjectId} [params.project] - Associated Project ID (optional)
 * @param {string|import('mongoose').Types.ObjectId} [params.relatedUser] - Associated User ID who triggered the action (optional)
 * @returns {Promise<import('mongoose').Document>} The persisted notification document
 */
async function createNotification({
  recipient,
  type,
  title,
  message,
  project = null,
  relatedUser = null,
}) {
  try {
    if (!recipient) {
      throw new Error('Recipient is required to create a notification');
    }
    if (!type) {
      throw new Error('Notification type is required');
    }
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // 1. Save notification to MongoDB
    const notification = await notificationModel.create({
      recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      project: project || null,
      relatedUser: relatedUser || null,
      isRead: false,
    });

    // Populate relations if present so client receives complete display metadata
    if (notification.relatedUser) {
      await notification.populate('relatedUser', 'name username profileImage role');
    }
    if (notification.project) {
      await notification.populate('project', 'title category status');
    }

    // 2. Deliver in real-time via Socket.io if recipient has active connection
    try {
      const io = getIO();
      if (io) {
        // Emit exclusively to recipient's personal room using the dedicated 'system-notification' event
        io.to(recipient.toString()).emit('system-notification', notification);
      }
    } catch (socketErr) {
      console.error('[NotificationService] Socket emission warning:', socketErr.message);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    throw error;
  }
}

/**
 * Retrieves paginated notifications for a recipient
 *
 * @param {string|import('mongoose').Types.ObjectId} recipientId
 * @param {Object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {boolean} [options.unreadOnly=false]
 */
async function getUserNotifications(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const query = { recipient: recipientId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [notifications, total, unreadCount] = await Promise.all([
    notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('relatedUser', 'name username profileImage role')
      .populate('project', 'title category status'),
    notificationModel.countDocuments(query),
    notificationModel.countDocuments({ recipient: recipientId, isRead: false }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      unreadCount,
      currentPage: safePage,
      totalPages: Math.ceil(total / safeLimit) || 1,
      limit: safeLimit,
      hasNextPage: safePage < Math.ceil(total / safeLimit),
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Marks a single notification as read (only if owned by the user)
 *
 * @param {string} notificationId
 * @param {string} recipientId
 */
async function markNotificationAsRead(notificationId, recipientId) {
  const notification = await notificationModel.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId },
    { isRead: true },
    { new: true }
  )
    .populate('relatedUser', 'name username profileImage role')
    .populate('project', 'title category status');

  return notification;
}

/**
 * Marks all notifications as read for a recipient
 *
 * @param {string} recipientId
 */
async function markAllNotificationsAsRead(recipientId) {
  const result = await notificationModel.updateMany(
    { recipient: recipientId, isRead: false },
    { isRead: true }
  );
  return result;
}

/**
 * Deletes a notification (only if owned by the recipient)
 *
 * @param {string} notificationId
 * @param {string} recipientId
 */
async function deleteNotification(notificationId, recipientId) {
  const deleted = await notificationModel.findOneAndDelete({
    _id: notificationId,
    recipient: recipientId,
  });
  return deleted;
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
