const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic User Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    username:{
      type: String,
      required: [true,"Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^(?!_)(?!.*\.\.)[a-z0-9_](?:[a-z0-9_.]*[a-z0-9_])?$/,
        "Please enter a valid username",
      ]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    // Email verification status
    verified: {
      type: Boolean,
      default: false,
    },

    // User role
    role: {
      type: String,
      required: [true, "User role is required"],
      enum: {
        values: ["creator", "editor"],
        message: "Role must be either creator or editor",
      },
    },

    // Profile Information
    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    location: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    // Editor Information
    skills: {
      type: [String],
      default: [],
    },

    software: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
    },

    // Portfolio
    portfolio: [
      {
        title: {
          type: String,
          required: [true, "Portfolio title is required"],
          trim: true,
        },

        description: {
          type: String,
          default: "",
        },

        projectUrl: {
          type: String,
          required: [true, "Portfolio project URL is required"],
        },

        thumbnailUrl: {
          type: String,
          default: "",
        },
      },
    ],

    // Editor Reputation
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ software: 1 });
userSchema.index({ rating: -1 });

// Create Model
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;