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
      const [appsRes, wsRes] = await Promise.all([
        api.get('/api/application/my').catch(() => ({ data: { applications: [] } })),
        api.get('/api/workspace').catch(() => ({ data: { workspaces: [] } })),
      ]);

      const applications = appsRes.data?.applications || [];
      const workspaces = wsRes.data?.workspaces || [];
      const completedWsProjectIds = new Set(
        workspaces.filter(w => w.status === 'completed').map(w => (w.projectId?._id || w.projectId || '').toString())
      );

      let available = 0;
      let escrow = 0;
      let lifetime = 0;
      let completedCount = 0;
      const recentPayouts = [];

      applications.forEach(app => {
        if (app.status === 'accepted') {
          const numericBid = Number(app.bidAmount) || 0;
          const pId = (app.projectId?._id || app.projectId || '').toString();
          const isCompleted = completedWsProjectIds.has(pId);

          if (isCompleted) {
            available += numericBid;
            lifetime += numericBid;
            completedCount += 1;
            recentPayouts.push({
              id: app._id,
              project: app.projectId?.title || 'Video Editing Production',
              client: app.projectId?.creatorId?.name || 'Client',
              amount: `₹${numericBid.toLocaleString()}`,
              date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Settled',
              status: 'Completed',
            });
          } else {
            escrow += numericBid;
          }
        }
      });

      return {
        availableBalance: `₹${available.toLocaleString()}`,
        pendingEscrow: `₹${escrow.toLocaleString()}`,
        lifetimeEarned: `₹${lifetime.toLocaleString()}`,
        completedProjects: completedCount,
        recentPayouts: recentPayouts.slice(0, 5),
      };
    } catch (err) {
      console.warn('[paymentService] Real earnings calculation fallback:', err.message);
      return {
        availableBalance: '₹0',
        pendingEscrow: '₹0',
        lifetimeEarned: '₹0',
        completedProjects: 0,
        recentPayouts: [],
      };
    }
  },
};

