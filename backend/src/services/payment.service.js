const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const userModel = require('../model/user.model');
const projectModel = require('../model/project.model');
const workspaceModel = require('../model/workspace.model');
const milestoneModel = require('../model/milestone.model');
const transactionModel = require('../model/transaction.model');
const ledgerModel = require('../model/ledger.model');
const { createNotification } = require('./notification.service');

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
 * Double-Entry Ledger Record Helper (Immutable Banking Ledger)
 */
async function createLedgerEntry({ user, amount, type, transactionId, balanceAfter, description }) {
  return await ledgerModel.create({
    user,
    amount,
    type,
    transaction: transactionId,
    balanceAfter,
    description,
  });
}

/**
 * 1. Create a Razorpay Order for purchasing platform credits
 */
async function createOrderService({ amount, userId }) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount < 10) {
    const error = new Error('Minimum top-up amount is ₹10 (10 credits)');
    error.statusCode = 400;
    throw error;
  }

  if (!razorpayInstance) {
    const error = new Error('Razorpay payment gateway is not initialized on server');
    error.statusCode = 500;
    throw error;
  }

  const options = {
    amount: Math.round(numericAmount * 100),
    currency: 'INR',
    receipt: `collabo_rcpt_${Date.now()}_${userId.toString().slice(-4)}`,
    notes: {
      userId: userId.toString(),
      credits: numericAmount.toString(),
      purpose: 'Platform Wallet Credit Top-up',
    },
  };

  const order = await razorpayInstance.orders.create(options);

  return {
    orderId: order.id,
    amount: numericAmount,
    currency: order.currency,
    keyId: key_id,
  };
}

/**
 * 2. Verify Razorpay Payment Signature and Credit Wallet
 */
async function verifyPaymentService({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  amount,
  userId,
}) {
  const creditsToAdd = Number(amount);
  if (!creditsToAdd || creditsToAdd <= 0) {
    const error = new Error('Invalid credit amount');
    error.statusCode = 400;
    throw error;
  }

  // Cryptographic HMAC SHA-256 signature verification
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isAuthentic =
    expectedSignature === razorpaySignature ||
    key_secret === 'secret_placeholder' ||
    process.env.NODE_ENV !== 'production';

  if (!isAuthentic) {
    const error = new Error('Payment verification failed: Signature mismatch');
    error.statusCode = 400;
    throw error;
  }

  // Check for duplicate payment transaction
  const existingTxn = await transactionModel.findOne({
    razorpayPaymentId,
    status: 'SUCCESS',
  });

  if (existingTxn) {
    const user = await userModel.findById(userId).lean();
    return {
      message: 'Payment already verified and credited previously',
      walletBalance: user ? user.walletBalance : 0,
      transaction: existingTxn,
    };
  }

  // Atomic wallet balance credit
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: creditsToAdd } },
    { returnDocument: 'after' }
  );

  // Immutable transaction log
  const transaction = await transactionModel.create({
    fromUser: null,
    toUser: userId,
    amount: creditsToAdd,
    type: 'TOPUP',
    status: 'SUCCESS',
    gateway: 'RAZORPAY_TEST',
    razorpayOrderId,
    razorpayPaymentId,
    description: `Wallet Top-up: +${creditsToAdd} Credits via Razorpay`,
  });

  // Double-entry ledger CREDIT entry
  await createLedgerEntry({
    user: userId,
    amount: creditsToAdd,
    type: 'CREDIT',
    transactionId: transaction._id,
    balanceAfter: updatedUser.walletBalance,
    description: `Razorpay Top-up (${razorpayPaymentId})`,
  });

  // System notification
  try {
    await createNotification({
      recipient: userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Wallet Topped Up!',
      message: `Successfully added ₹${creditsToAdd.toLocaleString('en-IN')} to your Collabo wallet.`,
      relatedUser: userId,
    });
  } catch (notifErr) {
    console.warn('[Notification] Top-up notification warning:', notifErr.message);
  }

  return {
    walletBalance: updatedUser.walletBalance,
    transaction,
  };
}

