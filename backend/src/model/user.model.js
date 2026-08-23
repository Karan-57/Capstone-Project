const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
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


    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);


userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ software: 1 });
userSchema.index({ rating: -1 });


const userModel = mongoose.model("User", userSchema);

module.exports = userModel;