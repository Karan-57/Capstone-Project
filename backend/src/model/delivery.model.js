const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      required: [true, 'Workspace ID is required'],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Editor ID is required'],
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'file',
      default: null,
    },
    videoUrl: {
      type: String,
      required: [true, 'Delivered video URL or file link is required'],
    },
    title: {
      type: String,
      default: 'Final Delivery',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'revision_requested'],
      default: 'pending_review',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deliverySchema.index({ workspaceId: 1, version: -1 });

const deliveryModel = mongoose.model('delivery', deliverySchema);
module.exports = deliveryModel;
