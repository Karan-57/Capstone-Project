const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer ID is required'],
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee ID is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is required'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ project: 1 });
reviewSchema.index({ revieweeId: 1 });

const reviewModel = mongoose.model('Review', reviewSchema);
module.exports = reviewModel;
