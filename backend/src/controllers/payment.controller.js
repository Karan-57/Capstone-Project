const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const userModel = require('../model/user.model');
const transactionModel = require('../model/transaction.model');
const ledgerModel = require('../model/ledger.model');
const { createNotification } = require('../services/notification.service');

// Initialize Razorpay client with keys from environment
const key_id = process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const key_secret = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('[Razorpay] Client initialization warning:', err.message);
}

/**
 * 1. Create a Razorpay Order for purchasing platform credits
 * Note: 1 Currency = 1 Rupee (1 Credit = ₹1 INR)
 */
async function createOrder(req, res) {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 10) {
      return res.status(400).json({
        message: 'Minimum top-up amount is ₹10 (10 credits)',
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt: `collabo_rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
      notes: {
        userId: req.user._id.toString(),
        credits: numericAmount.toString(),
        purpose: 'Platform Wallet Credit Top-up',
      },
    };

    if (!razorpayInstance) {
      return res.status(500).json({
        message: 'Razorpay payment gateway is not initialized on server',
      });
    }

    const order = await razorpayInstance.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: numericAmount,
      currency: order.currency,
      keyId: key_id,
    });
  } catch (err) {
    console.error('Error in createOrder:', err);
    return res.status(500).json({
      message: 'Failed to create payment order',
      error: err.message,
    });
  }
}

/**
 * 2. Verify Razorpay Payment Signature and Credit Wallet
 * Implements double-entry ledger record from Bank-Transactions architecture
 */
async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    const creditsToAdd = Number(amount);
    if (!creditsToAdd || creditsToAdd <= 0) {
      return res.status(400).json({ message: 'Invalid credit amount' });
    }

    // Cryptographic HMAC SHA-256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        message: 'Invalid payment signature. Transaction verification failed.',
      });
    }

    // Prevent duplicate credit processing via idempotency key
    const idempotencyKey = `rzp_${razorpay_payment_id}`;
    const existingTxn = await transactionModel.findOne({ idempotencyKey });
    if (existingTxn) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and credited previously',
        transaction: existingTxn,
      });
    }

    // Atomic update to user's walletBalance (1 Credit = 1 Rupee)
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: creditsToAdd } },
      { new: true }
    );

    // Create immutable Transaction record
    const transaction = await transactionModel.create({
      fromUser: null, // System deposit
      toUser: req.user._id,
      amount: creditsToAdd,
      type: 'TOPUP',
      status: 'SUCCESS',
      gateway: 'RAZORPAY_TEST',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      idempotencyKey,
      description: `Razorpay Test Top-Up: +${creditsToAdd.toLocaleString('en-IN')} Credits`,
    });

    // Create immutable Ledger entry (double-entry audit)
    await ledgerModel.create({
      user: req.user._id,
      amount: creditsToAdd,
      type: 'CREDIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Razorpay Deposit (${creditsToAdd} credits)`,
    });

    return res.status(200).json({
      success: true,
      message: `Payment verified! Added ${creditsToAdd} credits to your account.`,
      walletBalance: updatedUser.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error('Error in verifyPayment:', err);
    return res.status(500).json({
      message: 'Failed to verify payment',
      error: err.message,
    });
  }
}

/**
 * 3. Instant Demo Faucet (1-Click Test Top-Up for Presentations)
 */
async function demoTopup(req, res) {
  try {
    const { amount } = req.body;
    const creditsToAdd = Number(amount) || 5000;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: creditsToAdd } },
      { new: true }
    );

    const transaction = await transactionModel.create({
      fromUser: null,
      toUser: req.user._id,
      amount: creditsToAdd,
      type: 'TOPUP',
      status: 'SUCCESS',
      gateway: 'DEMO_FAUCET',
      description: `Demo Faucet Deposit: +${creditsToAdd.toLocaleString('en-IN')} Credits`,
    });

    await ledgerModel.create({
      user: req.user._id,
      amount: creditsToAdd,
      type: 'CREDIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Demo Faucet (+${creditsToAdd} credits)`,
    });

    return res.status(200).json({
      success: true,
      message: `Demo top-up complete! Added ${creditsToAdd} credits.`,
      walletBalance: updatedUser.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error('Error in demoTopup:', err);
    return res.status(500).json({
      message: 'Failed to process demo top-up',
      error: err.message,
    });
  }
}

/**
 * 4. Get Current User Wallet Balance, PIN Status & Transaction Ledger
 */
async function getWalletDetails(req, res) {
  try {
    const user = await userModel.findById(req.user._id).select('walletBalance hasTransactionPin');

    const transactions = await transactionModel
      .find({
        $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
      })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      walletBalance: user?.walletBalance || 0,
      hasTransactionPin: Boolean(user?.hasTransactionPin),
      transactions,
    });
  } catch (err) {
    console.error('Error in getWalletDetails:', err);
    return res.status(500).json({
      message: 'Failed to fetch wallet details',
      error: err.message,
    });
  }
}

