const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'project'],
      required: true,
      default: 'private',
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    ],

    // For project conversations
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      default: null,
    },

    lastMessage: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
        default: null,
      },
      text: {
        type: String,
        default: '',
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },

    // Participant-specific read tracking
    // Map of userId -> lastReadAt
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ projectId: 1 });
conversationSchema.index({ workspaceId: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ type: 1, projectId: 1 }, { unique: true, partialFilterExpression: { type: 'project', projectId: { $type: 'objectId' } } });

const conversationModel = mongoose.model('conversation', conversationSchema);
module.exports = conversationModel;
