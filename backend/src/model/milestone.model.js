const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    hiringId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Hiring ID is required'],
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      default: null,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Creator ID is required'],
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
      index: true,
    },
    index: {
      type: Number,
      required: [true, 'Milestone index is required'],
      min: 1,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Milestone amount is required'],
      min: 0,
    },
    percent: {
      type: Number,
      default: 0.33,
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'funded', 'completed'],
      default: 'pending',
      index: true,
    },
    submittedUrl: {
      type: String,
      default: '',
      trim: true,
    },
    submissionNotes: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    deliveries: [
      {
        version: { type: Number, default: 1 },
        submittedUrl: { type: String, required: true, trim: true },
        notes: { type: String, default: '', trim: true },
        submittedAt: { type: Date, default: Date.now },
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
        status: {
          type: String,
          enum: ['pending_review', 'revision_requested', 'approved'],
          default: 'pending_review',
        },
        revisionRequest: {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          requestedAt: { type: Date, default: null },
          requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
        },
      },
    ],
    fundedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    escrowLockTxn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transaction',
      default: null,
    },
    escrowReleaseTxn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transaction',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of a milestone step per role hiring
milestoneSchema.index({ projectId: 1, hiringId: 1, index: 1 }, { unique: true });

const milestoneModel = mongoose.model('milestone', milestoneSchema);

module.exports = milestoneModel;
