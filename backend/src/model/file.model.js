const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      required: [true, 'Workspace ID is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'UploadedBy User ID is required'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      default: 'unknown',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // The main URL (ImageKit URL for direct uploads, or master link for external)
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    // Distinguishes in-app previews vs external master storage
    storageType: {
      type: String,
      enum: ['in-app', 'external-link'],
      default: 'in-app',
    },
    // Original master link (Google Drive, Dropbox, YouTube, etc.) if external
    externalUrl: {
      type: String,
      trim: true,
      default: null,
    },
    // Provider name (imagekit, gdrive, dropbox, youtube, vimeo, other)
    provider: {
      type: String,
      enum: ['imagekit', 'gdrive', 'dropbox', 'youtube', 'vimeo', 'wetransfer', 'other'],
      default: 'imagekit',
    },
    // ImageKit fileId (useful for programmatic deletion to reclaim 3 GB quota)
    imagekitFileId: {
      type: String,
      default: null,
    },
    // Thumbnail or poster URL (extracted from Drive/YouTube, or uploaded poster)
    thumbnailUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['raw-footage', 'asset', 'draft', 'final-cut', 'audio', 'document', 'other'],
      default: 'asset',
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

fileSchema.index({ workspaceId: 1, createdAt: -1 });
fileSchema.index({ storageType: 1 });
fileSchema.index({ category: 1 });

const fileModel = mongoose.model('file', fileSchema);
module.exports = fileModel;