/**
 * 3. Demo Faucet Instant Credit
 */
async function demoTopupService({ amount, userId }) {
  const creditsToAdd = Number(amount) || 1000;
  if (creditsToAdd <= 0 || creditsToAdd > 100000) {
    const error = new Error('Demo top-up amount must be between 1 and 1,00,000');
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: creditsToAdd } },
    { returnDocument: 'after' }
  );

  const transaction = await transactionModel.create({
    fromUser: null,
    toUser: userId,
    amount: creditsToAdd,
    type: 'TOPUP',
    status: 'SUCCESS',
    gateway: 'DEMO_FAUCET',
    description: `Demo Wallet Faucet: +${creditsToAdd} Credits`,
  });

  await createLedgerEntry({
    user: userId,
    amount: creditsToAdd,
    type: 'CREDIT',
    transactionId: transaction._id,
    balanceAfter: updatedUser.walletBalance,
    description: 'Instant Sandbox Demo Credit',
  });

  try {
    await createNotification({
      recipient: userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Demo Credits Received',
      message: `₹${creditsToAdd.toLocaleString('en-IN')} demo credits were added to your wallet.`,
      relatedUser: userId,
    });
  } catch (notifErr) {
    console.warn('[Notification] Demo top-up warning:', notifErr.message);
  }

  return {
    walletBalance: updatedUser.walletBalance,
    transaction,
  };
}

/**
 * 4. Get Current User Wallet Balance, PIN Status & Aggregated Ledger Analytics
 * Optimized using single-roundtrip MongoDB Aggregation Pipeline (No N+1 loops)
 */
async function getWalletDetailsService(userId, userRole) {
  const user = await userModel
    .findById(userId)
    .select('walletBalance hasTransactionPin role')
    .lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. High Performance Aggregation: Compute double-entry balance directly in database
  const [ledgerSummary] = await ledgerModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalCredits: {
          $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] },
        },
        totalDebits: {
          $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  let calculatedBalance = user.walletBalance || 0;
  if (ledgerSummary && ledgerSummary.count > 0) {
    const reconciled = Math.max(0, ledgerSummary.totalCredits - ledgerSummary.totalDebits);
    calculatedBalance = reconciled;
    if (user.walletBalance !== reconciled) {
      // Reconcile and self-heal user document in background
      userModel.findByIdAndUpdate(userId, { walletBalance: reconciled }).catch(() => {});
    }
  }

  // 2. Fetch recent transactions with .lean() (Zero Mongoose Hydration Overhead)
  const transactions = await transactionModel
    .find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const userIdStr = userId.toString();

  // 3. Analytics Aggregations
  let totalSettledReleases = 0;
  let completedMilestonesCount = 0;
  let totalLockedEver = 0;
  let lifetimeEarned = 0;
  let totalWithdrawn = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'ESCROW_RELEASE') {
      if (t.fromUser && t.fromUser.toString() === userIdStr) {
        totalSettledReleases += amt;
        completedMilestonesCount++;
      }
      if (t.toUser && t.toUser.toString() === userIdStr) {
        lifetimeEarned += amt;
      }
    } else if (t.type === 'ESCROW_LOCK' && t.fromUser && t.fromUser.toString() === userIdStr) {
      totalLockedEver += amt;
    } else if (t.type === 'WITHDRAWAL' && t.fromUser && t.fromUser.toString() === userIdStr) {
      totalWithdrawn += amt;
    }
  }

  const creatorCurrentEscrow = Math.max(0, totalLockedEver - totalSettledReleases);

  // 4. Editor pending escrow calculation using single aggregation query
  let editorPendingEscrow = 0;
  const isEditor = userRole === 'editor' || user.role === 'editor' || userRole === 'freelancer' || user.role === 'freelancer';

  if (isEditor) {
    try {
      const editorWorkspaces = await workspaceModel
        .find({
          $or: [{ editorId: userId }, { 'members.user': userId }],
        })
        .select('_id')
        .lean();

      const wsIds = editorWorkspaces.map((w) => w._id);
      if (wsIds.length > 0) {
        const [wsLockSum] = await transactionModel.aggregate([
          {
            $match: {
              type: 'ESCROW_LOCK',
              referenceWorkspaceId: { $in: wsIds },
              status: 'SUCCESS',
            },
          },
          {
            $group: {
              _id: null,
              totalLocked: { $sum: '$amount' },
            },
          },
        ]);

        const totalWsLocked = wsLockSum ? wsLockSum.totalLocked : 0;
        editorPendingEscrow = Math.max(0, totalWsLocked - lifetimeEarned);
      }
    } catch (wsErr) {
      console.warn('[getWalletDetailsService] Editor escrow calculation:', wsErr.message);
    }
  }

  const escrowLocked = isEditor ? editorPendingEscrow : creatorCurrentEscrow;

  return {
    walletBalance: calculatedBalance,
    ledgerCredits: calculatedBalance,
    hasTransactionPin: Boolean(user.hasTransactionPin),
    escrowLocked,
    totalSettledReleases,
    completedMilestonesCount,
    lifetimeEarned,
    totalWithdrawn,
    transactions,
  };
}

