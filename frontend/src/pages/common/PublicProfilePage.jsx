import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Star,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { messageService } from '../../services/messageService';
import { DEFAULT_PFP } from '../../constants/assets';
import SEO from '../../components/common/SEO';
import Footer from '../../components/common/Footer';

export const PublicProfilePage = ({ role = 'creator' }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, role: userRole } = useAuth();
  const currentRole = userRole || role;
  const currentUserId = currentUser?._id || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [collabStatus, setCollabStatus] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isMessaging, setIsMessaging] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [speed, setSpeed] = useState(9);
  const [quality, setQuality] = useState(9);
  const [behaviour, setBehaviour] = useState(10);
  const [responseTime, setResponseTime] = useState(9);
  const [boundaryRespect, setBoundaryRespect] = useState(10);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const isSelf = currentUserId && userId && String(currentUserId) === String(userId);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const loadData = async () => {
      try {
        const [userRes, reviewsRes, collabRes] = await Promise.allSettled([
          userService.getUserProfile(userId),
          userService.getUserReviews(userId),
          currentUserId && !isSelf ? userService.getCollaborationStatus(userId) : Promise.resolve(null),
        ]);

        if (isMounted) {
          if (userRes.status === 'fulfilled' && userRes.value) {
            setProfile(userRes.value);
          } else {
            setLoadError('User profile not found or could not be loaded.');
          }

          if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.reviews) {
            setReviewsData(reviewsRes.value.reviews);
          }

          if (collabRes.status === 'fulfilled' && collabRes.value) {
            setCollabStatus(collabRes.value);
          }
        }
      } catch (err) {
        console.error('Failed to load public profile:', err);
        if (isMounted) setLoadError(err.message || 'Error loading profile');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId, currentUserId, isSelf]);

  const handleMessage = async () => {
    if (isSelf || !userId) return;
    try {
      setIsMessaging(true);
      const conv = await messageService.getOrCreatePrivateConversation(userId);
      const messagesPath = currentRole === 'creator' ? '/creator/messages' : '/editor/messages';
      navigate(messagesPath, {
        state: {
          conversationId: conv?._id || conv?.id,
          recipientUser: profile,
        },
      });
    } catch (err) {
      console.error('Failed to open message conversation:', err);
      alert('Could not start conversation: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsMessaging(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!collabStatus?.canRate) return;
    setIsSubmittingReview(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const payload = {
        projectId: collabStatus?.eligibleProject?._id || null,
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

      await userService.rateUser(userId, payload);
      setReviewSuccessMsg('Review submitted successfully! Thank you for rating.');

      // Refresh data
      const [updatedCollab, updatedReviews, updatedProfile] = await Promise.all([
        userService.getCollaborationStatus(userId),
        userService.getUserReviews(userId),
        userService.getUserProfile(userId),
      ]);
      setCollabStatus(updatedCollab);
      if (updatedReviews?.reviews) setReviewsData(updatedReviews.reviews);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewErrorMsg(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const starLabels = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Outstanding Collaboration',
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20" />
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-[#FAF0E6] dark:bg-[#19100F] rounded-md" />
            <div className="h-4 w-32 bg-[#FAF0E6] dark:bg-[#19100F] rounded-md" />
          </div>
        </div>
        <div className="h-24 rounded-2xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4 text-[#261615] dark:text-[#FDEBDE]">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-600 shadow-[2px_2px_0_#382322]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Profile Not Found</h2>
        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm mx-auto">
          {loadError || 'The profile you are looking for does not exist or may have been removed.'}
        </p>
        <button
          onClick={() => navigate(`/${currentRole}/search`)}
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] hover:bg-[#FFEBAA]/80 transition-all cursor-pointer"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isCreator = profile.role === 'creator';
  const roleLabel = isCreator ? 'Creator Studio' : 'Freelancer Specialist';

  const ratingScore = profile.rating != null ? Number(profile.rating).toFixed(1) : '0.0';
  const totalReviewsCount = profile.totalReviews != null ? profile.totalReviews : reviewsData.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full px-2 sm:px-4 pb-12 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title={`${profile.name} (@${profile.username}) - Collabo Profile`}
        description={profile.bio || `View ${profile.name}'s profile on Collabo.`}
      />

      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
          collabo.app/@{profile.username}
        </span>
      </div>

      {/* Profile Card Banner */}
      <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] overflow-hidden">
        {/* Banner Cover */}
        <div className="h-32 sm:h-44 bg-[#FFEBAA] dark:bg-[#2D1C1B] relative p-6 flex items-end justify-between border-b-2 border-[#382322] dark:border-[#FDEBDE]/20">
          <div className="absolute top-4 right-4">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-wider border-2 border-[#382322] shadow-[2px_2px_0_#382322] bg-[#B1C8EA] text-[#261615]">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header Row: Avatar, Names, Message CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4 min-w-0">
              {/* Avatar */}
              <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] sm:w-24 sm:h-24 sm:min-w-[96px] sm:min-h-[96px] sm:max-w-[96px] sm:max-h-[96px] rounded-full overflow-hidden shrink-0 border-4 border-[#382322] dark:border-[#FFEBAA] shadow-[3px_3px_0_#382322] bg-[#FAF0E6]">
                <img
                  src={profile.profileImage || DEFAULT_PFP}
                  alt={profile.name ? `${profile.name} photo` : 'User profile photo'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PFP;
                  }}
                  className="w-full h-full object-cover block rounded-full"
                />
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#382322] z-10" />
              </div>

              <div className="mb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] truncate">
                    {profile.name}
                  </h1>
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] font-mono mt-0.5 truncate">
                  @{profile.username}
                  {profile.title && <span className="font-sans ml-2 text-[#261615] dark:text-[#FDEBDE] font-semibold">• {profile.title}</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full sm:w-auto self-end sm:self-auto flex items-center gap-2.5">
              {!isSelf && (
                <button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 border-2 border-[#382322] shadow-[3px_3px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isMessaging ? 'Opening Chat...' : 'Message'}</span>
                </button>
              )}
              {isSelf && (
                <button
                  onClick={() => navigate(isCreator ? '/creator/edit-profile' : '/editor/edit-profile')}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA] transition-all cursor-pointer"
                >
                  Edit My Profile
                </button>
              )}
            </div>
          </div>

          {/* Real Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-black font-mono text-amber-700 dark:text-amber-300">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{ratingScore}</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Rating Score</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-mono text-[#261615] dark:text-[#FDEBDE]">
                {totalReviewsCount}
              </div>
              <div className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Total Reviews</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-serif text-[#261615] dark:text-[#FFEBAA] capitalize truncate">
                {profile.category || (isCreator ? 'Content' : 'Video Editing')}
              </div>
              <div className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Category</div>
            </div>
          </div>

          {/* About / Bio */}
          {profile.bio && (
            <div className="space-y-1.5 pt-1">
              <h3 className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] uppercase tracking-wider">About</h3>
              <p className="text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] leading-relaxed whitespace-pre-line bg-white dark:bg-[#1A1110] p-4 rounded-xl border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills / Subroles */}
          {((profile.subRoles && profile.subRoles.length > 0) || (profile.skills && profile.skills.length > 0)) && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] uppercase tracking-wider">Expertise & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.subRoles || []).map((sub, idx) => (
                  <span
                    key={`sub-${idx}`}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322]"
                  >
                    {sub}
                  </span>
                ))}
                {(profile.skills || []).map((sk, idx) => (
                  <span
                    key={`sk-${idx}`}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#FAF0E6] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-sm"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: Collaboration-Gated Rating */}
          {!isSelf && collabStatus?.collaborated && (
            <div className="p-5 rounded-2xl bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Rate {profile.name}</h3>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-600/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Collaborator
                </span>
              </div>

              {/* Case A: Already submitted review */}
              {!collabStatus.canRate && collabStatus.existingReview && (
                <div className="p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> You already reviewed this collaborator
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= (collabStatus.existingReview.rating || 5)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {collabStatus.existingReview.reviewText && (
                    <p className="text-xs text-[#261615] dark:text-[#FDEBDE] italic">
                      "{collabStatus.existingReview.reviewText}"
                    </p>
                  )}
                </div>
              )}

              {/* Case B: Can Rate Directly */}
              {collabStatus.canRate && (
                <form onSubmit={handleRatingSubmit} className="space-y-4 pt-1">
                  {reviewSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{reviewSuccessMsg}</span>
                    </div>
                  )}

                  {reviewErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border-2 border-rose-500 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  {/* Star Rating Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">
                        Overall Rating: <span className="text-amber-700 dark:text-amber-300">{starLabels[hoverRating || rating]}</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
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
                                : 'text-stone-300 dark:text-stone-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] mb-1.5">
                      Feedback & Comments
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder={`Share your experience collaborating with ${profile.name}...`}
                      className="w-full bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl p-3 text-xs text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#5C3A38]/50 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all resize-none"
                    />
                  </div>

                  {/* Metric Breakdown Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {!isCreator ? (
                      <>
                        <div>
                          <div className="flex justify-between text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mb-1">
                            <span>Delivery Speed</span>
                            <span className="text-[#261615] dark:text-[#FDEBDE]">{speed}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-full accent-[#382322] dark:accent-[#FFEBAA] h-2 bg-[#FAF0E6] dark:bg-[#19100F] rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mb-1">
                            <span>Quality of Cut</span>
                            <span className="text-[#261615] dark:text-[#FDEBDE]">{quality}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full accent-[#382322] dark:accent-[#FFEBAA] h-2 bg-[#FAF0E6] dark:bg-[#19100F] rounded-lg cursor-pointer"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mb-1">
                            <span>Boundary Respect</span>
                            <span className="text-[#261615] dark:text-[#FDEBDE]">{boundaryRespect}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={boundaryRespect}
                            onChange={(e) => setBoundaryRespect(Number(e.target.value))}
                            className="w-full accent-[#382322] dark:accent-[#FFEBAA] h-2 bg-[#FAF0E6] dark:bg-[#19100F] rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mb-1">
                            <span>Communication Behaviour</span>
                            <span className="text-[#261615] dark:text-[#FDEBDE]">{behaviour}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={behaviour}
                            onChange={(e) => setBehaviour(Number(e.target.value))}
                            className="w-full accent-[#382322] dark:accent-[#FFEBAA] h-2 bg-[#FAF0E6] dark:bg-[#19100F] rounded-lg cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 rounded-xl font-mono font-bold text-xs text-[#261615] bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 border-2 border-[#382322] shadow-[3px_3px_0_#382322] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting Rating...' : 'Submit Rating & Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: Past Reviews List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] uppercase tracking-wider">
              Reviews & Ratings ({reviewsData.length})
            </h3>

            {reviewsData.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
                <p className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
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
                      className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={reviewer.profileImage || DEFAULT_PFP}
                            alt={reviewer.name || 'Reviewer avatar'}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_PFP;
                            }}
                            className="w-7 h-7 rounded-full object-cover border-2 border-[#382322] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate block">
                              {reviewer.name || 'Collaborator'}
                            </span>
                            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                              @{reviewer.username || 'user'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-amber-500">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`w-3 h-3 ${
                                st <= (rev.rating || 5)
                                  ? 'fill-current'
                                  : 'text-stone-300 dark:text-stone-600'
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
                        <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono flex items-center gap-1">
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

      <Footer />
    </div>
  );
};

export default PublicProfilePage;
