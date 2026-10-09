import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PFP } from '../../constants/assets';

export const RecommendedProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-4 sm:p-5.5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Recommended Projects For You
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/browse')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Explore all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No recommended gigs right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((gig) => (
              <div
                key={gig.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] hover:border-purple-500/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate">{gig.creator}</span>
                        {gig.verified && (
                          <CheckCircle className="w-3 h-3 text-purple-400 fill-purple-400/20 shrink-0" />
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 shrink-0" /> {gig.deadline}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold text-white">
                      {gig.budget}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {gig.proposalsCount} proposals
                    </div>
                  </div>
                </div>

                {/* Tags & Action */}
                <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(gig.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => navigate('/editor/browse')}
                    className="px-3 self-start sm:self-auto"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => navigate('/editor/browse')}
          className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.06] transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Browse All Open Creator Projects</span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedProjects;
