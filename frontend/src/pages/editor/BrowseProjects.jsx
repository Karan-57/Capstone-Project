import React, { useState } from 'react';
import { Search, CheckCircle, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorRecommendedProjectsData } from '../../services/projectService';

export const BrowseProjects = () => {
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const [proposalModal, setProposalModal] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidCover, setBidCover] = useState('');
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const allProjects = [
    ...editorRecommendedProjectsData,
    {
      id: 'rec-4',
      title: 'Crypto & FinTech Explainer Video (6 Mins 2D Motion)',
      creator: 'BlockStream Media',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      budget: '₹35,000',
      deadline: '6 Days',
      tags: ['After Effects', 'Illustrator', '2D Motion'],
      proposalsCount: 8,
      difficulty: 'Expert',
      verified: true,
    },
    {
      id: 'rec-5',
      title: 'Podcast Highlights Reel (Multi-Cam Switch & Sound Mix)',
      creator: 'Raw Conversations Podcast',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      budget: '₹16,000',
      deadline: '2 Days',
      tags: ['Premiere Pro', 'Audio Ducking', 'Shorts'],
      proposalsCount: 12,
      difficulty: 'Intermediate',
      verified: true,
    }
  ];

  const tagsList = ['All', 'Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Shorts', 'Motion Graphics'];

  const filtered = allProjects.filter(p => {
    const matchesTag = selectedTag === 'All' || p.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.creator.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (!proposalModal) return;

    setProposalSuccess(true);
    setAppliedProjectIds(prev => [...prev, proposalModal.id]);

    setTimeout(() => {
      setProposalModal(null);
      setProposalSuccess(false);
      setBidAmount('');
      setBidCover('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Browse Open Creator Gigs</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Find verified content creators, submit custom rate proposals, and land long-term editing retainers
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] overflow-x-auto">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            placeholder="Search gigs by style or channel..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-64"
          />
        </div>
      </div>

      {/* Gigs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((gig) => (
          <div
            key={gig.id}
            className="glass-card p-5 border border-white/[0.06] flex flex-col justify-between hover:border-purple-500/30 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={gig.creatorAvatar}
                    alt={gig.creator}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {gig.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{gig.creator}</span>
                      {gig.verified && <CheckCircle className="w-3 h-3 text-purple-400" />}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-emerald-400">{gig.budget}</span>
                  <span className="text-[10px] text-slate-500 block">{gig.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap my-3">
                {gig.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {gig.proposalsCount + (appliedProjectIds.includes(gig.id) ? 1 : 0)} editor proposals submitted
              </span>
              {appliedProjectIds.includes(gig.id) ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Applied
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setProposalModal(gig);
                    setBidAmount(gig.budget);
                  }}
                >
                  Send Proposal
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Proposal Modal */}
      {proposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Submit Proposal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send your offer and video portfolio samples to <strong>{proposalModal.creator}</strong>
            </p>

            {proposalSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Proposal Sent!</h4>
                <p className="text-xs text-slate-400">
                  {proposalModal.creator} will review your bid of {bidAmount}. Check status in My Applications.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Your Proposed Budget</label>
                  <input
                    type="text"
                    required
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cover Note & Relevant Showreel Link</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hey, I specialize in high-retention pacing and dynamic sound design. Check my previous similar cut: vimeo.com/..."
                    value={bidCover}
                    onChange={e => setBidCover(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button variant="ghost" onClick={() => setProposalModal(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={Send}>
                    Submit Bid
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProjects;
