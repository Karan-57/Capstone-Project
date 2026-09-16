const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Editor ID is required'],
    },
    proposal: {
      type: String,
      required: [true, 'Proposal is required'],
    },
    bidAmount: {
      type: Number,
      required: [true, 'Bid amount is required'],
    },
    estimatedDeliveryDays: {
      type: Number,
      required: [true, 'Estimated delivery days is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    matchDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ projectId: 1, editorId: 1 }, { unique: true });
applicationSchema.index({ editorId: 1 });

const applicationModel = mongoose.model('Application', applicationSchema);
module.exports = applicationModel;
