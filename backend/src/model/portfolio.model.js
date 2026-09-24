const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        editor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        skills: [
            {
                type: String,
                trim: true
            }
        ],

        software: [
            {
                type: String,
                trim: true
            }
        ],

        experience: {
            type: Number,
            min: 0,
            default: 0
        },

        experienceUnit: {
            type: String,
            enum: ["months", "years"],
            default: "years"
        },

        specialization: [
            {
                type: String,
                trim: true
            }
        ],

        portfolioItems: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true
                },

                description: {
                    type: String,
                    trim: true
                },

                projectType: {
                    type: String,
                    trim: true
                },

                thumbnailUrl: {
                    type: String
                },

                videoUrl: {
                    type: String
                },

                projectUrl: {
                    type: String
                },

                skillsUsed: [
                    {
                        type: String,
                        trim: true
                    }
                ]
            }
        ],

        socialLinks: {
            instagram: {
                type: String,
                trim: true
            },

            youtube: {
                type: String,
                trim: true
            },

            linkedin: {
                type: String,
                trim: true
            },

            website: {
                type: String,
                trim: true
            }
        },

        hourlyRate: {
            type: Number,
            min: 0
        },

        availability: {
            type: String,
            enum: ["available", "busy", "unavailable"],
            default: "available"
        },

        isPublic: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

portfolioSchema.index({ editor: 1 });
portfolioSchema.index({ skills: 1 });
portfolioSchema.index({ software: 1 });

const portfolioModel = mongoose.model("portfolio", portfolioSchema);
module.exports = portfolioModel;
