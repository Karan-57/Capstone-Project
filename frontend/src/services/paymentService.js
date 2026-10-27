import api from './api';

export const earningsChartData = {
  thisMonth: {
    total: '₹45,000',
    comparison: '+18.4% vs last month',
    trendPositive: true,
    points: [
      { date: '1 May', value: 12000 },
      { date: '8 May', value: 19000 },
      { date: '15 May', value: 24000 },
      { date: '22 May', value: 33000 },
      { date: '29 May', value: 45000 },
    ]
  },
  lastMonth: {
    total: '₹38,000',
    comparison: '+12.1% vs prev month',
    trendPositive: true,
    points: [
      { date: '1 Apr', value: 8000 },
      { date: '8 Apr', value: 15000 },
      { date: '15 Apr', value: 22000 },
      { date: '22 Apr', value: 29000 },
      { date: '29 Apr', value: 38000 },
    ]
  }
};

export const paymentService = {
  getEarningsChart: async (timeframe = 'thisMonth') => {
    try {
      const res = await api.get('/api/creator/projects');
      const projects = res.data?.projects || [];
      const totalSpent = projects.reduce((sum, p) => {
        const val = typeof p.budget === 'number' ? p.budget : (p.budget?.fixed || 0);
        return p.status === 'completed' ? sum + val : sum;
      }, 0);

      if (totalSpent > 0) {
        return {
          total: `₹${totalSpent.toLocaleString()}`,
          comparison: 'Real lifetime settlements',
          trendPositive: true,
          points: earningsChartData[timeframe]?.points || earningsChartData.thisMonth.points
        };
      }
    } catch {
      // Fallback
    }
    return earningsChartData[timeframe] || earningsChartData.thisMonth;
  },

  getEditorEarnings: async () => {
    try {
      const currentRole = localStorage.getItem('collabo_role') || 'creator';
      if (currentRole !== 'editor') {
        return {
          available: 0,
          escrow: 0,
          lifetime: 0,
          totalWithdrawn: 0,
          completedCount: 0,
          recentPayouts: [],
        };
      }

      // 1. Fetch real ledger and wallet details
      const walletRes = await api.get('/api/wallet/me').catch(() => null);
      if (walletRes?.data?.success) {
        const d = walletRes.data;
        const payouts = (d.transactions || [])
          .filter(t => t.type === 'ESCROW_RELEASE' || t.type === 'WITHDRAWAL')
          .slice(0, 8)
          .map(t => ({
            id: t._id || t.id,
            project: t.milestoneTitle || (t.type === 'ESCROW_RELEASE' ? 'Milestone Cleared' : 'Bank Withdrawal'),
            client: t.gateway || 'Collabo Safe',
            amount: `${t.type === 'ESCROW_RELEASE' ? '+' : '-'}₹${Number(t.amount || 0).toLocaleString('en-IN')}`,
            date: new Date(t.createdAt).toLocaleDateString(),
            status: 'Completed',
          }));

        return {
          availableBalance: `₹${Number(d.walletBalance || 0).toLocaleString('en-IN')}`,
          pendingEscrow: `₹${Number(d.escrowLocked || 0).toLocaleString('en-IN')}`,
          lifetimeEarned: `₹${Number(d.lifetimeEarned || 0).toLocaleString('en-IN')}`,
          totalWithdrawn: `₹${Number(d.totalWithdrawn || 0).toLocaleString('en-IN')}`,
          completedProjects: d.completedMilestonesCount || 0,
          recentPayouts: payouts,
        };
      }

      return {
        availableBalance: '₹0',
        pendingEscrow: '₹0',
        lifetimeEarned: '₹0',
        totalWithdrawn: '₹0',
        completedProjects: 0,
        recentPayouts: [],
      };
    } catch (err) {
      console.warn('[paymentService] Real earnings calculation fallback:', err.message);
      return {
        availableBalance: '₹0',
        pendingEscrow: '₹0',
        lifetimeEarned: '₹0',
        totalWithdrawn: '₹0',
        completedProjects: 0,
        recentPayouts: [],
      };
    }
  },

  // 1. Create Razorpay Test Order (1 Credit = 1 INR)
  createOrder: async (amount) => {
    const res = await api.post('/api/wallet/create-order', { amount: Number(amount) });
    return res.data;
  },

  // 2. Verify Razorpay Payment Signature
  verifyPayment: async (data) => {
    const res = await api.post('/api/wallet/verify', data);
    return res.data;
  },

  // 3. Instant 1-Click Demo Faucet
  demoTopup: async (amount) => {
    const res = await api.post('/api/wallet/demo-topup', { amount: Number(amount) });
    return res.data;
  },

  // 4. Get User Wallet Balance, PIN status & Ledger
  getWalletDetails: async () => {
    try {
      const res = await api.get('/api/wallet/me');
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  // 5. Set or Update 4-Digit Security PIN
  setSecurityPin: async (pin) => {
    const res = await api.post('/api/wallet/pin/set', { pin: String(pin) });
    return res.data;
  },

  // 6. Verify 4-Digit Security PIN
  verifySecurityPin: async (pin) => {
    const res = await api.post('/api/wallet/pin/verify', { pin: String(pin) });
    return res.data;
  },

  // 7. Lock Milestone Funds in Escrow
  lockEscrow: async ({
    amount,
    workspaceId,
    projectId,
    milestoneTitle,
    pin,
    roleBudget,
    milestoneAmount,
    hiringId,
    milestoneId,
    milestoneIndex,
  }) => {
    const res = await api.post('/api/wallet/escrow/lock', {
      amount: Number(amount),
      workspaceId,
      projectId,
      milestoneTitle,
      pin: String(pin || ''),
      roleBudget: roleBudget ? Number(roleBudget) : undefined,
      milestoneAmount: milestoneAmount ? Number(milestoneAmount) : undefined,
      hiringId,
      milestoneId,
      milestoneIndex,
    });
    return res.data;
  },

  // 8. Release Milestone Funds from Escrow
  releaseEscrow: async ({
    amount,
    editorId,
    workspaceId,
    projectId,
    milestoneTitle,
    pin,
    roleBudget,
    milestoneAmount,
    hiringId,
    milestoneId,
    milestoneIndex,
  }) => {
    const res = await api.post('/api/wallet/escrow/release', {
      amount: Number(amount),
      editorId,
      workspaceId,
      projectId,
      milestoneTitle,
      pin: String(pin || ''),
      roleBudget: roleBudget ? Number(roleBudget) : undefined,
      milestoneAmount: milestoneAmount ? Number(milestoneAmount) : undefined,
      hiringId,
      milestoneId,
      milestoneIndex,
    });
    return res.data;
  },

  // 9. Editor Simulated Payout / Withdrawal
  withdrawCredits: async ({ amount, pin, upiId, bankAccountNumber, ifscCode }) => {
    const res = await api.post('/api/wallet/withdraw', {
      amount: Number(amount),
      pin: String(pin || ''),
      upiId,
      bankAccountNumber,
      ifscCode,
    });
    return res.data;
  },

  // 10. Dynamically load official Razorpay SDK on-demand
  loadRazorpaySdk: () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
