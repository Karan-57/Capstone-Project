import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export const ReviewsAndRating = () => {
  const navigate = useNavigate();

  const ratingData = [
    { stars: 5, count: 78, percentage: 78 },
    { stars: 4, count: 32, percentage: 32 },
    { stars: 3, count: 12, percentage: 12 },
    { stars: 2, count: 4, percentage: 4 },
    { stars: 1, count: 2, percentage: 2 },
  ];

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Reviews & Rating
          </h3>
          <button
            onClick={() => navigate('/creator/profile')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Rating score header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            4.8
          </span>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              (128 reviews)
            </span>
          </div>
        </div>

        {/* Breakdown bars with glowing purple fill */}
        <div className="space-y-2.5">
          {ratingData.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-slate-400 shrink-0 font-medium">
                {item.stars} Stars
              </span>
              <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.5)] transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="w-6 text-right text-slate-400 font-mono text-[11px] shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsAndRating;
