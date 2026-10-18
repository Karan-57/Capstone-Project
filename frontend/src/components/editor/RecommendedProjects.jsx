import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, CheckCircle, ArrowRight, Users } from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PFP } from '../../constants/assets';

export const RecommendedProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-5.5 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[#F0EDE5] text-[#3C2415] border border-[#DDD9CE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
              Recommended Projects For You
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/browse')}
            className="text-xs font-semibold text-[#6E7464] hover:text-[#3C2415] transition-colors cursor-pointer"
          >
            Explore all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#77736D]">
            No recommended gigs right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((gig) => (
              <div
                key={gig.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] hover:border-[#DDD9CE] transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator || 'Creator avatar'}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E0D7] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#3C2415] transition-colors truncate">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-[#77736D] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate">{gig.creator}</span>
                        {gig.verified && (
                          <CheckCircle className="w-3 h-3 text-[#55745C] fill-[#EAECE7] shrink-0" />
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#77736D]">
                          <Clock className="w-3 h-3 shrink-0 text-[#6E7464]" /> {gig.deadline}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold text-[#55745C] font-mono tracking-tight">
                      {gig.budget}
                    </div>
                    <div className="text-[11px] text-[#77736D] font-mono flex items-center sm:justify-end gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-[#77736D]" />
                      <span>{gig.proposalsCount} proposals</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Action */}
                <div className="mt-3 pt-3 border-t border-[#E5E0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(gig.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white text-[#3C2415] border border-[#E5E0D7]"
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

      <div className="mt-4 pt-3 border-t border-[#E5E0D7]">
        <button
          onClick={() => navigate('/editor/browse')}
          className="w-full py-2 text-xs font-medium text-[#3C2415] hover:bg-[#F0EDE5] rounded-xl border border-[#E5E0D7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Browse All Open Creator Projects</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#6E7464]" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedProjects;
