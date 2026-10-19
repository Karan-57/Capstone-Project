import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, CreditCard, ShieldCheck, CheckCircle2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export const SpendingsOverview = () => {
  const navigate = useNavigate();
  const {
    walletBalance = 0,
    escrowLocked = 0,
    totalSettledReleases = 0,
    completedMilestonesCount = 0,
    transactions = []
  } = useWallet();

  const [timeframe, setTimeframe] = useState('All Time');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const timeframes = ['All Time', 'This Month', 'Last 30 Days'];

  // Filter spending transactions (ESCROW_RELEASE and ESCROW_LOCK)
  const filteredData = useMemo(() => {
    const now = new Date();
    const spendingTx = transactions.filter(
      (t) => t.type === 'ESCROW_RELEASE' || t.type === 'ESCROW_LOCK'
    );

    let filtered = spendingTx;
    if (timeframe === 'This Month') {
      filtered = spendingTx.filter((t) => {
        const d = new Date(t.createdAt || t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (timeframe === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = spendingTx.filter((t) => {
        const d = new Date(t.createdAt || t.date);
        return d >= thirtyDaysAgo;
      });
    }

    // Sort chronologically ascending
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
    );

    // Calculate period totals
    const settledAmount = sorted
      .filter((t) => t.type === 'ESCROW_RELEASE')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const lockedAmount = sorted
      .filter((t) => t.type === 'ESCROW_LOCK')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Fall back to context values if looking at All Time
    const displaySettled = timeframe === 'All Time' ? (totalSettledReleases || settledAmount) : settledAmount;
    const displayEscrow = timeframe === 'All Time' ? (escrowLocked || lockedAmount) : lockedAmount;
    const totalSpent = displaySettled + displayEscrow;

    return {
      transactions: sorted,
      totalSpent,
      settledAmount: displaySettled,
      escrowAmount: displayEscrow,
      milestonesCount: sorted.filter((t) => t.type === 'ESCROW_RELEASE').length || (timeframe === 'All Time' ? completedMilestonesCount : 0),
    };
  }, [transactions, timeframe, totalSettledReleases, escrowLocked, completedMilestonesCount]);

  // Generate real graph points from actual transaction history
  const chartData = useMemo(() => {
    const width = 340;
    const height = 135;
    const padX = 15;
    const padTop = 15;
    const padBottom = 25;
    const plotWidth = width - padX * 2;
    const plotHeight = height - padTop - padBottom;

    const numPoints = 5;
    const now = new Date();

    // Generate 5 evenly spaced dates for X-axis
    let dates = [];
    if (timeframe === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const totalDays = now.getDate();
      for (let i = 0; i < numPoints; i++) {
        const d = new Date(startOfMonth.getTime() + (i / (numPoints - 1)) * (totalDays - 1) * 86400000);
        dates.push(d);
      }
    } else if (timeframe === 'Last 30 Days') {
      for (let i = 0; i < numPoints; i++) {
        const d = new Date(now.getTime() - (numPoints - 1 - i) * (30 / (numPoints - 1)) * 86400000);
        dates.push(d);
      }
    } else {
      // All Time
      if (filteredData.transactions.length > 0) {
        const earliest = new Date(filteredData.transactions[0].createdAt || filteredData.transactions[0].date);
        const span = Math.max(now.getTime() - earliest.getTime(), 7 * 86400000);
        for (let i = 0; i < numPoints; i++) {
          const d = new Date(earliest.getTime() + (i / (numPoints - 1)) * span);
          dates.push(d);
        }
      } else {
        for (let i = 0; i < numPoints; i++) {
          const d = new Date(now.getTime() - (numPoints - 1 - i) * 7 * 86400000);
          dates.push(d);
        }
      }
    }

    // Calculate real cumulative spendings up to each date
    const points = dates.map((dateObj, idx) => {
      let cumulative = 0;
      if (filteredData.transactions.length > 0) {
        cumulative = filteredData.transactions
          .filter((t) => new Date(t.createdAt || t.date).getTime() <= dateObj.getTime())
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      }

      // Format date label (e.g. "12 Oct" or "Today" on last)
      const isToday = idx === numPoints - 1;
      const label = isToday
        ? 'Today'
        : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      return {
        date: dateObj,
        label,
        amount: cumulative,
      };
    });

    // Make sure the last point reflects the current totalSpent
    if (points.length > 0) {
      points[points.length - 1].amount = filteredData.totalSpent;
    }

    // Determine max value for Y-axis ceiling
    const highestVal = Math.max(...points.map((p) => p.amount), 0);
    const maxVal = highestVal > 0 ? Math.ceil(highestVal * 1.15) : 5000;
    const minVal = 0;

    // Calculate (x, y) coordinates for SVG
    const coords = points.map((p, idx) => {
      const x = padX + (idx / (numPoints - 1)) * plotWidth;
      const yFraction = (p.amount - minVal) / (maxVal - minVal || 1);
      const y = padTop + plotHeight - yFraction * plotHeight;
      return { ...p, x, y };
    });

    // Construct smooth cubic bezier SVG path
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) * 0.45;
      const cp1y = curr.y;
      const cp2x = next.x - (next.x - curr.x) * 0.45;
      const cp2y = next.y;
      linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }

    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - 10} L ${coords[0].x} ${height - 10} Z`;

    // Dynamic Y-axis labels
    const formatY = (val) => {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
      return `₹${Math.round(val)}`;
    };

    const yLabels = [
      formatY(maxVal),
      formatY(maxVal * 0.66),
      formatY(maxVal * 0.33),
      '0',
    ];

    return {
      coords,
      linePath,
      areaPath,
      yLabels,
      width,
      height,
      hasRealData: highestVal > 0,
    };
  }, [filteredData, timeframe]);

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative min-w-0 overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-10 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/30 rotate-[2deg] pointer-events-none" />

      <div>
        {/* Header with Title and Timeframe Dropdown */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#382322] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
              Spendings Overview
            </h3>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono text-[#382322] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-lg border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <span>{timeframe}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#382322] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-32 p-1 rounded-xl bg-white border-2 border-[#382322] shadow-[3px_3px_0_#382322]">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setTimeframe(tf);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      timeframe === tf
                        ? 'bg-[#FFEBAA] text-[#382322]'
                        : 'text-[#382322]/70 hover:bg-[#FDEBDE]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real Metric Display */}
        <div className="mb-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#382322] tracking-tight font-mono">
            ₹{filteredData.totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#382322]/70 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Total Production Spend</span>
            <span className="text-[#382322] font-bold text-[11px] font-mono flex items-center gap-1 bg-[#B1C8EA] px-2 py-0.5 rounded-md border border-[#382322]">
              <CheckCircle2 className="w-3 h-3 text-[#382322]" />
              {filteredData.milestonesCount} Milestones Paid
            </span>
          </div>
        </div>

        {/* Dynamic Real SVG Spendings Curve */}
        <div className="relative mt-3">
          {/* Y Axis Legend */}
          <div className="absolute left-0 top-1 bottom-7 flex flex-col justify-between text-[10px] text-[#382322]/60 font-mono font-bold select-none">
            {chartData.yLabels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>

          {/* Chart SVG */}
          <div className="ml-8 relative">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-32 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="spendingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFEBAA" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#B1C8EA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FDEBDE" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="15" x2={chartData.width} y2="15" stroke="rgba(56,35,34,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1="48" x2={chartData.width} y2="48" stroke="rgba(56,35,34,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1="81" x2={chartData.width} y2="81" stroke="rgba(56,35,34,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2={chartData.width} y2="110" stroke="rgba(56,35,34,0.08)" strokeDasharray="3 3" />

              {/* Gradient Area Fill */}
              <path d={chartData.areaPath} fill="url(#spendingsGrad)" />

              {/* Glowing Curve Line */}
              <path
                d={chartData.linePath}
                fill="none"
                stroke="#382322"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Interactive Milestone Dots */}
              {chartData.coords.map((pt, idx) => {
                const isLast = idx === chartData.coords.length - 1;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isLast ? 5 : 4}
                      fill={isLast ? '#FFEBAA' : '#FFFFFF'}
                      stroke="#382322"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute -top-7 z-20 px-2 py-1 rounded-md bg-[#382322] border border-[#FFEBAA] text-[11px] font-mono font-bold text-[#FFEBAA] shadow-md pointer-events-none transform -translate-x-1/2"
                style={{ left: `${(hoveredPoint.x / chartData.width) * 100}%` }}
              >
                ₹{hoveredPoint.amount.toLocaleString('en-IN')}
              </div>
            )}

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] sm:text-[11px] text-[#382322]/70 font-mono font-bold pt-1.5 select-none overflow-hidden gap-1">
              {chartData.coords.map((c, idx) => (
                <span key={idx} className="truncate text-center">{c.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Real Breakdown Pills */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t-2 border-[#382322]/10">
          <div className="p-2.5 rounded-xl bg-[#FDEBDE] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
            <span className="text-[10px] text-[#382322]/70 block font-bold uppercase tracking-wider">Settled to Freelancers</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#382322] font-mono mt-0.5 block">
              ₹{filteredData.settledAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
            <span className="text-[10px] text-[#382322]/70 block font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#382322]" />
              In Active Escrow
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#382322] font-mono mt-0.5 block">
              ₹{filteredData.escrowAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Shortcut */}
      <div className="mt-3 pt-2 text-right">
        <button
          type="button"
          onClick={() => navigate('/creator/payments')}
          className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Payments & Invoices</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SpendingsOverview;
