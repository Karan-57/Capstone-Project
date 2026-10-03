const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'conversation',
      required: [true, 'Conversation ID is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Sender is required'],
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text',
    },
    text: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          default: 'file',
        },
        size: {
          type: Number,
          default: 0,
        },
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const messageModel = mongoose.model('message', messageSchema);
module.exports = messageModel;
