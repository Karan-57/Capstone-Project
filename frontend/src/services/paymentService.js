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

export const editorEarningsData = {
  availableBalance: '₹64,200',
  pendingEscrow: '₹22,000',
  lifetimeEarned: '₹3,48,000',
  completedProjects: 24,
  recentPayouts: [
    { id: 'pay-1', project: 'SaaS Walkthrough Video', client: 'CloudFlow Labs', amount: '₹28,000', date: 'Yesterday', status: 'Completed' },
    { id: 'pay-2', project: 'Cinematic Travel Trailer', client: 'Nomad Stories', amount: '₹18,500', date: 'Aug 24, 2026', status: 'Completed' },
    { id: 'pay-3', project: 'YouTube Tech Review Ep. 12', client: 'Dave Lee Studio', amount: '₹14,000', date: 'Aug 18, 2026', status: 'Completed' },
  ]
};

export const paymentService = {
  getEarningsChart: (timeframe = 'thisMonth') => Promise.resolve(earningsChartData[timeframe] || earningsChartData.thisMonth),
  getEditorEarnings: () => Promise.resolve(editorEarningsData),
};
