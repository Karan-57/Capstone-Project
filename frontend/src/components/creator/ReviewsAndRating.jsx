import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ReviewsAndRating = () => {
  const { currentUser } = useAuth();
  const [reviewsData, setReviewsData] = useState(null);

  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (userId) {
      api.get(`/api/users/${userId}/get-review`).then((res) => {
        if (res.data) setReviewsData(res.data);
      }).catch(() => {});
    }
  }, [currentUser?._id, currentUser?.id]);

  const ratingVal = currentUser?.rating != null
    ? currentUser.rating
    : reviewsData?.reviews?.length > 0
      ? (reviewsData.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsData.reviews.length).toFixed(1)
      : 0;

  const reviewCount = currentUser?.totalReviews != null
    ? currentUser.totalReviews
    : reviewsData?.pagination?.totalReviews != null
      ? reviewsData.pagination.totalReviews
      : 0;

  // Real review metrics tracked in backend user/review schema
  const behaviourScore = currentUser?.behaviour != null ? currentUser.behaviour : 0;
  const responseTimeScore = currentUser?.responseTime != null ? currentUser.responseTime : 0;
  const boundaryRespectScore = currentUser?.boundaryRespect != null ? currentUser.boundaryRespect : 0;

  const metrics = [
    { label: 'Behaviour', score: behaviourScore, max: 10 },
    { label: 'Response Time', score: responseTimeScore, max: 10 },
    { label: 'Boundary Respect', score: boundaryRespectScore, max: 10 },
  ];

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full min-w-0 relative overflow-hidden">
      {/* Editorial corner stamp */}
      <div className="absolute -top-1.5 right-6 w-10 h-3 bg-[#B1C8EA] border border-[#382322]/30 rotate-[-2deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
            Reviews & Rating
          </h3>
          <span className="text-xs text-[#382322] font-mono font-bold bg-[#FFEBAA] px-2.5 py-0.5 rounded-full border border-[#382322]">
            {reviewCount === 0 ? '0 reviews' : `${reviewCount} reviews`}
          </span>
        </div>

        {/* Rating score header */}
        <div className="flex items-center gap-3.5 mb-5 p-3 rounded-xl bg-[#FDEBDE]/60 border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
          <span className="text-4xl font-extrabold text-[#382322] tracking-tight font-mono">
            {ratingVal}
          </span>
          <div>
            <div className="flex items-center gap-1 text-[#382322]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(ratingVal)) && ratingVal > 0
                      ? 'fill-[#382322] text-[#382322]'
                      : 'text-[#382322]/25'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#382322]/70 mt-0.5 block font-sans">
              Average Creator Score
            </span>
          </div>
        </div>

        {/* Real Backend Performance Metrics */}
        <div className="space-y-3.5">
          {metrics.map((item) => (
            <div key={item.label} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#382322] font-semibold">{item.label}</span>
                <span className="font-mono text-[#382322] font-bold">
                  {item.score} / {item.max}
                </span>
              </div>
              <div className="w-full h-2 bg-[#FDEBDE] border border-[#382322]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#382322] rounded-full transition-all duration-500"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
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