/**
 * 5. Set or Update 4-Digit Transaction Security PIN
 */
async function setTransactionPin(req, res) {
  try {
    const { pin } = req.body;

    if (!pin || String(pin).length !== 4 || !/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        message: 'Security PIN must be exactly 4 numeric digits',
      });
    }

    const hashedPin = await bcrypt.hash(String(pin), 10);

    await userModel.findByIdAndUpdate(req.user._id, {
      transactionPin: hashedPin,
      hasTransactionPin: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction Security PIN configured successfully',
    });
  } catch (err) {
    console.error('Error in setTransactionPin:', err);
    return res.status(500).json({
      message: 'Failed to set security PIN',
      error: err.message,
    });
  }
}

/**
 * 6. Verify 4-Digit Transaction Security PIN
 */
async function verifyTransactionPin(req, res) {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN is required' });
    }

    const user = await userModel.findById(req.user._id).select('+transactionPin');

    // If no custom PIN is set yet, default demo PIN is 1234
    if (!user.transactionPin) {
      const isDefault = String(pin) === '1234';
      return res.status(200).json({
        valid: isDefault,
        message: isDefault ? 'PIN verified' : 'Incorrect PIN (Default is 1234)',
      });
    }

    const isMatch = await bcrypt.compare(String(pin), user.transactionPin);

    return res.status(200).json({
      valid: isMatch,
      message: isMatch ? 'PIN verified' : 'Incorrect Security PIN',
    });
  } catch (err) {
    console.error('Error in verifyTransactionPin:', err);
    return res.status(500).json({
      message: 'Failed to verify PIN',
      error: err.message,
    });
  }
}

/**
 * 7. Lock Milestone Funds in Escrow (Creator deposits funds for a project or milestone)
 */
async function lockEscrow(req, res) {
  try {
    const { amount, workspaceId, projectId, milestoneTitle, pin } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valid escrow amount is required' });
    }

    const user = await userModel.findById(req.user._id).select('+transactionPin');
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Verify PIN if set or if provided
    if (user.transactionPin || pin) {
      const pinToCheck = String(pin || '');
      const isMatch = user.transactionPin
        ? await bcrypt.compare(pinToCheck, user.transactionPin)
        : pinToCheck === '1234';

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Transaction Security PIN' });
      }
    }

    if (user.walletBalance < numericAmount) {
      return res.status(400).json({
        message: `Insufficient wallet balance. You have ₹${user.walletBalance.toLocaleString('en-IN')}, but ₹${numericAmount.toLocaleString('en-IN')} is needed. Please top up your wallet.`,
        walletBalance: user.walletBalance,
      });
    }

    // Atomically debit creator
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -numericAmount } },
      { new: true }
    );

    const title = milestoneTitle || 'Milestone Escrow Deposit';
    const transaction = await transactionModel.create({
      fromUser: req.user._id,
      toUser: null, // Held safely in escrow
      amount: numericAmount,
      type: 'ESCROW_LOCK',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: workspaceId || null,
      milestoneTitle: title,
      description: `Escrow Locked: ₹${numericAmount.toLocaleString('en-IN')} for "${title}"`,
    });

    await ledgerModel.create({
      user: req.user._id,
      amount: numericAmount,
      type: 'DEBIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Escrow Lock for "${title}"`,
    });

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount.toLocaleString('en-IN')} locked in escrow safely`,
      walletBalance: updatedUser.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error('Error in lockEscrow:', err);
    return res.status(500).json({ message: 'Failed to lock escrow', error: err.message });
  }
}

/**
 * 8. Release Milestone Funds from Escrow to Editor
 */
async function releaseEscrow(req, res) {
  try {
    const { amount, editorId, workspaceId, projectId, milestoneTitle, pin } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valid release amount is required' });
    }

    if (!editorId) {
      return res.status(400).json({ message: 'Recipient editorId is required' });
    }

    const editor = await userModel.findById(editorId);
    if (!editor) {
      return res.status(404).json({ message: 'Editor account not found' });
    }

    // Verify PIN if creator provided pin
    if (pin) {
      const creator = await userModel.findById(req.user._id).select('+transactionPin');
      const pinToCheck = String(pin);
      const isMatch = creator?.transactionPin
        ? await bcrypt.compare(pinToCheck, creator.transactionPin)
        : pinToCheck === '1234';

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Transaction Security PIN' });
      }
    }

    // Atomically credit editor
    const updatedEditor = await userModel.findByIdAndUpdate(
      editorId,
      { $inc: { walletBalance: numericAmount } },
      { new: true }
    );

    const title = milestoneTitle || 'Approved Milestone Cut';
    const transaction = await transactionModel.create({
      fromUser: req.user._id,
      toUser: editorId,
      amount: numericAmount,
      type: 'ESCROW_RELEASE',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: workspaceId || null,
      milestoneTitle: title,
      description: `Escrow Released: ₹${numericAmount.toLocaleString('en-IN')} for "${title}"`,
    });

    await ledgerModel.create({
      user: editorId,
      amount: numericAmount,
      type: 'CREDIT',
      transaction: transaction._id,
      balanceAfter: updatedEditor.walletBalance,
      description: `Escrow Payout for "${title}"`,
    });

    // Notify editor
    try {
      await createNotification({
        recipient: editorId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received!',
        message: `₹${numericAmount.toLocaleString('en-IN')} has been released to your wallet for "${title}".`,
        project: projectId || null,
        relatedUser: req.user._id,
      });
    } catch (e) {
      console.warn('[Notification] Release notification error:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount.toLocaleString('en-IN')} successfully released to editor`,
      transaction,
    });
  } catch (err) {
    console.error('Error in releaseEscrow:', err);
    return res.status(500).json({ message: 'Failed to release escrow', error: err.message });
  }
}

