const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: [true, 'Project ID is required'],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
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
      enum: ['pending', 'negotiating', 'counter_offered', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    // Negotiation & Counter-Offer Tracking
    currentOffer: {
      type: Number,
      default: null,
    },
    lastOfferBy: {
      type: String,
      enum: ['creator', 'freelancer', null],
      default: null,
    },
    counterNote: {
      type: String,
      default: '',
    },
    negotiationHistory: [
      {
        offeredBy: {
          type: String,
          enum: ['creator', 'freelancer'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    matchScore: {
      type: Number,
      default: 0,
    },
    matchDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    roleId: {
      type: String,
      default: 'video_editor',
    },
    roleTitle: {
      type: String,
      default: 'Video Editor',
    },
    hiringId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ projectId: 1, editorId: 1, roleId: 1 });
applicationSchema.index({ editorId: 1 });
applicationSchema.index({ projectId: 1, status: 1 });
applicationSchema.index({ editorId: 1, status: 1 });

const applicationModel = mongoose.model('application', applicationSchema);
module.exports = applicationModel;
