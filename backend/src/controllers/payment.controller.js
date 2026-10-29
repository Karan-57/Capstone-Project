const paymentService = require('../services/payment.service');

/**
 * 1. Create a Razorpay Order for purchasing platform credits
 * @route POST /api/payment/create-order
 * @access Private
 */
async function createOrder(req, res) {
  try {
    const { amount } = req.body;
    const result = await paymentService.createOrderService({
      amount,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error in createOrder:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to create payment order',
      error: err.message,
    });
  }
}

/**
 * 2. Verify Razorpay Payment Signature and Credit Wallet
 * @route POST /api/payment/verify
 * @access Private
 */
async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    const result = await paymentService.verifyPaymentService({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: result.message || `Successfully added ₹${amount} to your wallet!`,
      walletBalance: result.walletBalance,
      transaction: result.transaction,
    });
  } catch (err) {
    console.error('Error in verifyPayment:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Payment verification failed',
      error: err.message,
    });
  }
}

/**
 * 3. Instant Demo Sandbox Top-Up
 * @route POST /api/payment/demo-topup
 * @access Private
 */
async function demoTopup(req, res) {
  try {
    const { amount } = req.body;
    const result = await paymentService.demoTopupService({
      amount,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: `Demo top-up complete! Added ${amount || 1000} credits.`,
      walletBalance: result.walletBalance,
      transaction: result.transaction,
    });
  } catch (err) {
    console.error('Error in demoTopup:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to process demo top-up',
      error: err.message,
    });
  }
}

/**
 * 4. Get Current User Wallet Balance, PIN Status & Transaction Ledger
 * @route GET /api/payment/wallet
 * @access Private
 */
async function getWalletDetails(req, res) {
  try {
    const details = await paymentService.getWalletDetailsService(req.user._id, req.user.role);
    return res.status(200).json({
      success: true,
      ...details,
    });
  } catch (err) {
    console.error('Error in getWalletDetails:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to fetch wallet details',
      error: err.message,
    });
  }
}

/**
 * 5. Set or Update 4-Digit Transaction Security PIN
 * @route POST /api/payment/set-pin
 * @access Private
 */
async function setTransactionPin(req, res) {
  try {
    const { pin } = req.body;
    await paymentService.setTransactionPinService(req.user._id, pin);

    return res.status(200).json({
      success: true,
      message: 'Transaction Security PIN configured successfully',
    });
  } catch (err) {
    console.error('Error in setTransactionPin:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to configure security PIN',
      error: err.message,
    });
  }
}

/**
 * 6. Verify Transaction Security PIN
 * @route POST /api/payment/verify-pin
 * @access Private
 */
async function verifyTransactionPin(req, res) {
  try {
    const { pin } = req.body;
    const isValid = await paymentService.verifyTransactionPinService(req.user._id, pin);

    return res.status(200).json({
      success: true,
      valid: Boolean(isValid),
      message: isValid ? 'PIN verified successfully' : 'Invalid Security PIN',
    });
  } catch (err) {
    console.error('Error in verifyTransactionPin:', err);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'PIN verification failed',
      error: err.message,
    });
  }
}

/**
 * 7. Lock Milestone Funds in Escrow
 * @route POST /api/payment/escrow/lock
 * @access Private (Creator)
 */
async function lockEscrow(req, res) {
  try {
    const {
      amount,
      pin,
      workspaceId,
      projectId,
      milestoneTitle,
      hiringId,
      milestoneId,
      milestoneIndex,
      idempotencyKey: bodyIdemp,
    } = req.body;

    const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || bodyIdemp;

    const result = await paymentService.lockEscrowService({
      creatorId: req.user._id,
      amount,
      pin,
      workspaceId,
      projectId,
      milestoneTitle,
      hiringId,
      milestoneId,
      milestoneIndex,
      idempotencyKey,
    });

    return res.status(200).json({
      success: true,
      message: result.message || `₹${Number(amount).toLocaleString('en-IN')} locked in escrow safely`,
      walletBalance: result.walletBalance,
      transaction: result.transaction,
      milestone: result.milestone,
      project: result.project,
    });
  } catch (err) {
    console.error('Error in lockEscrow:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to lock escrow',
      error: err.message,
    });
  }
}

