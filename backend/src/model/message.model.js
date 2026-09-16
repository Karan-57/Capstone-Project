const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      default: 'text',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ workspaceId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, read: 1 });

const messageModel = mongoose.model('Message', messageSchema);
module.exports = messageModel;
