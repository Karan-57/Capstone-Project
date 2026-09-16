const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'UploadedBy User ID is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    category: {
      type: String,
      enum: ['raw-footage', 'asset', 'draft', 'final-cut', 'other'],
      default: 'raw-footage',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ workspaceId: 1 });

const fileModel = mongoose.model('File', fileSchema);
module.exports = fileModel;
