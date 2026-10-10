const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: [true, 'Project ID is required'],
      unique: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Creator ID is required'],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Editor ID is required'],
    },
    // Multi-member workspace support
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
        projectRole: {
          type: String,
          enum: ['creator', 'lead_editor', 'editor', 'assistant_editor', 'sound_engineer', 'colorist', 'collaborator'],
          default: 'editor',
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'removed'],
          default: 'active',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    status: {
      type: String,
      enum: ['active', 'in_review', 'completed', 'cancelled'],
      default: 'active',
    },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ creatorId: 1 });
workspaceSchema.index({ editorId: 1 });
workspaceSchema.index({ 'members.user': 1 });

// Ensure creator and editor are in members array if empty for backward compatibility
workspaceSchema.pre('save', function (next) {
  if (this.isNew || !this.members || this.members.length === 0) {
    if (!this.members) this.members = [];
    const memberUserIds = new Set(this.members.map(m => m.user?.toString()));

    if (this.creatorId && !memberUserIds.has(this.creatorId.toString())) {
      this.members.push({
        user: this.creatorId,
        projectRole: 'creator',
        status: 'active'
      });
      memberUserIds.add(this.creatorId.toString());
    }

    if (this.editorId && !memberUserIds.has(this.editorId.toString())) {
      this.members.push({
        user: this.editorId,
        projectRole: 'lead_editor',
        status: 'active'
      });
      memberUserIds.add(this.editorId.toString());
    }
  }

  if (typeof next === 'function') {
    next();
  }
});

const workspaceModel = mongoose.model('workspace', workspaceSchema);
module.exports = workspaceModel;
