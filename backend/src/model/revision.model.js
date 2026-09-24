const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      required: [true, 'Workspace ID is required'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'RequestedBy User ID is required'],
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'file',
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Revision description is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

revisionSchema.index({ workspaceId: 1 });

const revisionModel = mongoose.model('revision', revisionSchema);
module.exports = revisionModel;
