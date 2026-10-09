import React from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ReviewsAndRating = () => {
  const { currentUser } = useAuth();

  const ratingVal = currentUser?.rating != null && currentUser.rating > 0 ? currentUser.rating : 999;
  const reviewCount = currentUser?.totalReviews != null && currentUser.totalReviews > 0 ? currentUser.totalReviews : 999;

  // Real review metrics tracked in backend user/review schema
  const metrics = [
    { label: 'Behaviour', score: currentUser?.behaviour != null ? currentUser.behaviour : 999, max: 10 },
    { label: 'Response Time', score: currentUser?.responseTime != null ? currentUser.responseTime : 999, max: 10 },
    { label: 'Boundary Respect', score: currentUser?.boundaryRespect != null ? currentUser.boundaryRespect : 999, max: 10 },
  ];

  return (
    <div className="glass-card p-5.5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Reviews & Rating
          </h3>
          <span className="text-xs text-slate-400">
            {reviewCount === 999 ? '999 reviews' : `(${reviewCount} reviews)`}
          </span>
        </div>

        {/* Rating score header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {ratingVal}
          </span>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Average Rating
            </span>
          </div>
        </div>

        {/* Real Backend Performance Metrics */}
        <div className="space-y-3">
          {metrics.map((item) => (
            <div key={item.label} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {item.score === 999 ? '999' : `${item.score} / ${item.max}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.5)] transition-all duration-500"
                  style={{ width: item.score === 999 ? '0%' : `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsAndRating;
