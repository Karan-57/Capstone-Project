const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: [true, 'Project ID is required'],
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Reviewer ID is required'],
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Reviewee ID is required'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      required: [true, 'Rating is required'],
    },
    reviewText: {
      type: String,
      default: '',
      trim: true,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    // Editor metrics (out of 10)
    speed: {
      type: Number,
      min: [0, 'Speed must be between 0 and 10'],
      max: [10, 'Speed must be between 0 and 10'],
    },
    quality: {
      type: Number,
      min: [0, 'Quality must be between 0 and 10'],
      max: [10, 'Quality must be between 0 and 10'],
    },
    // Common & Creator metrics (out of 10)
    behaviour: {
      type: Number,
      min: [0, 'Behaviour must be between 0 and 10'],
      max: [10, 'Behaviour must be between 0 and 10'],
    },
    responseTime: {
      type: Number,
      min: [0, 'Response time must be between 0 and 10'],
      max: [10, 'Response time must be between 0 and 10'],
    },
    boundaryRespect: {
      type: Number,
      min: [0, 'Boundary respect must be between 0 and 10'],
      max: [10, 'Boundary respect must be between 0 and 10'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ projectId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);
module.exports = reviewModel;
