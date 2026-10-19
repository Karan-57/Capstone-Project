import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Star,
  CheckCircle2,
  Lock,
  ShieldCheck,
  MapPin,
  Briefcase,
  Layers,
  Send,
  Sparkles,
  Calendar,
  Clock,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { messageService } from '../../services/messageService';
import { DEFAULT_PFP } from '../../constants/assets';

export const UserProfileModal = ({ userId, initialUser = null, isOpen, onClose }) => {
  const { currentUser, role: myRole } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialUser);
  const [collabStatus, setCollabStatus] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [speed, setSpeed] = useState(9);
  const [quality, setQuality] = useState(9);
  const [behaviour, setBehaviour] = useState(10);
  const [responseTime, setResponseTime] = useState(9);
  const [boundaryRespect, setBoundaryRespect] = useState(10);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const targetUserId = userId || initialUser?._id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelf = currentUserId && targetUserId && String(currentUserId) === String(targetUserId);

  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    let isMounted = true;
    setIsLoading(true);
    setReviewSuccessMsg('');
    setReviewErrorMsg('');

    const fetchData = async () => {
      try {
        const [userRes, reviewsRes, collabRes] = await Promise.allSettled([
          userService.getUserProfile(targetUserId),
          userService.getUserReviews(targetUserId),
          currentUserId && !isSelf ? userService.getCollaborationStatus(targetUserId) : Promise.resolve(null)
        ]);

        if (isMounted) {
          if (userRes.status === 'fulfilled' && userRes.value) {
            setProfile(userRes.value);
          }
          if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.reviews) {
            setReviewsData(reviewsRes.value.reviews);
          }
          if (collabRes.status === 'fulfilled' && collabRes.value) {
            setCollabStatus(collabRes.value);
            if (collabRes.value.eligibleProject?._id) {
              setSelectedProjectId(collabRes.value.eligibleProject._id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load profile modal data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUserId, currentUserId, isSelf]);

  if (!isOpen || !targetUserId) return null;

  const handleMessage = async () => {
    if (isSelf) return;
    try {
      setIsMessaging(true);
      const conv = await messageService.getOrCreatePrivateConversation(targetUserId);
      onClose();
      const messagesPath = myRole === 'creator' ? '/creator/messages' : '/editor/messages';
      navigate(messagesPath, {
        state: {
          conversationId: conv?._id || conv?.id,
          recipientUser: profile,
        },
      });
    } catch (err) {
      console.error('Failed to open message with user:', err);
      alert('Could not start conversation: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsMessaging(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!collabStatus?.canRate && !selectedProjectId) return;
    setIsSubmittingReview(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const payload = {
        projectId: selectedProjectId || collabStatus?.eligibleProject?._id,
        rating: Number(rating),
        reviewText: reviewText.trim(),
      };

      if (profile?.role === 'creator') {
        payload.behaviour = behaviour;
        payload.responseTime = responseTime;
        payload.boundaryRespect = boundaryRespect;
      } else {
        payload.speed = speed;
        payload.quality = quality;
        payload.behaviour = behaviour;
        payload.responseTime = responseTime;
      }

      const res = await userService.rateUser(targetUserId, payload);
      setReviewSuccessMsg('Review submitted successfully! Thank you for rating.');
      
      // Refresh collaboration status & reviews
      const [updatedCollab, updatedReviews, updatedProfile] = await Promise.all([
        userService.getCollaborationStatus(targetUserId),
        userService.getUserReviews(targetUserId),
        userService.getUserProfile(targetUserId)
      ]);
      setCollabStatus(updatedCollab);
      if (updatedReviews?.reviews) setReviewsData(updatedReviews.reviews);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewErrorMsg(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isCreator = profile?.role === 'creator';
  const roleLabel = isCreator ? 'Creator' : 'Freelancer';
  const roleGradient = isCreator
    ? 'from-[#FFEBAA] via-[#FDEBDE] to-[#FFF7F1] dark:from-[#382322] dark:via-[#201413] dark:to-[#19100F]'
    : 'from-[#B1C8EA] via-[#FDEBDE] to-[#FFF7F1] dark:from-[#1E3A8A]/40 dark:via-[#201413] dark:to-[#19100F]';
  const ringColor = isCreator
    ? 'border-[#382322] dark:border-[#FFEBAA]'
    : 'border-[#382322] dark:border-[#B1C8EA]';

  const ratingScore = profile?.rating != null ? Number(profile.rating).toFixed(1) : '0.0';
  const totalReviewsCount = profile?.totalReviews != null ? profile.totalReviews : reviewsData.length;

  const starLabels = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Outstanding Collaboration',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] overflow-hidden z-10 my-auto flex flex-col max-h-[90vh] text-[#261615] dark:text-[#FDEBDE]">
        
        {/* Banner Cover with Close Button */}
        <div className="relative h-28 sm:h-36 bg-[#FFEBAA] dark:bg-[#2A1A19] p-4 flex items-start justify-end shrink-0 border-b-2 border-[#382322] dark:border-[#FDEBDE]/30">
          <button
            onClick={onClose}
            className="p-2 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 hover:bg-[#FDEBDE] text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322] transition-colors cursor-pointer"
            title="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Header Profile Info Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4">
              <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] sm:w-24 sm:h-24 sm:min-w-[96px] sm:min-h-[96px] sm:max-w-[96px] sm:max-h-[96px] overflow-hidden shrink-0">
                <img
                  src={profile?.profileImage || DEFAULT_PFP}
                  alt={profile?.name || 'User avatar'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PFP;
                  }}
                  className="w-full h-full object-cover border-4 border-[#382322] dark:border-[#FDEBDE]/40 bg-[#FFFDF9] dark:bg-[#201413] shadow-[4px_4px_0_#382322]"
                />
              </div>

              <div className="mb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                    {profile?.name || 'Anonymous User'}
                  </h3>
                  <CheckCircle2 className="w-5 h-5 text-[#261615] dark:text-[#FFEBAA] shrink-0" />
                  <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 bg-[#B1C8EA] text-[#261615] border-2 border-[#382322]">
                    {roleLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] font-mono mt-0.5">
                  @{profile?.username || 'user'}
                  {profile?.title && <span className="font-sans ml-2">• {profile.title}</span>}
                </p>
              </div>
            </div>

            {/* Top Action Buttons (Message & Share) */}
            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
              {!isSelf && (
                <button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isMessaging ? 'Opening Chat...' : 'Message'}</span>
                </button>
              )}
              {isSelf && (
                <div className="px-3.5 py-1.5 bg-[#FFEBAA]/50 border-2 border-[#382322] text-xs font-bold font-mono uppercase tracking-wider text-[#261615]">
                  Your Profile
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold font-mono text-[#261615] dark:text-[#FFEBAA]">
                <Star className="w-4 h-4 fill-[#FFEBAA] text-[#382322]" />
                <span>{ratingScore}</span>
              </div>
              <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold mt-0.5">Rating Score</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#261615] dark:text-[#FDEBDE]">
                {totalReviewsCount}
              </div>
              <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold mt-0.5">Total Reviews</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#261615] dark:text-[#FFEBAA] capitalize truncate">
                {profile?.category || (isCreator ? 'Content' : 'Video Editing')}
              </div>
              <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold mt-0.5">Category</div>
            </div>
          </div>

          {/* Bio & Details */}
          {profile?.bio && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE]">About</h4>
              <p className="text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] leading-relaxed whitespace-pre-line bg-[#FFF7F1] dark:bg-[#19100F] p-3.5 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Subroles / Skills Pills */}
          {((profile?.subRoles && profile.subRoles.length > 0) || (profile?.skills && profile.skills.length > 0)) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE]">Expertise & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(profile.subRoles || []).map((sub, idx) => (
                  <span
                    key={`sub-${idx}`}
                    className="px-2.5 py-1 text-xs font-bold font-mono uppercase bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]"
                  >
                    {sub}
                  </span>
                ))}
                {(profile.skills || []).map((sk, idx) => (
                  <span
                    key={`sk-${idx}`}
                    className="px-2.5 py-1 text-xs font-bold font-mono bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1px_1px_0_#382322]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: Collaboration-Gated Rating */}
          {!isSelf && collabStatus?.collaborated && (
            <div className="p-4 sm:p-5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
                  <h4 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">Rate {profile?.name}</h4>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase text-[#261615] bg-[#FFEBAA] px-2 py-0.5 border-2 border-[#382322]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Collaborator
                </span>
              </div>

              {/* Case: Already reviewed */}
              {!collabStatus.canRate && collabStatus.existingReview && (
                <div className="p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> You already reviewed this collaborator
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= (collabStatus.existingReview.rating || 5)
                              ? 'fill-[#FFEBAA] text-[#382322]'
                              : 'text-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {collabStatus.existingReview.reviewText && (
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] italic">
                      "{collabStatus.existingReview.reviewText}"
                    </p>
                  )}
                </div>
              )}

              {/* Case: Collaborated and CAN rate! */}
              {collabStatus.canRate && (
                <form onSubmit={handleRatingSubmit} className="space-y-4 pt-1">
                  {reviewSuccessMsg && (
                    <div className="p-3 bg-emerald-100 border-2 border-emerald-800 text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{reviewSuccessMsg}</span>
                    </div>
                  )}

                  {reviewErrorMsg && (
                    <div className="p-3 bg-rose-100 border-2 border-rose-800 text-xs font-bold text-rose-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  {/* Star Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE]">
                        Overall Rating: <span className="underline decoration-[#FFEBAA] decoration-2">{starLabels[hoverRating || rating]}</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA]">
                        {(hoverRating || rating)} / 5.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => setRating(starIdx)}
                          onMouseEnter={() => setHoverRating(starIdx)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              starIdx <= (hoverRating || rating)
                                ? 'fill-[#FFEBAA] text-[#382322]'
                                : 'text-[#382322]/30 dark:text-[#FDEBDE]/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] mb-1.5">
                      Feedback & Comments
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder={`Write your honest review about collaborating with ${profile?.name || 'this user'}...`}
                      className="w-full bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 p-3 text-xs text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/60 focus:outline-none transition-colors resize-none shadow-[2px_2px_0_#382322]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {isSubmittingReview ? 'Submitting Rating...' : 'Submit Rating & Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: Past Reviews List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] flex items-center justify-between">
              <span>Reviews & Ratings ({reviewsData.length})</span>
            </h4>

            {reviewsData.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#19100F]">
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                  No public reviews recorded yet. Reviews will show here as projects complete.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsData.map((rev) => {
                  const reviewer = rev.reviewerId || {};
                  return (
                    <div
                      key={rev._id}
                      className="p-3.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={reviewer.profileImage || DEFAULT_PFP}
                            alt={reviewer.name || 'Reviewer avatar'}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_PFP;
                            }}
                            className="w-7 h-7 rounded-none object-cover border-2 border-[#382322]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">
                              {reviewer.name || 'Collaborator'}
                            </span>
                            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] ml-1.5 font-mono">
                              @{reviewer.username || 'user'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`w-3 h-3 ${
                                st <= (rev.rating || 5)
                                  ? 'fill-[#FFEBAA] text-[#382322]'
                                  : 'text-slate-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.reviewText && (
                        <p className="text-xs text-[#261615] dark:text-[#FDEBDE] leading-relaxed">
                          {rev.reviewText}
                        </p>
                      )}

                      {rev.projectId?.title && (
                        <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1 font-mono">
                          <Briefcase className="w-3 h-3" />
                          <span>Project: {rev.projectId.title}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;