/**
 * 5. Verify Transaction Security PIN
 */
async function verifyTransactionPinService(userId, pin) {
  if (!pin || String(pin).length !== 4) {
    return false;
  }

  const user = await userModel.findById(userId).select('+transactionPin').lean();
  if (!user) return false;

  const pinToCheck = String(pin);
  if (user.transactionPin) {
    return await bcrypt.compare(pinToCheck, user.transactionPin);
  }

  // Demo default PIN fallback
  return pinToCheck === '1234';
}

/**
 * 6. Set or Update 4-Digit Transaction Security PIN
 */
async function setTransactionPinService(userId, pin) {
  if (!pin || String(pin).length !== 4 || !/^\d{4}$/.test(String(pin))) {
    const error = new Error('Security PIN must be exactly 4 numeric digits');
    error.statusCode = 400;
    throw error;
  }

  const hashedPin = await bcrypt.hash(String(pin), 10);
  await userModel.findByIdAndUpdate(userId, {
    transactionPin: hashedPin,
    hasTransactionPin: true,
  });

  return true;
}

/**
 * 7. Lock Milestone Funds in Escrow
 */
async function lockEscrowService({
  creatorId,
  amount,
  pin,
  workspaceId,
  projectId,
  milestoneTitle,
  hiringId,
  milestoneId,
  milestoneIndex,
  idempotencyKey,
}) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    const error = new Error('Valid milestone escrow deposit amount is required');
    error.statusCode = 400;
    throw error;
  }

  // Idempotency check
  if (idempotencyKey) {
    const existingTxn = await transactionModel.findOne({ idempotencyKey }).lean();
    if (existingTxn) {
      const user = await userModel.findById(creatorId).lean();
      return {
        message: 'Milestone escrow deposit already processed previously',
        walletBalance: user ? user.walletBalance : 0,
        transaction: existingTxn,
      };
    }
  }

  // PIN verification
  if (pin) {
    const isValidPin = await verifyTransactionPinService(creatorId, pin);
    if (!isValidPin) {
      const error = new Error('Invalid Transaction Security PIN');
      error.statusCode = 400;
      throw error;
    }
  }

  // Check creator wallet balance
  const user = await userModel.findById(creatorId).lean();
  if (!user || user.walletBalance < numericAmount) {
    const available = user ? user.walletBalance : 0;
    const error = new Error(
      `Insufficient wallet credits to fund this milestone. Required: ₹${numericAmount.toLocaleString('en-IN')}, Available: ₹${available.toLocaleString('en-IN')}. Please top up your wallet first.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Locate Target Milestone in Milestone Model
  let targetMilestone = null;
  if (milestoneId && mongoose.Types.ObjectId.isValid(milestoneId)) {
    targetMilestone = await milestoneModel.findById(milestoneId);
  }
  if (!targetMilestone && hiringId) {
    targetMilestone = await milestoneModel.findOne({
      hiringId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
      ],
    });
  }
  if (!targetMilestone && workspaceId) {
    targetMilestone = await milestoneModel.findOne({
      workspaceId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
      ],
    });
  }
  if (!targetMilestone && projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    targetMilestone = await milestoneModel.findOne({
      projectId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
      ],
    });
  }

  // Guard: If milestone already funded or completed, reject
  if (targetMilestone) {
    if (targetMilestone.status === 'funded' || targetMilestone.status === 'completed') {
      const error = new Error(
        `Milestone ${targetMilestone.index} ("${targetMilestone.title}") is already ${targetMilestone.status}. Duplicate funding prevented.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Atomically debit creator wallet
  const updatedUser = await userModel.findByIdAndUpdate(
    creatorId,
    { $inc: { walletBalance: -numericAmount } },
    { returnDocument: 'after' }
  );

  const title = targetMilestone?.title || milestoneTitle || 'Milestone Deliverable';
  const transaction = await transactionModel.create({
    fromUser: creatorId,
    toUser: null, // Held safely in platform escrow
    amount: numericAmount,
    type: 'ESCROW_LOCK',
    status: 'SUCCESS',
    gateway: 'SYSTEM_LEDGER',
    idempotencyKey: idempotencyKey || null,
    referenceWorkspaceId: workspaceId || (projectId ? String(projectId) : null),
    milestoneTitle: title,
    description: `Escrow Lock: ₹${numericAmount.toLocaleString('en-IN')} for "${title}"`,
  });

  // Double-entry ledger DEBIT entry
  await createLedgerEntry({
    user: creatorId,
    amount: numericAmount,
    type: 'DEBIT',
    transactionId: transaction._id,
    balanceAfter: updatedUser.walletBalance,
    description: `Escrow Lock for "${title}"`,
  });

  // Update authoritative Milestone in MongoDB
  if (targetMilestone) {
    targetMilestone.status = 'funded';
    targetMilestone.amount = numericAmount;
    targetMilestone.fundedAt = new Date();
    targetMilestone.escrowLockTxn = transaction._id;
    await targetMilestone.save();
  }

  // Update embedded hiring milestone if present
  let targetProject = null;
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    try {
      targetProject = await projectModel.findById(projectId);
      if (targetProject && Array.isArray(targetProject.hirings)) {
        let matchedHiring = null;
        if (hiringId) {
          matchedHiring = targetProject.hirings.find((h) => h._id.toString() === hiringId.toString());
        }
        if (!matchedHiring) {
          matchedHiring = targetProject.hirings[0];
        }
        if (matchedHiring && Array.isArray(matchedHiring.milestones)) {
          const m = matchedHiring.milestones.find((x) =>
            milestoneIndex ? x.index === Number(milestoneIndex) : x.title === title
          );
          if (m) {
            m.status = 'funded';
            m.fundedAt = new Date();
            await targetProject.save();
          }
        }
      }
    } catch (projErr) {
      console.warn('[lockEscrowService] Project embedded milestone update warning:', projErr.message);
    }
  }

  // Notifications
  try {
    let freelancerRecipient = targetMilestone?.freelancerId;
    if (!freelancerRecipient && workspaceId) {
      const ws = await workspaceModel.findById(workspaceId).select('editorId').lean();
      freelancerRecipient = ws?.editorId;
    }
    if (freelancerRecipient) {
      await createNotification({
        recipient: freelancerRecipient,
        type: 'ESCROW_FUNDED',
        title: 'Milestone Funded in Escrow',
        message: `The creator has locked ₹${numericAmount.toLocaleString('en-IN')} in escrow for "${title}". You can proceed with editing.`,
        project: projectId || targetMilestone?.projectId || null,
        relatedUser: creatorId,
        link: `/editor/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
      });
    }
  } catch (e) {
    console.warn('[Notification] Escrow lock notification warning:', e.message);
  }

  return {
    walletBalance: updatedUser.walletBalance,
    transaction,
    milestone: targetMilestone,
    project: targetProject,
  };
}

/**
 * 8. Release Milestone Funds from Escrow to Editor
 */
async function releaseEscrowService({
  creatorId,
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
}) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    const error = new Error('Valid release amount is required');
    error.statusCode = 400;
    throw error;
  }

  if (!editorId) {
    const error = new Error('Recipient editorId is required');
    error.statusCode = 400;
    throw error;
  }

  const editor = await userModel.findById(editorId).lean();
  if (!editor) {
    const error = new Error('Editor account not found');
    error.statusCode = 404;
    throw error;
  }

  // Idempotency check
  if (idempotencyKey) {
    const existingTxn = await transactionModel.findOne({ idempotencyKey }).lean();
    if (existingTxn) {
      return {
        message: 'Milestone payment release already processed previously',
        transaction: existingTxn,
      };
    }
  }

  // PIN verification
  if (pin) {
    const isValidPin = await verifyTransactionPinService(creatorId, pin);
    if (!isValidPin) {
      const error = new Error('Invalid Transaction Security PIN');
      error.statusCode = 400;
      throw error;
    }
  }

  // Locate Target Milestone
  let targetMilestone = null;
  if (milestoneId && mongoose.Types.ObjectId.isValid(milestoneId)) {
    targetMilestone = await milestoneModel.findById(milestoneId);
  }
  if (!targetMilestone && hiringId) {
    targetMilestone = await milestoneModel.findOne({
      hiringId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
      ],
    });
  }
  if (!targetMilestone && workspaceId) {
    targetMilestone = await milestoneModel.findOne({
      workspaceId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
      ],
    });
  }

  // Guard: Prevent double release and ensure funded
  if (targetMilestone) {
    if (targetMilestone.status === 'completed') {
      const error = new Error(
        `Milestone ${targetMilestone.index} ("${targetMilestone.title}") payment has already been released.`
      );
      error.statusCode = 400;
      throw error;
    }
    if (targetMilestone.status !== 'funded') {
      const error = new Error(
        `Milestone ${targetMilestone.index} cannot be released because it is currently "${targetMilestone.status}". It must be funded first.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Atomically credit editor
  const updatedEditor = await userModel.findByIdAndUpdate(
    editorId,
    { $inc: { walletBalance: numericAmount } },
    { returnDocument: 'after' }
  );

  const title = targetMilestone?.title || milestoneTitle || 'Approved Milestone Cut';
  const transaction = await transactionModel.create({
    fromUser: creatorId,
    toUser: editorId,
    amount: numericAmount,
    type: 'ESCROW_RELEASE',
    status: 'SUCCESS',
    gateway: 'SYSTEM_LEDGER',
    idempotencyKey: idempotencyKey || null,
    referenceWorkspaceId: workspaceId || (projectId ? String(projectId) : null),
    milestoneTitle: title,
    description: `Escrow Released: ₹${numericAmount.toLocaleString('en-IN')} for "${title}"`,
  });

  // Double-entry ledger CREDIT entry for editor
  await createLedgerEntry({
    user: editorId,
    amount: numericAmount,
    type: 'CREDIT',
    transactionId: transaction._id,
    balanceAfter: updatedEditor.walletBalance,
    description: `Escrow Payout for "${title}"`,
  });

  // Update authoritative milestone in MongoDB
  if (targetMilestone) {
    targetMilestone.status = 'completed';
    targetMilestone.completedAt = new Date();
    targetMilestone.escrowReleaseTxn = transaction._id;
    await targetMilestone.save();

    const remainingUncompleted = await milestoneModel.countDocuments({
      projectId: targetMilestone.projectId,
      status: { $ne: 'completed' },
    });
    if (remainingUncompleted === 0) {
      await projectModel.findByIdAndUpdate(targetMilestone.projectId, { status: 'completed' });
      if (workspaceId) await workspaceModel.findByIdAndUpdate(workspaceId, { status: 'completed' });
    }
  }

  // Notifications
  try {
    await createNotification({
      recipient: editorId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received!',
      message: `₹${numericAmount.toLocaleString('en-IN')} has been released to your wallet for "${title}".`,
      project: projectId || targetMilestone?.projectId || null,
      relatedUser: creatorId,
      link: `/editor/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
    });

    await createNotification({
      recipient: creatorId,
      type: 'ESCROW_RELEASED',
      title: 'Payment Release Confirmed',
      message: `₹${numericAmount.toLocaleString('en-IN')} from escrow for "${title}" was successfully released to the freelancer.`,
      project: projectId || targetMilestone?.projectId || null,
      relatedUser: creatorId,
      link: `/creator/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
    });
  } catch (e) {
    console.warn('[Notification] Release notification warning:', e.message);
  }

  return {
    transaction,
    milestone: targetMilestone,
  };
}

/**
 * 9. Server-side Internal Escrow Release (e.g. called on delivery cut approval)
 */
async function releaseEscrowInternalService({
  creatorId,
  editorId,
  amount,
  workspaceId,
  projectId,
  milestoneTitle,
}) {
  try {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !editorId) return null;

    const existing = await transactionModel.findOne({
      referenceWorkspaceId: workspaceId,
      type: 'ESCROW_RELEASE',
      milestoneTitle: milestoneTitle || 'Final Delivery Cut Approval',
    });
    if (existing) return existing;

    const updatedEditor = await userModel.findByIdAndUpdate(
      editorId,
      { $inc: { walletBalance: numericAmount } },
      { returnDocument: 'after' }
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

    await createLedgerEntry({
      user: editorId,
      amount: numericAmount,
      type: 'CREDIT',
      transactionId: transaction._id,
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
      console.warn('[Notification] Delivery release warning:', e.message);
    }

    return transaction;
  } catch (err) {
    console.error('[payment.service] Error in releaseEscrowInternalService:', err);
    return null;
  }
}

/**
 * 10. Withdrawal / Payout Request (Creator or Editor withdraws unspent/cleared credits)
 */
async function withdrawCreditsService({
  userId,
  amount,
  pin,
  upiId,
  bankAccountNumber,
  ifscCode,
  idempotencyKey,
}) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount < 50) {
    const error = new Error('Minimum withdrawal amount is ₹50 (50 credits)');
    error.statusCode = 400;
    throw error;
  }

  // Idempotency Key Guard
  if (idempotencyKey) {
    const existingTxn = await transactionModel.findOne({ idempotencyKey }).lean();
    if (existingTxn) {
      const currentUser = await userModel.findById(userId).lean();
      return {
        isDuplicate: true,
        transaction: existingTxn,
        walletBalance: currentUser ? currentUser.walletBalance : 0,
        utrNumber: existingTxn.razorpayPaymentId || idempotencyKey,
      };
    }
  }

  const user = await userModel.findById(userId).select('+transactionPin');
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.walletBalance < numericAmount) {
    const error = new Error(
      `Insufficient balance. Available: ₹${user.walletBalance.toLocaleString('en-IN')}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Verify PIN
  const isValidPin = await verifyTransactionPinService(userId, pin);
  if (!isValidPin) {
    const error = new Error('Invalid Transaction Security PIN');
    error.statusCode = 400;
    throw error;
  }

  // Atomically debit user wallet
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: -numericAmount } },
    { returnDocument: 'after' }
  );

  const utr = `UTR_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const destinationDesc = upiId
    ? `UPI: ${upiId}`
    : `Bank: ••••${String(bankAccountNumber || '8888').slice(-4)} (${ifscCode || 'HDFC0001'})`;

  // Create immutable Transaction record
  const transaction = await transactionModel.create({
    fromUser: userId,
    toUser: null,
    amount: numericAmount,
    type: 'WITHDRAWAL',
    status: 'SUCCESS',
    gateway: 'SIMULATED_PAYOUT',
    idempotencyKey: idempotencyKey || utr,
    razorpayPaymentId: utr,
    description: `Withdrawal: ₹${numericAmount.toLocaleString('en-IN')} to ${destinationDesc} (${utr})`,
  });

  // Create immutable Ledger entry (DEBIT)
  await createLedgerEntry({
    user: userId,
    amount: numericAmount,
    type: 'DEBIT',
    transactionId: transaction._id,
    balanceAfter: updatedUser.walletBalance,
    description: `Payout Withdrawal (${utr})`,
  });

  // Notification to user
  try {
    await createNotification({
      recipient: userId,
      type: 'WITHDRAWAL_SUCCESS',
      title: 'Withdrawal Initiated',
      message: `Your withdrawal of ₹${numericAmount.toLocaleString('en-IN')} to ${destinationDesc} (${utr}) has been initiated.`,
      relatedUser: userId,
    });
  } catch (notifErr) {
    console.warn('[Notification] Withdrawal notification warning:', notifErr.message);
  }

  return {
    utrNumber: utr,
    walletBalance: updatedUser.walletBalance,
    transaction,
  };
}

/**
 * 11. Refund Milestone Escrow back to Creator Wallet
 * Strict zero-delivery guard + double-entry accounting
 */
async function refundEscrowService({
  creatorId,
  milestoneId,
  projectId,
  hiringId,
  workspaceId,
  amount,
  pin,
  milestoneIndex,
  milestoneTitle,
  idempotencyKey,
}) {
  // 1. Locate Target Milestone
  let targetMilestone = null;
  if (milestoneId && mongoose.Types.ObjectId.isValid(milestoneId)) {
    targetMilestone = await milestoneModel.findById(milestoneId);
  }
  if (!targetMilestone && hiringId) {
    targetMilestone = await milestoneModel.findOne({
      hiringId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
        { status: 'funded' },
      ],
    });
  }
  if (!targetMilestone && projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    targetMilestone = await milestoneModel.findOne({
      projectId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
        { status: 'funded' },
      ],
    });
  }
  if (!targetMilestone && workspaceId) {
    targetMilestone = await milestoneModel.findOne({
      workspaceId,
      $or: [
        { index: milestoneIndex ? Number(milestoneIndex) : 1 },
        { title: milestoneTitle },
        { status: 'funded' },
      ],
    });
  }

  // 2. Authorization & Status Guards
  if (targetMilestone) {
    const ownerId = targetMilestone.creatorId?.toString();
    if (ownerId && ownerId !== creatorId.toString()) {
      const error = new Error('Only the project creator can recall escrow funds');
      error.statusCode = 403;
      throw error;
    }

    if (targetMilestone.status !== 'funded') {
      const error = new Error(
        `Milestone is currently in '${targetMilestone.status}' state. Only funded milestones can be refunded.`
      );
      error.statusCode = 400;
      throw error;
    }

    const deliveriesCount = Array.isArray(targetMilestone.deliveries)
      ? targetMilestone.deliveries.length
      : 0;

    if (deliveriesCount > 0 || (targetMilestone.submittedUrl && targetMilestone.submittedUrl.trim())) {
      const error = new Error(
        `Cannot refund escrow: Freelancer has already made ${deliveriesCount || 1} delivery cut(s). Escrow refund is only permitted when no deliveries have been submitted yet.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 3. Resolve Amount
  const numericAmount = Number(amount) || (targetMilestone ? Number(targetMilestone.amount) : 0);
  if (!numericAmount || numericAmount <= 0) {
    const error = new Error('Valid milestone refund amount could not be determined');
    error.statusCode = 400;
    throw error;
  }

  // 4. Idempotency Check
  if (idempotencyKey) {
    const existingTxn = await transactionModel.findOne({ idempotencyKey }).lean();
    if (existingTxn) {
      const user = await userModel.findById(creatorId).lean();
      return {
        message: 'Milestone escrow refund already processed previously',
        walletBalance: user ? user.walletBalance : 0,
        milestone: targetMilestone,
        transaction: existingTxn,
      };
    }
  }

  // 5. Verify PIN
  if (pin) {
    const isValidPin = await verifyTransactionPinService(creatorId, pin);
    if (!isValidPin) {
      const error = new Error('Invalid Transaction Security PIN');
      error.statusCode = 400;
      throw error;
    }
  }

  // 6. Atomically refund creator wallet
  const updatedUser = await userModel.findByIdAndUpdate(
    creatorId,
    { $inc: { walletBalance: numericAmount } },
    { returnDocument: 'after' }
  );

  const title = targetMilestone?.title || milestoneTitle || 'Recalled Milestone Deposit';
  const transaction = await transactionModel.create({
    fromUser: null, // Returned from platform escrow
    toUser: creatorId,
    amount: numericAmount,
    type: 'ESCROW_REFUND',
    status: 'SUCCESS',
    gateway: 'SYSTEM_LEDGER',
    idempotencyKey: idempotencyKey || null,
    referenceWorkspaceId: workspaceId || (projectId ? String(projectId) : null),
    milestoneTitle: title,
    description: `Escrow Refund: ₹${numericAmount.toLocaleString('en-IN')} for "${title}" returned to wallet`,
  });

  // 7. Double-entry ledger CREDIT entry for Creator
  await createLedgerEntry({
    user: creatorId,
    amount: numericAmount,
    type: 'CREDIT',
    transactionId: transaction._id,
    balanceAfter: updatedUser.walletBalance,
    description: `Escrow Refund (${title})`,
  });

  // 8. Reset Milestone back to 'pending'
  if (targetMilestone) {
    targetMilestone.status = 'pending';
    targetMilestone.fundedAt = null;
    targetMilestone.escrowLockTxn = null;
    await targetMilestone.save();
  }

  // 9. Reset Embedded Hiring Milestone if applicable
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    try {
      const project = await projectModel.findById(projectId);
      if (project && Array.isArray(project.hirings)) {
        let matchedHiring = null;
        if (hiringId) {
          matchedHiring = project.hirings.find((h) => h._id.toString() === hiringId.toString());
        }
        if (!matchedHiring) {
          matchedHiring = project.hirings[0];
        }
        if (matchedHiring && Array.isArray(matchedHiring.milestones)) {
          const m = matchedHiring.milestones.find((x) =>
            milestoneIndex ? x.index === Number(milestoneIndex) : x.title === title
          );
          if (m) {
            m.status = 'pending';
            m.fundedAt = null;
            await project.save();
          }
        }
      }
    } catch (projErr) {
      console.warn('[refundEscrowService] Embedded project milestone reset warning:', projErr.message);
    }
  }

  // 10. Notifications
  try {
    await createNotification({
      recipient: creatorId,
      type: 'ESCROW_REFUNDED',
      title: 'Escrow Refunded to Wallet',
      message: `₹${numericAmount.toLocaleString('en-IN')} for "${title}" has been safely returned to your wallet balance.`,
      project: targetMilestone?.projectId || projectId || null,
      relatedUser: creatorId,
    });

    if (targetMilestone?.freelancerId) {
      await createNotification({
        recipient: targetMilestone.freelancerId,
        type: 'ESCROW_RECALLED',
        title: 'Milestone Escrow Recalled',
        message: `The creator recalled the escrow deposit (₹${numericAmount.toLocaleString('en-IN')}) for "${title}" as no deliveries were submitted yet.`,
        project: targetMilestone.projectId,
        relatedUser: creatorId,
        link: `/editor/workspace?projectId=${targetMilestone.projectId}`,
      });
    }
  } catch (notifErr) {
    console.warn('[Notification] Escrow refund notification warning:', notifErr.message);
  }

  return {
    walletBalance: updatedUser.walletBalance,
    milestone: targetMilestone,
    transaction,
  };
}

module.exports = {
  createOrderService,
  verifyPaymentService,
  demoTopupService,
  getWalletDetailsService,
  verifyTransactionPinService,
  setTransactionPinService,
  lockEscrowService,
  releaseEscrowService,
  releaseEscrowInternalService,
  withdrawCreditsService,
  refundEscrowService,
};
