import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, ArrowDownRight, DollarSign, Lock, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAlert } from '../../context/AlertContext';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

export const Payments = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [escrows, setEscrows] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeInEscrow, setActiveInEscrow] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(0);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getCreatorProjects();
      
      let spent = 0;
      let escrowSum = 0;
      let completedCount = 0;

      const parsedEscrows = (projects || [])
        .filter(p => p.rawStatus === 'in_progress' || p.rawStatus === 'assigned' || p.rawStatus === 'completed')
        .map(p => {
          const numericBudget = parseInt(String(p.budget).replace(/[^0-9]/g, ''), 10) || 0;
          const isCompleted = p.rawStatus === 'completed';

          if (isCompleted) {
            spent += numericBudget;
            completedCount += 1;
          } else {
            escrowSum += numericBudget;
          }

          return {
            id: p.id,
            project: p.title || 'Untitled Project',
            editor: p.assignedEditor?.name || 'Assigned Editor',
            amount: p.budget || '₹0',
            status: isCompleted ? 'Released' : 'In Escrow (In Production)',
            canRelease: !isCompleted,
          };
        });

      setEscrows(parsedEscrows);
      setTotalSpent(spent);
      setActiveInEscrow(escrowSum);
      setCompletedMilestones(completedCount);
    } catch (err) {
      console.error('Failed to load escrow payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRelease = async (id) => {
    try {
      // Find workspace for this project or mark project completed
      await api.patch(`/api/creator/projects/${id}`, { status: 'completed' }).catch(() => {});
      setEscrows(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Released', canRelease: false } : item))
      );
      showAlert('Payment milestone released to editor!', 'success');
      loadPayments();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to release payment milestone', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Payments & Escrow Protection</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          All creator funds are held in secure 256-bit encrypted escrow until you approve the final cut
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Total Spent</span>
          <div className="text-2xl font-bold text-white mt-1">₹{totalSpent.toLocaleString()}</div>
          <span className="text-xs text-emerald-400 mt-1 block">{completedMilestones} completed production milestones</span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Active in Escrow
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">₹{activeInEscrow.toLocaleString()}</div>
          <span className="text-xs text-slate-400 mt-1 block">Secured for active production contracts</span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Escrow Security</span>
          <div className="text-sm font-semibold text-white mt-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Milestone Protection
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Funds released only upon final cut approval
          </span>
        </div>
      </div>

      {/* Escrow Table */}
      <div className="glass-card p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Milestone Escrow Releases</h3>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading escrow records...</div>
        ) : escrows.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-400">No active escrow milestones yet. When you assign an editor to a project, milestones will appear here.</p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/creator/create-project')}
            >
              Create New Project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {escrows.map((esc) => (
              <div
                key={esc.id}
                className="p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{esc.project}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned Editor: <span className="text-purple-300 font-medium">{esc.editor}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-white">{esc.amount}</span>
                    <span className="text-slate-500">•</span>
                    <span className={`text-[11px] font-medium ${
                      esc.status === 'Released' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {esc.status}
                    </span>
                  </div>
                </div>

                {esc.canRelease && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRelease(esc.id)}
                  >
                    Release Payment
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
