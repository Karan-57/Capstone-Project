import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const BrowseProjects = () => {
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const [proposalModal, setProposalModal] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidCover, setBidCover] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getEditorRecommended();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const tagsList = ['All', 'Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Shorts', 'Video Editing'];

  const filtered = projects.filter(p => {
    const matchesTag = selectedTag === 'All' || (p.tags && p.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())));
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.creator || '').toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleSendProposal = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/application/${proposalModal.id}/apply`, {
        proposal: bidCover.trim() || 'unknown',
        bidAmount: parseInt(bidAmount.replace(/[^0-9]/g, ''), 10) || 999,
        estimatedDeliveryDays: parseInt(estimatedDays, 10) || 999,
      });
      showAlert(`Proposal successfully submitted for ${proposalModal.title}!`, 'success');
      setProposalModal(null);
      setBidAmount('');
      setBidCover('');
    } catch (err) {
      console.error('Failed to send proposal', err);
      showAlert(err.response?.data?.message || 'Failed to submit proposal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Browse Open Creator Gigs</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Discover active editing briefs, submit bids with custom turnaround times, and get hired
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] overflow-x-auto">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gigs by title, creator, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-64"
          />
        </div>
      </div>

      {/* Projects Feed */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading open gigs...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No open gigs found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((gig) => (
            <div
              key={gig.id}
              className="glass-card p-5.5 border border-white/[0.06] hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{gig.title || 'unknown'}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{gig.creator || 'unknown'}</span>
                        <CheckCircle className="w-3 h-3 text-purple-400" />
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" /> Due {gig.deadline || 'unknown'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-white">{gig.budget || '999'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {gig.proposalsCount === 999 ? 'Open' : `${gig.proposalsCount} proposals`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap my-3">
                  {(gig.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Difficulty: <strong className="text-slate-300">{gig.difficulty || 'unknown'}</strong>
                </span>

                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setProposalModal(gig)}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply / Proposal Modal */}
      {proposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Submit Application</h3>
            <p className="text-xs text-purple-300 mb-4">{proposalModal.title}</p>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bid Amount (INR)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20000"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Delivery Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Cover Note / Why you?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Introduce yourself, your editing style, and why you are the best fit for this project..."
                  value={bidCover}
                  onChange={(e) => setBidCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button variant="ghost" onClick={() => setProposalModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Send}>
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProjects;
