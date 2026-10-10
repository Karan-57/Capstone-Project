const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Ledger entry must be associated with a user'],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, 'Ledger amount is required'],
      immutable: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transaction',
      required: true,
      immutable: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      immutable: true,
    },
    description: {
      type: String,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

ledgerSchema.index({ user: 1, createdAt: -1 });

const ledgerModel = mongoose.model('ledger', ledgerSchema);
module.exports = ledgerModel;