/**
 * 8. Release Milestone Funds from Escrow to Editor
 * @route POST /api/payment/escrow/release
 * @access Private (Creator)
 */
async function releaseEscrow(req, res) {
  try {
    const {
      amount,
      editorId,
      workspaceId,
      projectId,
      milestoneTitle,
      pin,
      hiringId,
      milestoneId,
      milestoneIndex,
      idempotencyKey: bodyIdemp,
    } = req.body;

    const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || bodyIdemp;

    const result = await paymentService.releaseEscrowService({
      creatorId: req.user._id,
      editorId,
      amount,
      pin,
      workspaceId,
      projectId,
      milestoneTitle,
      hiringId,
      milestoneId,
      milestoneIndex,
      idempotencyKey,
    });

    return res.status(200).json({
      success: true,
      message: result.message || `₹${Number(amount).toLocaleString('en-IN')} successfully released to editor`,
      transaction: result.transaction,
      milestone: result.milestone,
    });
  } catch (err) {
    console.error('Error in releaseEscrow:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to release escrow',
      error: err.message,
    });
  }
}

/**
 * Helper: Internal server-side escrow release (e.g. called from approveDeliveryController)
 */
async function releaseEscrowInternal(params) {
  return await paymentService.releaseEscrowInternalService(params);
}

/**
 * 9. Withdrawal / Payout Request (Creator or Editor withdraws unspent/cleared credits)
 * @route POST /api/payment/withdraw
 * @access Private
 */
async function withdrawCredits(req, res) {
  try {
    const {
      amount,
      pin,
      upiId,
      bankAccountNumber,
      ifscCode,
      idempotencyKey: bodyIdemp,
    } = req.body;

    const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || bodyIdemp;

    const result = await paymentService.withdrawCreditsService({
      userId: req.user._id,
      amount,
      pin,
      upiId,
      bankAccountNumber,
      ifscCode,
      idempotencyKey,
    });

    return res.status(200).json({
      success: true,
      message: result.isDuplicate
        ? 'Withdrawal request already processed previously'
        : `Withdrawal of ₹${Number(amount).toLocaleString('en-IN')} processed successfully!`,
      utrNumber: result.utrNumber,
      walletBalance: result.walletBalance,
      transaction: result.transaction,
    });
  } catch (err) {
    console.error('Error in withdrawCredits:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to process withdrawal',
      error: err.message,
    });
  }
}

/**
 * 10. Refund Milestone Escrow back to Creator Wallet (0 deliveries submitted)
 * @route POST /api/payment/escrow/refund
 * @access Private (Creator)
 */
async function refundEscrow(req, res) {
  try {
    const {
      milestoneId,
      projectId,
      hiringId,
      workspaceId,
      amount,
      pin,
      milestoneIndex,
      milestoneTitle,
      idempotencyKey: bodyIdemp,
    } = req.body;

    const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || bodyIdemp;

    const result = await paymentService.refundEscrowService({
      creatorId: req.user._id,
      milestoneId,
      projectId,
      hiringId,
      workspaceId,
      amount,
      pin,
      milestoneIndex,
      milestoneTitle,
      idempotencyKey,
    });

    return res.status(200).json({
      success: true,
      message: result.message || `₹${Number(amount || result.milestone?.amount || 0).toLocaleString('en-IN')} refunded from escrow back to your wallet.`,
      walletBalance: result.walletBalance,
      milestone: result.milestone,
      transaction: result.transaction,
    });
  } catch (err) {
    console.error('Error in refundEscrow:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Failed to refund escrow',
      error: err.message,
    });
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
  refundEscrow,
  withdrawCredits,
};
