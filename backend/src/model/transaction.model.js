const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      default: null, // null for SYSTEM deposits (e.g., top-up)
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      default: null, // null for ESCROW locks (held in platform safe)
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Amount must be at least 1 credit'],
    },
    type: {
      type: String,
      enum: ['TOPUP', 'ESCROW_LOCK', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'WITHDRAWAL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    gateway: {
      type: String,
      enum: ['RAZORPAY_TEST', 'DEMO_FAUCET', 'SYSTEM_LEDGER', 'SIMULATED_PAYOUT'],
      default: 'SYSTEM_LEDGER',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    referenceWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      default: null,
    },
    milestoneTitle: {
      type: String,
      default: null,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ createdAt: -1 });

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel;
