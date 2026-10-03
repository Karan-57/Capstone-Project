const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'NEW_APPLICATION',
  'APPLICATION_ACCEPTED',
  'APPLICATION_REJECTED',
  'EDITOR_SELECTED',
  'NEW_BID',
  'PROJECT_STATUS_UPDATED',
  'FILES_UPLOADED',
  'FILE_DELETED',
  'FINAL_SUBMISSION',
  'REVISION_REQUESTED',
  'REVISION_SUBMITTED',
  'PROJECT_APPROVED',
  'PROJECT_CANCELLED',
  'PROJECT_CLOSED',
  'PROJECT_PUBLISHED',
  'ADDED_TO_PROJECT',
  'DEADLINE_UPDATED',
  'REQUIREMENTS_UPDATED',
  'NEW_REVIEW',
  'DEADLINE_REMINDER',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type',
      },
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      default: null,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval and unread filtering
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const notificationModel =
  mongoose.models.notification || mongoose.model('notification', notificationSchema);

notificationModel.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = notificationModel;
