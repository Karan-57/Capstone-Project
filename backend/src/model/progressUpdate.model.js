const mongoose = require('mongoose');

const progressUpdateSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'review_ready', 'completed'],
      default: 'in_progress',
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    message: {
      type: String,
      required: [true, 'Progress message is required'],
    },
  },
  {
    timestamps: true,
  }
);

progressUpdateSchema.index({ workspaceId: 1, createdAt: -1 });

const progressUpdateModel = mongoose.model('progressUpdate', progressUpdateSchema);
module.exports = progressUpdateModel;
