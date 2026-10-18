const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true,"email is required"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true,"user is required"]
        },
        otpHash: {
            type: String,
            required: [true,"otp hash is required"]
        }
    },
    {
        timestamps: true
    }
);

otpSchema.index({ email: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 15 });

const otpModel = mongoose.model("otp", otpSchema);
module.exports = otpModel;