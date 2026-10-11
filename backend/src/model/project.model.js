const mongoose = require('mongoose');

const roleMilestoneSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    index: { type: Number, default: 1 },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    percent: { type: Number, default: 0.33 },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'funded', 'submitted', 'approved'],
      default: 'pending',
    },
    submittedUrl: { type: String, default: '' },
    submissionNotes: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);

const hiringSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      required: [true, 'Role ID is required'],
    },
    roleTitle: {
      type: String,
      required: [true, 'Role title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    requiredTools: {
      type: [String],
      default: [],
    },
    budget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    firstDeadline: {
      type: Date,
    },
    references: {
      type: [String],
      default: [],
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    milestones: {
      type: [roleMilestoneSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'hired', 'completed', 'cancelled'],
      default: 'open',
    },
    hiredFreelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    hiredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
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
    expectedVideoDuration: {
      type: String,
      default: '',
    },
    projectDuration: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    complexity: {
      type: String,
      default: 'Intermediate',
    },
    totalBudget: {
      type: Number,
      default: 0,
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
    referenceImages: {
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
      enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    selectedEditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    // Multi-role hirings attached to this project
    hirings: {
      type: [hiringSchema],
      default: [],
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

const projectModel = mongoose.model('project', projectSchema);
module.exports = projectModel;
