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
const { createNotification } = require('../services/notification.service');
const { getOrInitializeMilestones } = require('./milestone.controller');

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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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
    const user = await userModel.findById(req.user._id).select('walletBalance hasTransactionPin role');

    // 0. Double-entry ledger calculation (Sum CREDIT - Sum DEBIT from immutable ledgerModel):
    const userLedgers = await ledgerModel.find({ user: req.user._id });
    let ledgerCredits = null;
    let totalLedgerCredits = 0;
    let totalLedgerDebits = 0;

    if (userLedgers && userLedgers.length > 0) {
      totalLedgerCredits = userLedgers
        .filter((e) => e.type === 'CREDIT')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      totalLedgerDebits = userLedgers
        .filter((e) => e.type === 'DEBIT')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      ledgerCredits = Math.max(0, totalLedgerCredits - totalLedgerDebits);

      // Reconcile and self-heal user.walletBalance with immutable ledger
      if (user && user.walletBalance !== ledgerCredits) {
        await userModel.findByIdAndUpdate(req.user._id, { walletBalance: ledgerCredits });
        user.walletBalance = ledgerCredits;
      }
    }

    const calculatedBalance = ledgerCredits !== null ? ledgerCredits : (user?.walletBalance || 0);

    const transactions = await transactionModel
      .find({
        $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
      })
      .sort({ createdAt: -1 })
      .limit(100);

    // 1. Creator-specific calculations:
    const creatorReleases = transactions.filter(
      (t) => t.type === 'ESCROW_RELEASE' && t.fromUser && t.fromUser.toString() === req.user._id.toString()
    );
    const totalSettledReleases = creatorReleases.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const completedMilestonesCount = creatorReleases.length;

    const creatorLocks = transactions.filter(
      (t) => t.type === 'ESCROW_LOCK' && t.fromUser && t.fromUser.toString() === req.user._id.toString()
    );
    const totalLockedEver = creatorLocks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const creatorCurrentEscrow = Math.max(0, totalLockedEver - totalSettledReleases);

    // 2. Editor-specific calculations (Real Ledger Analytics):
    const editorReleases = transactions.filter(
      (t) => t.type === 'ESCROW_RELEASE' && t.toUser && t.toUser.toString() === req.user._id.toString()
    );
    const lifetimeEarned = editorReleases.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const editorWithdrawals = transactions.filter(
      (t) => t.type === 'WITHDRAWAL' && t.fromUser && t.fromUser.toString() === req.user._id.toString()
    );
    const totalWithdrawn = editorWithdrawals.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Editor escrow: find active workspaces where this user is assigned
    let editorPendingEscrow = 0;
    try {
      const editorWorkspaces = await workspaceModel.find({
        $or: [{ editorId: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const wsIds = editorWorkspaces.map(w => w._id);
      if (wsIds.length > 0) {
        const wsLocks = await transactionModel.find({
          type: 'ESCROW_LOCK',
          referenceWorkspaceId: { $in: wsIds },
          status: 'SUCCESS'
        });
        const totalWsLocked = wsLocks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalWsReleased = transactions
          .filter(t => t.type === 'ESCROW_RELEASE' && t.toUser?.toString() === req.user._id.toString())
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        editorPendingEscrow = Math.max(0, totalWsLocked - totalWsReleased);
      }
    } catch (wsErr) {
      console.warn('[getWalletDetails] Editor escrow calculation:', wsErr.message);
    }

    const isEditor = (req.user.role === 'editor' || user?.role === 'editor' || req.user.role === 'freelancer' || user?.role === 'freelancer');
    const escrowLocked = isEditor ? editorPendingEscrow : creatorCurrentEscrow;

    return res.status(200).json({
      success: true,
      walletBalance: calculatedBalance,
      ledgerCredits: calculatedBalance,
      hasTransactionPin: Boolean(user?.hasTransactionPin),
      escrowLocked,
      totalSettledReleases,
      completedMilestonesCount,
      lifetimeEarned,
      totalWithdrawn,
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
 * Enforces sequential funding: Milestone[n-1] MUST be completed before Milestone[n] can be funded.
 * Single source of truth: Updates separate Milestone document in MongoDB.
 */
async function lockEscrow(req, res) {
  try {
    const {
      amount,
      workspaceId,
      projectId,
      milestoneTitle,
      pin,
      hiringId,
      milestoneId,
      milestoneIndex,
    } = req.body;
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

    // 1. Resolve Project and Workspace Document
    let resolvedProjectId = projectId;
    let workspaceDoc = null;
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      workspaceDoc = await workspaceModel.findById(workspaceId);
      if (workspaceDoc && workspaceDoc.projectId && !resolvedProjectId) {
        resolvedProjectId = workspaceDoc.projectId;
      }
    }

    let targetProject = null;
    let targetHiring = null;

    if (resolvedProjectId && mongoose.Types.ObjectId.isValid(resolvedProjectId)) {
      targetProject = await projectModel.findById(resolvedProjectId);
    }

    if (targetProject && Array.isArray(targetProject.hirings)) {
      if (hiringId) {
        targetHiring = targetProject.hirings.find(
          (h) => h._id.toString() === String(hiringId)
        );
      }
      if (!targetHiring && targetProject.hirings.length > 0) {
        targetHiring = targetProject.hirings[0];
      }
    }

    // 2. Locate or Auto-Initialize Target Milestone in Milestone Model
    let targetMilestone = null;
    if (milestoneId && mongoose.Types.ObjectId.isValid(milestoneId)) {
      targetMilestone = await milestoneModel.findById(milestoneId);
    }

    if (!targetMilestone && targetProject && targetHiring) {
      const allMilestones = await getOrInitializeMilestones({
        projectId: targetProject._id,
        hiringId: targetHiring._id,
        workspaceId: workspaceId || workspaceDoc?._id,
        creatorId: targetProject.creatorId,
        freelancerId: targetHiring.hiredFreelancerId,
        roleId: targetHiring.roleId,
        roleTitle: targetHiring.roleTitle,
        budget: targetHiring.budget || targetProject.totalBudget,
        deadline: targetHiring.firstDeadline,
      });

      targetMilestone = allMilestones.find(
        (m) =>
          (milestoneIndex != null && m.index === Number(milestoneIndex)) ||
          (milestoneTitle && m.title?.toLowerCase().trim() === String(milestoneTitle).toLowerCase().trim())
      );

      if (!targetMilestone && allMilestones.length > 0) {
        targetMilestone = allMilestones[0];
      }
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

    // 3. Prevent Duplicate Funding via Milestone Status
    if (targetMilestone) {
      if (targetMilestone.status === 'funded') {
        return res.status(400).json({
          message: `Milestone ${targetMilestone.index} ("${targetMilestone.title}") is already funded in escrow. Repeated funding is blocked.`,
        });
      }
      if (targetMilestone.status === 'completed') {
        return res.status(400).json({
          message: `Milestone ${targetMilestone.index} ("${targetMilestone.title}") is already completed and released.`,
        });
      }

      // 4. Sequential Funding Rule: Milestone[n-1] MUST be completed!
      if (targetMilestone.index > 1) {
        const prevIndex = targetMilestone.index - 1;
        const prevMilestone = await milestoneModel.findOne({
          projectId: targetMilestone.projectId,
          hiringId: targetMilestone.hiringId,
          index: prevIndex,
        });

        if (!prevMilestone || prevMilestone.status !== 'completed') {
          return res.status(400).json({
            message: `Previous milestone (Milestone ${prevIndex}) must be completed and released before Milestone ${targetMilestone.index} can be funded in escrow.`,
            requiredPreviousMilestoneIndex: prevIndex,
            previousMilestoneStatus: prevMilestone?.status || 'pending',
          });
        }
      }
    }

    // 5. Budget Validations
    if (targetProject) {
      const projectTotalBudget = Number(
        targetProject.totalBudget ||
        targetProject.budget?.amount ||
        targetProject.budget?.max ||
        (typeof targetProject.budget === 'number' ? targetProject.budget : 0)
      );

      if (projectTotalBudget > 0 && numericAmount > projectTotalBudget) {
        return res.status(400).json({
          message: `Payment amount (₹${numericAmount.toLocaleString('en-IN')}) exceeds total project budget (₹${projectTotalBudget.toLocaleString('en-IN')}).`,
        });
      }

      const roleBudgetVal = req.body.roleBudget || targetHiring?.budget;
      if (roleBudgetVal) {
        const numRoleBudget = Number(roleBudgetVal);
        if (numRoleBudget > 0 && numericAmount > numRoleBudget) {
          return res.status(400).json({
            message: `Payment amount (₹${numericAmount.toLocaleString('en-IN')}) exceeds this role's budget (₹${numRoleBudget.toLocaleString('en-IN')}).`,
          });
        }
      }
    }

    // 6. Atomically Debit Creator Wallet
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -numericAmount } },
      { returnDocument: 'after' }
    );

    const title = targetMilestone?.title || milestoneTitle || 'Milestone Escrow Deposit';
    const transaction = await transactionModel.create({
      fromUser: req.user._id,
      toUser: null, // Held safely in escrow
      amount: numericAmount,
      type: 'ESCROW_LOCK',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: workspaceId || (resolvedProjectId ? String(resolvedProjectId) : null),
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

    // 7. Update Authoritative Milestone in MongoDB
    if (targetMilestone) {
      targetMilestone.status = 'funded';
      targetMilestone.fundedAt = new Date();
      targetMilestone.escrowLockTxn = transaction._id;
      if (workspaceId && !targetMilestone.workspaceId) {
        targetMilestone.workspaceId = workspaceId;
      }
      await targetMilestone.save();

      // 1. Notify Freelancer
      if (targetMilestone.freelancerId) {
        createNotification({
          recipient: targetMilestone.freelancerId,
          type: 'MILESTONE_FUNDED',
          title: 'Milestone Funded in Escrow!',
          message: `₹${numericAmount.toLocaleString('en-IN')} has been locked in escrow for "${targetMilestone.title}". You can now start working and submit your cut!`,
          project: targetMilestone.projectId,
          relatedUser: req.user._id,
          link: `/editor/workspace?projectId=${targetMilestone.projectId}&milestoneId=${targetMilestone._id}`,
          actionUrl: `/editor/workspace?projectId=${targetMilestone.projectId}&milestoneId=${targetMilestone._id}`,
        }).catch((err) => console.error('[Notification] Freelancer fund notice:', err.message));
      }

      // 2. Notify Creator of confirmation
      createNotification({
        recipient: req.user._id,
        type: 'ESCROW_DEPOSITED',
        title: 'Milestone Escrow Deposit Confirmed',
        message: `₹${numericAmount.toLocaleString('en-IN')} is safely locked in escrow for "${targetMilestone.title}". Freelancer can now submit their cut.`,
        project: targetMilestone.projectId,
        relatedUser: req.user._id,
        link: `/creator/workspace?projectId=${targetMilestone.projectId}&milestoneId=${targetMilestone._id}`,
        actionUrl: `/creator/workspace?projectId=${targetMilestone.projectId}&milestoneId=${targetMilestone._id}`,
      }).catch((err) => console.error('[Notification] Creator fund record notice:', err.message));
    }

    // 8. Update Project and Workspace Status
    if (targetProject) {
      if (targetProject.status === 'assigned' || targetProject.status === 'open') {
        targetProject.status = 'in_progress';
      }
      await targetProject.save();
    }
    if (workspaceDoc) {
      try {
        if (workspaceDoc.status === 'pending' || workspaceDoc.status === 'assigned') {
          workspaceDoc.status = 'active';
          await workspaceDoc.save();
        }
      } catch (wsErr) {
        console.warn('[lockEscrow] Workspace status sync:', wsErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount.toLocaleString('en-IN')} locked in escrow safely`,
      walletBalance: updatedUser.walletBalance,
      transaction,
      milestone: targetMilestone,
      project: targetProject,
    });
  } catch (err) {
    console.error('Error in lockEscrow:', err);
    return res.status(500).json({ message: 'Failed to lock escrow', error: err.message });
  }
}

/**
 * 8. Release Milestone Funds from Escrow to Editor
 * Transitions milestone to 'completed'.
 * Synchronizes single-source Milestone document in MongoDB.
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
    } = req.body;
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

    // Guard: Prevent double release and ensure funded
    if (targetMilestone) {
      if (targetMilestone.status === 'completed') {
        return res.status(400).json({
          message: `Milestone ${targetMilestone.index} ("${targetMilestone.title}") payment has already been released.`,
        });
      }
      if (targetMilestone.status !== 'funded') {
        return res.status(400).json({
          message: `Milestone ${targetMilestone.index} cannot be released because it is currently "${targetMilestone.status}". It must be funded first.`,
        });
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
      fromUser: req.user._id,
      toUser: editorId,
      amount: numericAmount,
      type: 'ESCROW_RELEASE',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: workspaceId || (projectId ? String(projectId) : null),
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

    // Update authoritative milestone in MongoDB
    if (targetMilestone) {
      targetMilestone.status = 'completed';
      targetMilestone.completedAt = new Date();
      targetMilestone.escrowReleaseTxn = transaction._id;
      await targetMilestone.save();

      // Check if all milestones for this project are completed
      const remainingUncompleted = await milestoneModel.countDocuments({
        projectId: targetMilestone.projectId,
        status: { $ne: 'completed' },
      });
      if (remainingUncompleted === 0) {
        await projectModel.findByIdAndUpdate(targetMilestone.projectId, { status: 'completed' });
        if (workspaceId) await workspaceModel.findByIdAndUpdate(workspaceId, { status: 'completed' });
      }
    }

    // 1. Notify Freelancer / Editor
    try {
      await createNotification({
        recipient: editorId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received!',
        message: `₹${numericAmount.toLocaleString('en-IN')} has been released to your wallet for "${title}".`,
        project: projectId || targetMilestone?.projectId || null,
        relatedUser: req.user._id,
        link: `/editor/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
        actionUrl: `/editor/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
      });
    } catch (e) {
      console.warn('[Notification] Release notification error:', e.message);
    }

    // 2. Notify Creator of payment release confirmation
    try {
      await createNotification({
        recipient: req.user._id,
        type: 'ESCROW_RELEASED',
        title: 'Payment Release Confirmed',
        message: `₹${numericAmount.toLocaleString('en-IN')} from escrow for "${title}" was successfully released to the freelancer.`,
        project: projectId || targetMilestone?.projectId || null,
        relatedUser: req.user._id,
        link: `/creator/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
        actionUrl: `/creator/workspace?projectId=${projectId || targetMilestone?.projectId}&milestoneId=${targetMilestone?._id || ''}`,
      });
    } catch (e) {
      console.warn('[Notification] Creator release record error:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount.toLocaleString('en-IN')} successfully released to editor`,
      transaction,
      milestone: targetMilestone,
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
 * 9. Withdrawal / Payout Request (Creator or Editor withdraws unspent/cleared credits to UPI/Bank)
 * Implements idempotency key & double-entry ledger.
 */
async function withdrawCredits(req, res) {
  try {
    const { amount, pin, upiId, bankAccountNumber, ifscCode, idempotencyKey: bodyIdemp } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 50) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹50 (50 credits)' });
    }

    // 1. Idempotency Key Guard
    const idempotencyKey = req.headers['idempotency-key'] || bodyIdemp || null;
    if (idempotencyKey) {
      const existingTxn = await transactionModel.findOne({ idempotencyKey });
      if (existingTxn) {
        const currentUser = await userModel.findById(req.user._id);
        return res.status(200).json({
          success: true,
          message: 'Withdrawal request already processed previously',
          transaction: existingTxn,
          walletBalance: currentUser ? currentUser.walletBalance : 0,
          utrNumber: existingTxn.razorpayPaymentId || idempotencyKey,
        });
      }
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

    // 2. Verify PIN
    const pinToCheck = String(pin || '');
    const isMatch = user.transactionPin
      ? await bcrypt.compare(pinToCheck, user.transactionPin)
      : pinToCheck === '1234';

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Transaction Security PIN' });
    }

    // 3. Atomically debit user wallet
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -numericAmount } },
      { returnDocument: 'after' }
    );

    const utr = `UTR_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const destinationDesc = upiId
      ? `UPI: ${upiId}`
      : `Bank: ••••${String(bankAccountNumber || '8888').slice(-4)} (${ifscCode || 'HDFC0001'})`;

    // 4. Create immutable Transaction record
    const transaction = await transactionModel.create({
      fromUser: req.user._id,
      toUser: null,
      amount: numericAmount,
      type: 'WITHDRAWAL',
      status: 'SUCCESS',
      gateway: 'SIMULATED_PAYOUT',
      idempotencyKey: idempotencyKey || utr,
      razorpayPaymentId: utr,
      description: `Withdrawal: ₹${numericAmount.toLocaleString('en-IN')} to ${destinationDesc} (${utr})`,
    });

    // 5. Create immutable Ledger entry (DEBIT)
    await ledgerModel.create({
      user: req.user._id,
      amount: numericAmount,
      type: 'DEBIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Payout Withdrawal (${utr})`,
    });

    // 6. Notification to user
    try {
      await createNotification({
        recipient: req.user._id,
        type: 'WITHDRAWAL_SUCCESS',
        title: 'Withdrawal Initiated',
        message: `Your withdrawal of ₹${numericAmount.toLocaleString('en-IN')} to ${destinationDesc} (${utr}) has been initiated.`,
        relatedUser: req.user._id,
      });
    } catch (notifErr) {
      console.warn('[Notification] Withdrawal notification warning:', notifErr.message);
    }

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

/**
 * 10. Refund Milestone Escrow back to Creator Wallet
 * Condition: Milestone is in 'funded' status and freelancer has made 0 deliveries (!deliveries || deliveries.length === 0).
 * Implements idempotency key & double-entry ledger audit record.
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
      reason,
      idempotencyKey: bodyIdemp,
    } = req.body;

    // 1. Locate Target Milestone in MongoDB
    let targetMilestone = null;
    if (milestoneId && mongoose.Types.ObjectId.isValid(milestoneId)) {
      targetMilestone = await milestoneModel.findById(milestoneId);
    }
    if (!targetMilestone && hiringId) {
      targetMilestone = await milestoneModel.findOne({
        hiringId,
        status: 'funded',
      });
    }
    if (!targetMilestone && workspaceId) {
      targetMilestone = await milestoneModel.findOne({
        workspaceId,
        status: 'funded',
      });
    }

    if (!targetMilestone) {
      return res.status(404).json({ message: 'Funded milestone not found in database' });
    }

    // 2. Authorization: only project creator can recall funds to wallet
    const creatorId = targetMilestone.creatorId?.toString();
    if (creatorId && creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can recall escrow funds' });
    }

    // 3. Status Check: Must be funded
    if (targetMilestone.status !== 'funded') {
      return res.status(400).json({
        message: `Milestone is currently in '${targetMilestone.status}' state. Only funded milestones can be refunded.`,
        currentStatus: targetMilestone.status,
      });
    }

    // 4. Strict Zero-Delivery Rule: Freelancer must have made 0 deliveries
    const deliveriesCount = Array.isArray(targetMilestone.deliveries)
      ? targetMilestone.deliveries.length
      : 0;

    if (deliveriesCount > 0 || (targetMilestone.submittedUrl && targetMilestone.submittedUrl.trim())) {
      return res.status(400).json({
        message: `Cannot refund escrow: Freelancer has already made ${deliveriesCount || 1} delivery cut(s). Escrow refund is only permitted when no deliveries have been submitted yet.`,
        deliveriesCount,
      });
    }

    // 5. Idempotency Key Guard
    const idempotencyKey =
      req.headers['idempotency-key'] ||
      bodyIdemp ||
      `refund_ms_${targetMilestone._id}`;

    const existingTxn = await transactionModel.findOne({ idempotencyKey });
    if (existingTxn) {
      const creatorUser = await userModel.findById(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Escrow deposit already refunded previously',
        transaction: existingTxn,
        walletBalance: creatorUser ? creatorUser.walletBalance : 0,
        milestone: targetMilestone,
      });
    }

    // 6. Security PIN Verification (if PIN provided or if creator has PIN set)
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

    const numericAmount = Number(amount || targetMilestone.amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }

    // 7. Atomic Credit back to Creator's Wallet
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: numericAmount } },
      { returnDocument: 'after' }
    );

    const title = targetMilestone.title || 'Milestone Escrow Refund';

    // 8. Create Immutable Transaction Record
    const transaction = await transactionModel.create({
      fromUser: null, // Released from system safe holding
      toUser: req.user._id,
      amount: numericAmount,
      type: 'ESCROW_REFUND',
      status: 'SUCCESS',
      gateway: 'SYSTEM_LEDGER',
      referenceWorkspaceId: targetMilestone.workspaceId || workspaceId || null,
      milestoneTitle: title,
      idempotencyKey,
      description: `Escrow Refund: ₹${numericAmount.toLocaleString('en-IN')} for "${title}" returned to wallet (0 deliveries submitted)`,
    });

    // 9. Create Immutable Ledger Entry (Double-entry CREDIT audit)
    await ledgerModel.create({
      user: req.user._id,
      amount: numericAmount,
      type: 'CREDIT',
      transaction: transaction._id,
      balanceAfter: updatedUser.walletBalance,
      description: `Escrow Refund (${title})`,
    });

    // 10. Reset Milestone to 'pending' (unfunded) state
    targetMilestone.status = 'pending';
    targetMilestone.fundedAt = null;
    targetMilestone.escrowLockTxn = null;
    await targetMilestone.save();

    // 11. Send Real Notifications to Creator and Freelancer
    try {
      // 1. Notify Creator
      await createNotification({
        recipient: req.user._id,
        type: 'ESCROW_REFUNDED',
        title: 'Escrow Refunded to Wallet',
        message: `₹${numericAmount.toLocaleString('en-IN')} locked in escrow for "${title}" has been returned to your wallet balance.`,
        project: targetMilestone.projectId,
        relatedUser: req.user._id,
        link: `/creator/payments?projectId=${targetMilestone.projectId}`,
      });

      // 2. Notify Freelancer
      if (targetMilestone.freelancerId) {
        await createNotification({
          recipient: targetMilestone.freelancerId,
          type: 'ESCROW_RECALLED',
          title: 'Milestone Escrow Recalled',
          message: `The creator recalled the escrow deposit (₹${numericAmount.toLocaleString('en-IN')}) for "${title}" as no deliveries were submitted yet.`,
          project: targetMilestone.projectId,
          relatedUser: req.user._id,
          link: `/editor/workspace?projectId=${targetMilestone.projectId}`,
        });
      }
    } catch (notifErr) {
      console.warn('[Notification] Escrow refund notification warning:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount.toLocaleString('en-IN')} refunded from escrow back to your wallet.`,
      walletBalance: updatedUser.walletBalance,
      milestone: targetMilestone,
      transaction,
    });
  } catch (err) {
    console.error('Error in refundEscrow:', err);
    return res.status(500).json({ message: 'Failed to refund escrow', error: err.message });
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