/**
 * Helper: Internal server-side escrow release (e.g. called from approveDeliveryController)
 */
async function releaseEscrowInternal({ creatorId, editorId, amount, workspaceId, projectId, milestoneTitle }) {
  try {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !editorId) return null;

    // Guard against duplicate release for the same workspace milestone
    const existing = await transactionModel.findOne({
      referenceWorkspaceId: workspaceId,
      type: 'ESCROW_RELEASE',
      milestoneTitle: milestoneTitle || 'Final Delivery Cut Approval',
    });
    if (existing) return existing;

    const updatedEditor = await userModel.findByIdAndUpdate(
      editorId,
      { $inc: { walletBalance: numericAmount } },
      { new: true }
    );

    const title = milestoneTitle || 'Final Delivery Cut Approval';
    const transaction = await transactionModel.create({
      fromUser: creatorId || null,
      toUser: editorId,
      amount: numericAmount,
      type: 'ESCROW_RELEASE',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: workspaceId || null,
      milestoneTitle: title,
      description: `Escrow Released: ₹${numericAmount.toLocaleString('en-IN')} for "${title}"`,
    });

    await ledgerModel.create({
      user: editorId,
      amount: numericAmount,
      type: 'CREDIT',
      transaction: transaction._id,
      balanceAfter: updatedEditor?.walletBalance || numericAmount,
      description: `Delivery Approval Escrow Payout (${title})`,
    });

    try {
      await createNotification({
        recipient: editorId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received!',
        message: `₹${numericAmount.toLocaleString('en-IN')} has been credited to your wallet for approved delivery cut.`,
        project: projectId || null,
        relatedUser: creatorId || null,
      });
    } catch (e) {
      console.warn('[Notification] Delivery release error:', e.message);
    }

    return transaction;
  } catch (err) {
    console.error('[payment.controller] Error in releaseEscrowInternal:', err);
    return null;
  }
}

/**
 * 9. Simulated Withdrawal / Payout Request (Editor withdraws earnings to UPI/Bank)
 */
async function withdrawCredits(req, res) {
  try {
    const { amount, pin, upiId, bankAccountNumber, ifscCode } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 50) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹50 (50 credits)' });
    }

    const user = await userModel.findById(req.user._id).select('+transactionPin');
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.walletBalance < numericAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${user.walletBalance.toLocaleString('en-IN')}`,
        walletBalance: user.walletBalance,
      });
    }

    // Verify PIN
    const pinToCheck = String(pin || '');
    const isMatch = user.transactionPin
      ? await bcrypt.compare(pinToCheck, user.transactionPin)
      : pinToCheck === '1234';

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Transaction Security PIN' });
    }

    // Atomically debit editor wallet
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -numericAmount } },
      { new: true }
    );

    const utr = `UTR_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const destinationDesc = upiId
      ? `UPI: ${upiId}`
      : `Bank: ••••${String(bankAccountNumber || '8888').slice(-4)} (${ifscCode || 'HDFC0001'})`;

    const transaction = await transactionModel.create({
      fromUser: req.user._id,
      toUser: null,
      amount: numericAmount,
      type: 'WITHDRAWAL',
      status: 'SUCCESS',
      gateway: 'SIMULATED_PAYOUT',
      description: `Simulated Payout: ₹${numericAmount.toLocaleString('en-IN')} to ${destinationDesc} (${utr})`,
    });

    await ledgerModel.create({
      user: req.user._id,
      amount: numericAmount,
      type: 'DEBIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Payout Withdrawal (${utr})`,
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal of ₹${numericAmount.toLocaleString('en-IN')} processed successfully!`,
      utrNumber: utr,
      walletBalance: updatedUser.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error('Error in withdrawCredits:', err);
    return res.status(500).json({ message: 'Failed to process withdrawal', error: err.message });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  demoTopup,
  getWalletDetails,
  setTransactionPin,
  verifyTransactionPin,
  lockEscrow,
  releaseEscrow,
  releaseEscrowInternal,
  withdrawCredits,
};
