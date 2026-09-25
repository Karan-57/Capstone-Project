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

    // Reputation & Aggregated Review Metrics
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },

    responseTime: {
      type: Number,
      default: 0,
      min: [0, "Response time cannot be negative"],
      max: [10, "Response time cannot exceed 10"],
    },

    behaviour: {
      type: Number,
      default: 0,
      min: [0, "Behaviour cannot be negative"],
      max: [10, "Behaviour cannot exceed 10"],
    },

    speed: {
      type: Number,
      default: 0,
      min: [0, "Speed cannot be negative"],
      max: [10, "Speed cannot exceed 10"],
    },

    quality: {
      type: Number,
      default: 0,
      min: [0, "Quality cannot be negative"],
      max: [10, "Quality cannot exceed 10"],
    },

    boundaryRespect: {
      type: Number,
      default: 0,
      min: [0, "Boundary respect cannot be negative"],
      max: [10, "Boundary respect cannot exceed 10"],
    },

    boundary: {
      type: Number,
      default: 0,
      min: [0, "Boundary cannot be negative"],
      max: [10, "Boundary cannot exceed 10"],
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

// Create Model
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;