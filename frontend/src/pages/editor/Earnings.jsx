import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, CheckCircle2, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { applicationService } from '../../services/applicationService';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';

export const Earnings = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingEscrow, setPendingEscrow] = useState(0);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [recentPayouts, setRecentPayouts] = useState([]);

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      try {
        const [apps, wsRes] = await Promise.all([
          applicationService.getMyApplications(),
          api.get('/api/workspace').catch(() => ({ data: { workspaces: [] } })),
        ]);

        const workspaces = wsRes.data?.workspaces || [];
        const completedWsProjectIds = new Set(
          workspaces.filter(w => w.status === 'completed').map(w => w.projectId?._id || w.projectId)
        );

        let available = 0;
        let escrow = 0;
        let lifetime = 0;
        const payouts = [];

        (apps || []).forEach(app => {
          if (app.status === 'accepted') {
            const numericBid = typeof app.bidAmount === 'number' ? app.bidAmount : (parseInt(String(app.bidAmount).replace(/[^0-9]/g, ''), 10) || 0);
            const isCompleted = completedWsProjectIds.has(app.projectId);

            if (isCompleted) {
              available += numericBid;
              lifetime += numericBid;
              payouts.push({
                id: app.id,
                project: app.projectTitle || 'Video Production Cut',
                client: app.creatorName || 'Creator Client',
                amount: `₹${numericBid.toLocaleString()}`,
                date: app.createdAt || 'Settled',
                status: 'Completed',
              });
            } else {
              escrow += numericBid;
            }
          }
        });

        setAvailableBalance(available);
        setPendingEscrow(escrow);
        setLifetimeEarned(lifetime);
        setRecentPayouts(payouts);
      } catch (err) {
        console.error('Failed to load editor earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Earnings & Bank Transfers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor client escrow deposits, cleared project payments, and withdrawal history
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => showAlert('Invoices downloaded to your device', 'info')}
          className="self-start sm:self-auto"
        >
          Download Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06] flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400">Available to Cash Out</span>
            <div className="text-2xl font-bold text-white mt-1">₹{availableBalance.toLocaleString()}</div>
          </div>
          <Button
            variant="primary"
            size="xs"
            disabled={availableBalance === 0}
            onClick={() => showAlert(`Payout of ₹${availableBalance.toLocaleString()} transfer initiated to linked Bank Account`, 'success')}
            className="mt-4 w-full disabled:opacity-50"
          >
            Withdraw to Bank
          </Button>
        </div>

        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> In Escrow Protection
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">₹{pendingEscrow.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Auto-clears into your balance upon client milestone sign-off
          </p>
        </div>

        <div className="glass-card p-5 border border-white/[0.06] sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400">Lifetime Career Earnings</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">₹{lifetimeEarned.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            All completed productions settled on Collabo platform
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="glass-card p-5 sm:p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Payout History & Completed Cuts</h3>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading payout records...</div>
        ) : recentPayouts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-400">No payouts settled yet. Complete your first video edit delivery to receive payout funds.</p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/editor/browse-projects')}
            >
              Browse Open Gigs
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayouts.map((pay) => (
              <div
                key={pay.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{pay.project}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Client: <strong className="text-slate-200">{pay.client}</strong> • {pay.date}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3 shrink-0">
                  <span className="text-sm font-bold text-emerald-400">+{pay.amount}</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
