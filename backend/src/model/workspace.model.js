const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: [true, 'Project ID is required'],
      unique: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Creator ID is required'],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Editor ID is required'],
    },
    status: {
      type: String,
      enum: ['active', 'in_review', 'completed', 'cancelled'],
      default: 'active',
    },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ creatorId: 1 });
workspaceSchema.index({ editorId: 1 });

const workspaceModel = mongoose.model('workspace', workspaceSchema);
module.exports = workspaceModel;
