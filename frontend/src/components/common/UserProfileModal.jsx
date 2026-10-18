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
    ? 'from-[#DDD9CE] via-[#F0EDE5] to-[#F7F5F0]'
    : 'from-[#E5E0D7] via-[#F0EDE5] to-[#F7F5F0]';
  const ringColor = 'border-white ring-[#DDD9CE]';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#3C2415]/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E0D7] rounded-3xl shadow-xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh] text-[#3C2415]">
        
        {/* Banner Cover with Close Button */}
        <div className={`relative h-28 sm:h-36 bg-gradient-to-r ${roleGradient} p-4 flex items-start justify-end shrink-0 border-b border-[#E5E0D7]`}>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-[#77736D] hover:text-[#3C2415] backdrop-blur-sm transition-colors border border-[#E5E0D7]"
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
              <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] sm:w-24 sm:h-24 sm:min-w-[96px] sm:min-h-[96px] sm:max-w-[96px] sm:max-h-[96px] rounded-2xl overflow-hidden shrink-0">
                <img
                  src={profile?.profileImage || DEFAULT_PFP}
                  alt={profile?.name || 'User avatar'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PFP;
                  }}
                  className={`w-full h-full rounded-2xl object-cover border-4 bg-white shadow-md ring-4 ${ringColor}`}
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#55745C] ring-2 ring-white z-10"></span>
              </div>

              <div className="mb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3C2415] truncate">
                    {profile?.name || 'Anonymous User'}
                  </h3>
                  <CheckCircle2 className="w-5 h-5 text-[#55745C] shrink-0" />
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border bg-[#F0EDE5] text-[#3C2415] border-[#DDD9CE]">
                    {roleLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#77736D] font-mono mt-0.5">
                  @{profile?.username || 'user'}
                  {profile?.title && <span className="text-[#77736D] font-sans ml-2">• {profile.title}</span>}
                </p>
              </div>
            </div>

            {/* Top Action Buttons (Message & Share) */}
            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
              {!isSelf && (
                <button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#F7F5F0] bg-[#3C2415] hover:bg-[#2A180E] shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isMessaging ? 'Opening Chat...' : 'Message'}</span>
                </button>
              )}
              {isSelf && (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#F0EDE5] border border-[#DDD9CE] text-xs font-medium text-[#3C2415]">
                  Your Profile
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F0EDE5] border border-[#E5E0D7] text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{ratingScore}</span>
              </div>
              <div className="text-[11px] text-[#77736D] mt-0.5">Rating Score</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#3C2415]">
                {totalReviewsCount}
              </div>
              <div className="text-[11px] text-[#77736D] mt-0.5">Total Reviews</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#3C2415] capitalize truncate">
                {profile?.category || (isCreator ? 'Content' : 'Video Editing')}
              </div>
              <div className="text-[11px] text-[#77736D] mt-0.5">Category</div>
            </div>
          </div>

          {/* Bio & Details */}
          {profile?.bio && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About</h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Subroles / Skills Pills */}
          {((profile?.subRoles && profile.subRoles.length > 0) || (profile?.skills && profile.skills.length > 0)) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#77736D] uppercase tracking-wider">Expertise & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(profile.subRoles || []).map((sub, idx) => (
                  <span
                    key={`sub-${idx}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0EDE5] text-[#3C2415] border border-[#DDD9CE]"
                  >
                    {sub}
                  </span>
                ))}
                {(profile.skills || []).map((sk, idx) => (
                  <span
                    key={`sk-${idx}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-[#3C2415] border border-[#E5E0D7]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: Collaboration-Gated Rating
              Only shown if the users have actually worked together on a project! */}
          {!isSelf && collabStatus?.collaborated && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F0EDE5]/60 border border-[#E5E0D7] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h4 className="text-sm font-bold text-[#3C2415]">Rate {profile?.name}</h4>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#55745C] bg-[#55745C]/10 px-2 py-0.5 rounded-md border border-[#55745C]/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Collaborator
                </span>
              </div>

              {/* Case: Already reviewed */}
              {!collabStatus.canRate && collabStatus.existingReview && (
                <div className="p-4 rounded-xl bg-white border border-[#E5E0D7] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#55745C] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#55745C]" /> You already reviewed this collaborator
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= (collabStatus.existingReview.rating || 5)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-[#DDD9CE]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {collabStatus.existingReview.reviewText && (
                    <p className="text-xs text-[#3C2415] italic">
                      "{collabStatus.existingReview.reviewText}"
                    </p>
                  )}
                </div>
              )}

              {/* Case: Collaborated and CAN rate! (Rate person directly without asking for project) */}
              {collabStatus.canRate && (
                <form onSubmit={handleRatingSubmit} className="space-y-4 pt-1">
                  {reviewSuccessMsg && (
                    <div className="p-3 rounded-xl bg-[#55745C]/10 border border-[#55745C]/30 text-xs text-[#55745C] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#55745C]" />
                      <span>{reviewSuccessMsg}</span>
                    </div>
                  )}

                  {reviewErrorMsg && (
                    <div className="p-3 rounded-xl bg-[#A34F45]/10 border border-[#A34F45]/30 text-xs text-[#A34F45] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#A34F45]" />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  {/* Star Selector */}
                  <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#3C2415]">
                      Overall Rating: <span className="text-amber-600 font-semibold">{starLabels[hoverRating || rating]}</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-600">
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
                        className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            starIdx <= (hoverRating || rating)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-[#DDD9CE] hover:text-[#77736D]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-medium text-[#3C2415] mb-1.5">
                    Feedback & Comments
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={`Write your honest review about collaborating with ${profile?.name || 'this user'}...`}
                    className="w-full bg-white border border-[#E5E0D7] rounded-xl p-3 text-xs text-[#3C2415] placeholder-[#77736D] focus:outline-none focus:border-[#3C2415] transition-colors resize-none"
                  />
                </div>

                {/* Optional Detailed Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {!isCreator ? (
                    <>
                      <div>
                        <div className="flex justify-between text-[11px] text-[#77736D] mb-1">
                          <span>Delivery Speed</span>
                          <span className="text-[#3C2415] font-mono">{speed}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={speed}
                          onChange={(e) => setSpeed(Number(e.target.value))}
                          className="w-full accent-[#3C2415] h-1.5 bg-[#DDD9CE] rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-[#77736D] mb-1">
                          <span>Quality of Cut</span>
                          <span className="text-[#3C2415] font-mono">{quality}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full accent-[#3C2415] h-1.5 bg-[#DDD9CE] rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between text-[11px] text-[#77736D] mb-1">
                          <span>Boundary Respect</span>
                          <span className="text-[#3C2415] font-mono">{boundaryRespect}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={boundaryRespect}
                          onChange={(e) => setBoundaryRespect(Number(e.target.value))}
                          className="w-full accent-[#3C2415] h-1.5 bg-[#DDD9CE] rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-[#77736D] mb-1">
                          <span>Communication Behaviour</span>
                          <span className="text-[#3C2415] font-mono">{behaviour}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={behaviour}
                          onChange={(e) => setBehaviour(Number(e.target.value))}
                          className="w-full accent-[#3C2415] h-1.5 bg-[#DDD9CE] rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#F7F5F0] bg-[#3C2415] hover:bg-[#2A180E] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting Rating...' : 'Submit Rating & Review'}
                </button>
              </form>
            )}
          </div>
          )}

          {/* SECTION: Past Reviews List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-[#77736D] uppercase tracking-wider flex items-center justify-between">
              <span>Reviews & Ratings ({reviewsData.length})</span>
            </h4>

            {reviewsData.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#F0EDE5] border border-[#E5E0D7]">
                <p className="text-xs text-[#77736D]">
                  No public reviews recorded yet. Reviews will show here as projects complete.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviewsData.map((rev) => {
                  const reviewer = rev.reviewerId || {};
                  return (
                    <div
                      key={rev._id}
                      className="p-3.5 rounded-xl bg-[#F0EDE5]/50 border border-[#E5E0D7] space-y-2"
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
                            className="w-7 h-7 rounded-full object-cover border border-[#E5E0D7]"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#3C2415]">
                              {reviewer.name || 'Collaborator'}
                            </span>
                            <span className="text-[10px] text-[#77736D] ml-1.5 font-mono">
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
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-[#DDD9CE]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.reviewText && (
                        <p className="text-xs text-[#3C2415] leading-relaxed">
                          {rev.reviewText}
                        </p>
                      )}

                      {rev.projectId?.title && (
                        <div className="text-[10px] text-[#77736D] flex items-center gap-1">
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
