import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, CheckCircle, Users } from 'lucide-react';
import { DEFAULT_PFP } from '../../constants/assets';

export const RecommendedProjects = ({ projects = [] }) => {
  const navigate = useNavigate();
  const displayProjects = projects.slice(0, 3);

  return (
    <div className="bg-white/95 dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] p-5 flex flex-col justify-between h-full relative overflow-hidden text-[#261615] dark:text-[#FDEBDE]">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 left-10 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/30 rotate-[3deg] pointer-events-none" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#382322] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              Recommended Opportunities
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/browse')}
            className="text-xs font-bold text-[#261615] dark:text-[#FFEBAA] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA]/20 px-2 py-0.5 rounded transition-all cursor-pointer font-mono"
          >
            Explore all
          </button>
        </div>

        {displayProjects.length === 0 ? (
          <div className="flex-1 min-h-[180px] flex items-center justify-center text-center text-xs font-sans text-[#5C3A38] dark:text-[#D4B8A8] bg-[#FDEBDE]/30 dark:bg-[#1A1110]/50 rounded-xl border border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 p-6">
            No recommended gigs right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {displayProjects.map((gig) => (
              <div
                key={gig.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FDEBDE]/40 dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator || 'Creator avatar'}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1.5px_1.5px_0_#382322] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE] group-hover:underline decoration-2 underline-offset-2 transition-all truncate">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate font-semibold text-[#261615] dark:text-[#FDEBDE]">{gig.creator}</span>
                        {gig.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA] fill-[#FFEBAA] dark:fill-transparent shrink-0" />
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                          <Clock className="w-3 h-3 shrink-0" /> {gig.deadline}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-extrabold text-[#261615] dark:text-[#FFEBAA] font-mono tracking-tight">
                      {gig.budget}
                    </div>
                    <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-[#261615] dark:text-[#FFEBAA]" />
                      <span>{gig.proposalsCount} proposals</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Action */}
                <div className="mt-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(gig.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-bold font-mono rounded-lg bg-[#B1C8EA]/60 dark:bg-[#B1C8EA]/20 text-[#261615] dark:text-[#B1C8EA] border border-[#382322] dark:border-[#B1C8EA]/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/editor/browse')}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto font-mono"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <button
          onClick={() => navigate('/editor/browse')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-wider"
        >
          Explore All Marketplace Gigs
        </button>
      </div>
    </div>
  );
};

export default RecommendedProjects;
