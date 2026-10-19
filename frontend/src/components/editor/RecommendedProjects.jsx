import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, CheckCircle, ArrowRight, Users } from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PFP } from '../../constants/assets';

export const RecommendedProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 left-10 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/30 rotate-[3deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#382322] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
              Recommended Opportunities
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/browse')}
            className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all cursor-pointer"
          >
            Explore all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs font-sans text-[#382322]/60 bg-[#FDEBDE]/30 rounded-xl border border-dashed border-[#382322]/30">
            No recommended gigs right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((gig) => (
              <div
                key={gig.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FDEBDE]/40 border-2 border-[#382322] shadow-[2px_2px_0_#382322] hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator || 'Creator avatar'}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#382322] group-hover:underline decoration-2 underline-offset-2 transition-all truncate">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-[#382322]/70 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate font-semibold text-[#382322]">{gig.creator}</span>
                        {gig.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#382322] fill-[#FFEBAA] shrink-0" />
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#382322]/70">
                          <Clock className="w-3 h-3 shrink-0" /> {gig.deadline}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-extrabold text-[#382322] font-mono tracking-tight">
                      {gig.budget}
                    </div>
                    <div className="text-[11px] text-[#382322]/70 font-mono font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-[#382322]" />
                      <span>{gig.proposalsCount} proposals</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Action */}
                <div className="mt-3 pt-3 border-t-2 border-[#382322]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(gig.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-bold font-mono rounded-md bg-[#B1C8EA]/60 text-[#382322] border border-[#382322]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/editor/browse')}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10">
        <button
          onClick={() => navigate('/editor/browse')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#382322] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Browse All Open Creator Projects</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#382322]" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedProjects;
