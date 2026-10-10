const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// All payment routes require authenticated user
router.use(authMiddleware);

// 1. Razorpay Order Creation & Verification (1 Credit = 1 Rupee)
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

// 2. 1-Click Demo Credit Faucet for Presentations
router.post('/demo-topup', paymentController.demoTopup);

// 3. User Wallet Balance & Ledger Passbook
router.get('/me', paymentController.getWalletDetails);
router.get('/details', paymentController.getWalletDetails);

// 4. Transaction Security PIN Management
router.post('/pin/set', paymentController.setTransactionPin);
router.post('/pin/verify', paymentController.verifyTransactionPin);

// 5. Milestone Escrow Lifecycle
router.post('/escrow/lock', paymentController.lockEscrow);
router.post('/escrow/release', paymentController.releaseEscrow);

// 6. Editor Simulated Payout / Withdrawal
router.post('/withdraw', paymentController.withdrawCredits);

module.exports = router;
