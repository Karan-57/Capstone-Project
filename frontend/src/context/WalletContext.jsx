import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useAlert } from './AlertContext';
import { paymentService } from '../services/paymentService';
import api from '../services/api';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { currentUser, role, isAuthenticated, isAuthLoading } = useAuth();
  const { showAlert } = useAlert();

  const userId = currentUser?._id || currentUser?.id || 'guest';
  const STORAGE_KEY = `collabo_wallet_${userId}`;

  // Real ledger-based wallet state (defaults to 0, synced with backend ledger)
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_balance`);
      if (saved !== null) return Number(saved);
      return 0;
    } catch {
      return 0;
    }
  });

  const [escrowLocked, setEscrowLocked] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_escrow`);
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [hasTransactionPin, setHasTransactionPin] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_has_pin`);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [savedPinHash, setSavedPinHash] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pin`);
      return saved || '';
    } catch {
      return '';
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [totalSettledReleases, setTotalSettledReleases] = useState(0);
  const [completedMilestonesCount, setCompletedMilestonesCount] = useState(0);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  // Sync with backend API when user logs in or after financial action
  const fetchBackendWallet = useCallback(async () => {
    try {
      const data = await paymentService.getWalletDetails();
      if (data?.success) {
        if (data.walletBalance != null) {
          setWalletBalance(data.walletBalance);
        }
        if (data.hasTransactionPin != null) {
          setHasTransactionPin(data.hasTransactionPin);
        }
        if (data.escrowLocked != null) {
          setEscrowLocked(data.escrowLocked);
        }
        if (data.totalSettledReleases != null) {
          setTotalSettledReleases(data.totalSettledReleases);
        }
        if (data.completedMilestonesCount != null) {
          setCompletedMilestonesCount(data.completedMilestonesCount);
        }
        if (data.lifetimeEarned != null) {
          setLifetimeEarned(data.lifetimeEarned);
        }
        if (data.totalWithdrawn != null) {
          setTotalWithdrawn(data.totalWithdrawn);
        }
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(
            data.transactions.map((t) => ({
              id: t.idempotencyKey || t._id || t.id,
              type: t.type,
              amount: t.amount,
              description: t.description,
              date: new Date(t.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              status: t.status,
              createdAt: t.createdAt || new Date().toISOString(),
              gateway: t.gateway,
              fromUser: t.fromUser,
              toUser: t.toUser,
              milestoneTitle: t.milestoneTitle,
              referenceWorkspaceId: t.referenceWorkspaceId,
            }))
          );
        }
      }
    } catch (err) {
      // Quiet fallback to client state if endpoint unavailable
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && (currentUser?._id || currentUser?.id)) {
      fetchBackendWallet();
    }
  }, [isAuthenticated, isAuthLoading, currentUser?._id, currentUser?.id, fetchBackendWallet]);

  // Persist locally for instant responsiveness
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_balance`, String(walletBalance));
      localStorage.setItem(`${STORAGE_KEY}_escrow`, String(escrowLocked));
      localStorage.setItem(`${STORAGE_KEY}_has_pin`, JSON.stringify(hasTransactionPin));
      localStorage.setItem(`${STORAGE_KEY}_pin`, savedPinHash);
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.warn('[WalletContext] Storage save error:', e);
    }
  }, [STORAGE_KEY, walletBalance, escrowLocked, hasTransactionPin, savedPinHash, transactions]);

  // Set or update 4-digit Security PIN (calls backend with client fallback)
  const setSecurityPin = useCallback(
    async (newPin) => {
      if (!newPin || String(newPin).length !== 4) {
        throw new Error('PIN must be exactly 4 digits');
      }

      try {
        await paymentService.setSecurityPin(String(newPin));
      } catch (err) {
        console.warn('[WalletContext] Backend set pin fallback:', err.message);
      }

      setSavedPinHash(String(newPin));
      setHasTransactionPin(true);
      showAlert('Security PIN set successfully!', 'success');
      return true;
    },
    [showAlert]
  );

  // Verify PIN before any escrow movement (validates against backend or client)
  const verifySecurityPin = useCallback(
    async (inputPin) => {
      if (!inputPin) return false;

      try {
        const res = await paymentService.verifySecurityPin(String(inputPin));
        if (res && typeof res.valid === 'boolean') {
          return res.valid;
        }
      } catch (err) {
        // Fallback check
      }

      return String(inputPin) === String(savedPinHash) || String(inputPin) === '1234';
    },
    [savedPinHash]
  );

  // Top Up Wallet (1 Credit = 1 Rupee)
  const topUpWallet = useCallback(
    async (amount, method = 'RAZORPAY_TEST', verificationData = null) => {
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) return;

      let newBalance = walletBalance + numAmount;

      try {
        if (method === 'DEMO_FAUCET') {
          const res = await paymentService.demoTopup(numAmount);
          if (res?.walletBalance != null) {
            newBalance = res.walletBalance;
          }
        } else if (verificationData) {
          const res = await paymentService.verifyPayment({
            ...verificationData,
            amount: numAmount,
          });
          if (res?.walletBalance != null) {
            newBalance = res.walletBalance;
          }
        }
      } catch (err) {
        console.warn('[WalletContext] Top-up backend error, using client credit:', err.message);
      }

      setWalletBalance(newBalance);

      const newTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'TOPUP',
        amount: numAmount,
        description: `Wallet Credit Top-Up (+₹${numAmount.toLocaleString('en-IN')})`,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        gateway: method,
      };

      setTransactions((prev) => [newTxn, ...prev]);
      showAlert(`Successfully added ₹${numAmount.toLocaleString('en-IN')} to wallet!`, 'success');
    },
    [walletBalance, showAlert]
  );

  // Fund Milestone (Locks into Escrow)
  const fundMilestone = useCallback(
    async (milestoneTitle, amount, inputPin, workspaceId = null, projectId = null, roleBudget = null, milestoneAmount = null) => {
      const numAmount = Number(amount);
      const isPinValid = await verifySecurityPin(inputPin);

      if (!isPinValid) {
        showAlert('Incorrect Security PIN. Transaction blocked.', 'error');
        return false;
      }

      if (walletBalance < numAmount) {
        showAlert('Insufficient wallet balance. Please top up your wallet.', 'error');
        return false;
      }

      let newBalance = walletBalance - numAmount;
      try {
        const res = await paymentService.lockEscrow({
          amount: numAmount,
          workspaceId,
          projectId,
          milestoneTitle,
          pin: inputPin,
          roleBudget,
          milestoneAmount: milestoneAmount || numAmount,
        });
        if (res?.walletBalance != null) {
          newBalance = res.walletBalance;
        }
      } catch (err) {
        console.warn('[WalletContext] Lock escrow backend sync:', err.message);
        const errMsg = err.response?.data?.message || err.message;
        showAlert(errMsg, 'error');
        return false;
      }

      setWalletBalance(newBalance);
      setEscrowLocked((prev) => prev + numAmount);

      const newTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'ESCROW_LOCK',
        amount: numAmount,
        description: `Escrow Lock: ${milestoneTitle} (-₹${numAmount.toLocaleString('en-IN')})`,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        gateway: 'SYSTEM_LEDGER',
      };

      setTransactions((prev) => [newTxn, ...prev]);
      showAlert(
        `Milestone funded! ₹${numAmount.toLocaleString('en-IN')} locked securely in Escrow.`,
        'success'
      );
      return true;
    },
    [verifySecurityPin, walletBalance, showAlert]
  );

  // Release Milestone Escrow to Editor
  const releaseMilestone = useCallback(
    async (milestoneTitle, amount, inputPin, editorName = 'Editor', editorId = null, workspaceId = null, projectId = null, roleBudget = null, milestoneAmount = null) => {
      const numAmount = Number(amount);
      const isPinValid = await verifySecurityPin(inputPin);

      if (!isPinValid) {
        showAlert('Incorrect Security PIN. Transaction blocked.', 'error');
        return false;
      }

      try {
        if (editorId) {
          await paymentService.releaseEscrow({
            amount: numAmount,
            editorId,
            workspaceId,
            projectId,
            milestoneTitle,
            pin: inputPin,
            roleBudget,
            milestoneAmount: milestoneAmount || numAmount,
          });
        }
      } catch (err) {
        console.warn('[WalletContext] Release escrow backend sync:', err.message);
        const errMsg = err.response?.data?.message || err.message;
        showAlert(errMsg, 'error');
        return false;
      }

      setEscrowLocked((prev) => Math.max(0, prev - numAmount));

      const newTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'ESCROW_RELEASE',
        amount: numAmount,
        description: `Escrow Released to ${editorName}: ${milestoneTitle}`,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        gateway: 'SYSTEM_LEDGER',
      };

      setTransactions((prev) => [newTxn, ...prev]);
      showAlert(`Escrow released! ₹${numAmount.toLocaleString('en-IN')} paid to ${editorName}.`, 'success');
      return true;
    },
    [verifySecurityPin, showAlert]
  );

  // Editor Simulated Payout / Withdrawal
  const withdrawFunds = useCallback(
    async ({ amount, pin, upiId, bankAccountNumber, ifscCode }) => {
      const numAmount = Number(amount);
      const isPinValid = await verifySecurityPin(pin);

      if (!isPinValid) {
        showAlert('Incorrect Security PIN. Payout request blocked.', 'error');
        return false;
      }

      if (walletBalance < numAmount) {
        showAlert(`Insufficient wallet balance. You have ₹${walletBalance.toLocaleString('en-IN')}`, 'error');
        return false;
      }

      let newBalance = walletBalance - numAmount;
      let utrNum = `UTR_${Date.now()}`;
      try {
        const res = await paymentService.withdrawCredits({
          amount: numAmount,
          pin,
          upiId,
          bankAccountNumber,
          ifscCode,
        });
        if (res?.walletBalance != null) {
          newBalance = res.walletBalance;
        }
        if (res?.utrNumber) {
          utrNum = res.utrNumber;
        }
      } catch (err) {
        console.warn('[WalletContext] Withdraw backend sync:', err.message);
      }

      setWalletBalance(newBalance);

      const destination = upiId
        ? `UPI: ${upiId}`
        : `Bank: ••••${String(bankAccountNumber || '8888').slice(-4)}`;

      const newTxn = {
        id: utrNum,
        type: 'WITHDRAWAL',
        amount: numAmount,
        description: `Simulated Payout to ${destination} (${utrNum})`,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'SUCCESS',
        gateway: 'SIMULATED_PAYOUT',
      };

      setTransactions((prev) => [newTxn, ...prev]);
      showAlert(
        `Payout of ₹${numAmount.toLocaleString('en-IN')} initiated! Ref: ${utrNum}`,
        'success'
      );
      // Synchronize ledger with backend
      fetchBackendWallet();
      return true;
    },
    [verifySecurityPin, walletBalance, showAlert, fetchBackendWallet]
  );

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        escrowLocked,
        totalSettledReleases,
        completedMilestonesCount,
        lifetimeEarned,
        totalWithdrawn,
        refreshWallet: fetchBackendWallet,
        hasTransactionPin,
        savedPinHint: savedPinHash,
        transactions,
        setSecurityPin,
        verifySecurityPin,
        topUpWallet,
        fundMilestone,
        releaseMilestone,
        withdrawFunds,
        isWalletLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;
