const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    editingStyle: {
      type: String,
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    requiredSoftware: {
      type: [String],
      default: [],
    },
    videoDuration: {
      type: Number,
      default: 0,
    },
    complexity: {
      type: String,
      default: 'Intermediate',
    },
    budget: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deadline: {
      type: Date,
    },
    referenceLinks: {
      type: [String],
      default: [],
    },
    sampleFiles: {
      type: [String],
      default: [],
    },
    additionalInstructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    selectedEditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ creatorId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });

const projectModel = mongoose.model('Project', projectSchema);
module.exports = projectModel;
