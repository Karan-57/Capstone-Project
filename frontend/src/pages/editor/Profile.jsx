import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  Film,
  Edit3,
  Play,
  UploadCloud,
  X,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PFP } from '../../constants/assets';
import api from '../../services/api';

export const EditorProfile = () => {
  const navigate = useNavigate();
  const { editorUser, isAuthenticated, isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('portfolio');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [realReviews, setRealReviews] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showreelData, setShowreelData] = useState(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [productionsDone, setProductionsDone] = useState(0);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  React.useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;

    const userId = editorUser?._id || editorUser?.id;
    if (userId) {
      api.get(`/api/users/${userId}/get-review`).then((res) => {
        if (res.data?.reviews) {
          setRealReviews(res.data.reviews);
        }
      }).catch(() => {});
    }

    // Load dynamic portfolio and showreel
    api.get('/api/portfolio/my').then((res) => {
      const p = res.data?.portfolio;
      if (p) {
        if (p.showreelUrl || p.showreelVideoUrl) {
          setShowreelData({
            url: p.showreelUrl || p.showreelVideoUrl,
            title: p.showreelTitle || p.title || 'Featured Showreel'
          });
        }
        const items = p.portfolioItems;
        if (Array.isArray(items)) {
          setPortfolioItems(items.map(it => ({
            id: it._id || it.id || Date.now(),
            title: it.title,
            runtime: it.runtime || '03:15',
            category: it.category || it.projectType || 'Editing Cut',
            client: it.client || 'Client Project',
            thumbnail: it.thumbnail || it.thumbnailUrl || '',
            videoUrl: it.videoUrl || '',
            tags: it.tags || it.skillsUsed || ['Editing'],
            views: it.views || '1',
            description: it.description || ''
          })));
        }
      }
    }).catch(() => {
      setPortfolioItems([]);
    }).finally(() => {
      setIsLoadingPortfolio(false);
    });

    // Compute dynamic earnings and completed productions
    Promise.all([
      api.get('/api/application/my?status=accepted').catch(() => ({ data: { applications: [] } })),
      api.get('/api/workspace').catch(() => ({ data: { workspaces: [] } })),
    ]).then(([appsRes, wsRes]) => {
      const apps = appsRes.data?.applications || [];
      const workspaces = wsRes.data?.workspaces || [];
      const completedWsProjectIds = new Set(
        workspaces.filter(w => w.status === 'completed').map(w => w.projectId?._id || w.projectId)
      );

      let earned = 0;
      let completedCount = 0;

      (apps || []).forEach(app => {
        const numericBid = typeof app.bidAmount === 'number'
          ? app.bidAmount
          : (parseInt(String(app.bidAmount || 0).replace(/[^0-9]/g, ''), 10) || 0);
        const isCompleted = completedWsProjectIds.has(app.projectId);

        if (isCompleted) {
          earned += numericBid;
          completedCount += 1;
        }
      });

      setTotalEarned(earned);
      setProductionsDone(completedCount);
    }).catch(() => {});
  }, [isAuthenticated, isAuthLoading, editorUser?._id, editorUser?.id]);

  const [newCutTitle, setNewCutTitle] = useState('');
  const [newCutCategory, setNewCutCategory] = useState('YouTube Longform');
  const [newCutVideoUrl, setNewCutVideoUrl] = useState('');
  const [newCutThumbnailUrl, setNewCutThumbnailUrl] = useState('');
  const [newCutDescription, setNewCutDescription] = useState('');

  const handleAddNewCut = async (e) => {
    e.preventDefault();
    if (!newCutTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newCutTitle.trim(),
      runtime: '03:15',
      category: newCutCategory,
      client: 'Direct Upload',
      thumbnail: newCutThumbnailUrl.trim() || '',
      videoUrl: newCutVideoUrl.trim() || '',
      tags: ['Video Edit'],
      views: '1',
      description: newCutDescription.trim() || 'Custom portfolio video cut.'
    };

    const nextItems = [newItem, ...portfolioItems];
    setPortfolioItems(nextItems);
    setShowUploadModal(false);
    setNewCutTitle('');
    setNewCutVideoUrl('');
    setNewCutThumbnailUrl('');
    setNewCutDescription('');

    try {
      await api.patch('/api/portfolio', { portfolioItems: nextItems }).catch(async () => {
        await api.post('/api/portfolio', {
          title: editorUser?.name ? `${editorUser.name}'s Portfolio` : 'Video Portfolio',
          portfolioItems: nextItems,
        });
      });
    } catch (err) {
      console.warn('Portfolio sync warning:', err.message);
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title={`${editorUser?.name || 'Editor'} - Showreel & Portfolio`}
        description={`Video editing portfolio, showreels, and client ratings for ${editorUser?.name || 'editor'} on Collabo.`}
      />

      {/* Profile Card Header */}
      <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 bg-[#FFEBAA] dark:bg-[#2D1C1B] border-b-2 border-[#382322] dark:border-[#FDEBDE]/20" />

        <div className="relative pt-10 sm:pt-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <img
              src={editorUser?.profileImage || editorUser?.avatar || DEFAULT_PFP}
              alt={editorUser?.name ? `${editorUser.name} profile photo` : 'Editor profile photo'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#382322] dark:border-[#FFEBAA] shadow-[3px_3px_0_#382322] bg-[#FAF0E6] shrink-0"
            />
            <div className="mb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">{editorUser?.name || 'Editor'}</h2>
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-1">
                {editorUser?.title || (editorUser?.role === 'freelancer' ? 'Freelancer Specialist' : 'Video Editor')}
              </p>
              {Array.isArray(editorUser?.subRoles) && editorUser.subRoles.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2 justify-center sm:justify-start">
                  {editorUser.subRoles.map((subRole, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] tracking-wide"
                    >
                      {subRole}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={Edit3}
              onClick={() => navigate('/editor/edit-profile')}
              className="w-full sm:w-auto"
            >
              Edit Profile & Showreel
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 sm:mt-7 pt-5 border-t-2 border-[#382322]/15 dark:border-[#FDEBDE]/20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-lg sm:text-xl font-black font-mono text-[#261615] dark:text-[#FDEBDE]">
              {editorUser?.rating != null ? `${editorUser.rating} / 5.0` : '0 / 5.0'}
            </div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>({editorUser?.totalReviews != null ? editorUser.totalReviews : realReviews.length} reviews)</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              ₹{totalEarned.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Earned on Collabo</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-lg sm:text-xl font-black font-mono text-[#261615] dark:text-[#FFEBAA]">
              {editorUser?.speed != null ? `${editorUser.speed} / 10` : '10 / 10'}
            </div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Speed Rating</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-lg sm:text-xl font-black font-mono text-[#261615] dark:text-[#FDEBDE]">
              {productionsDone}
            </div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Productions Done</div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/20 pb-3 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {[
              { id: 'portfolio', label: `Portfolio (${portfolioItems.length})`, icon: Film },
              { id: 'showreel', label: 'Featured Showreel', icon: Sparkles },
              { id: 'reviews', label: `Reviews (${editorUser?.totalReviews || realReviews.length || 0})`, icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFEBAA] border-[#382322] text-[#261615] shadow-[2px_2px_0_#382322]'
                      : 'bg-[#FFF7F1] dark:bg-[#201413] border-[#382322]/20 dark:border-[#FDEBDE]/20 text-[#5C3A38] dark:text-[#D4B8A8] hover:border-[#382322]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={UploadCloud}
            onClick={() => setShowUploadModal(true)}
            className="self-start sm:self-auto cursor-pointer"
          >
            Upload Sample Cut
          </Button>
        </div>

        {/* TAB CONTENT: Portfolio & Works */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {portfolioItems.length === 0 ? (
              <div className="bg-[#FFF7F1] dark:bg-[#201413] p-12 text-center border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] mx-auto">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black font-serif text-[#261615] dark:text-[#FDEBDE]">No Portfolio Cuts Uploaded Yet</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-md mx-auto">
                  Showcase your editing skills to creators by uploading high-retention cuts, reels, and video trailers.
                </p>
                <Button
                  variant="primary"
                  icon={UploadCloud}
                  onClick={() => setShowUploadModal(true)}
                  className="mt-2"
                >
                  Upload Your First Video Cut
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FFF7F1] dark:bg-[#201413] rounded-2xl overflow-hidden border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 group flex flex-col justify-between"
                  >
                    {/* Thumbnail with Play Overlay */}
                    <div
                      onClick={() => setPlayingVideo(item)}
                      className="relative aspect-video cursor-pointer overflow-hidden bg-[#FAF0E6] dark:bg-[#19100F] border-b-2 border-[#382322] dark:border-[#FDEBDE]/20 flex items-center justify-center"
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title ? `${item.title} video thumbnail` : 'Portfolio video thumbnail'}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF0E6] dark:bg-[#19100F] text-[#5C3A38] dark:text-[#D4B8A8] p-4">
                          <Film className="w-10 h-10 mb-2 opacity-60" />
                          <span className="text-[11px] font-mono font-bold">Video Preview</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-[#261615] ml-0.5" />
                        </div>
                      </div>

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#261615]/90 border border-[#FFEBAA]/40 text-[11px] font-mono font-bold text-[#FFEBAA]">
                        {item.runtime}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#261615] dark:text-[#FFEBAA] uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE] line-clamp-1 mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Tags & Play Button */}
                      <div className="pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322]/20 dark:border-[#FDEBDE]/20 text-[#261615] dark:text-[#FDEBDE]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => setPlayingVideo(item)}
                          className="text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Watch <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Featured Showreel */}
        {activeTab === 'showreel' && (
          <div className="bg-[#FFF7F1] dark:bg-[#201413] p-5 sm:p-6 md:p-8 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black font-serif text-[#261615] dark:text-[#FDEBDE]">
                  {showreelData?.title || 'Featured Production Showreel'}
                </h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">High-retention editing samples and master visual reels</p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                icon={Edit3}
                onClick={() => navigate('/editor/edit-profile')}
                className="self-start sm:self-auto"
              >
                {showreelData?.url ? 'Update Showreel' : 'Add Showreel'}
              </Button>
            </div>

            {showreelData?.url ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] relative">
                {showreelData.url.includes('youtube.com') || showreelData.url.includes('youtu.be') || showreelData.url.includes('vimeo.com') ? (
                  <iframe
                    src={
                      showreelData.url.includes('watch?v=')
                        ? showreelData.url.replace('watch?v=', 'embed/')
                        : showreelData.url
                    }
                    title="Showreel Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={showreelData.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 space-y-3 bg-[#FAF0E6]/50 dark:bg-[#19100F]/50">
                <div className="w-12 h-12 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] mx-auto">
                  <Film className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE]">No showreel video added yet</h4>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm mx-auto">
                  Add a YouTube, Vimeo, or direct MP4 link in your profile to showcase your best visual work to creators.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => navigate('/editor/edit-profile')}
                  className="mt-2"
                >
                  Configure Showreel Link
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Client Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {realReviews.length === 0 ? (
              <div className="bg-[#FFF7F1] dark:bg-[#201413] p-12 text-center border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322]">
                <div className="w-10 h-10 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center mx-auto mb-3 text-[#261615]">
                  <Star className="w-5 h-5 text-amber-600 fill-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE]">No reviews yet</h4>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-mono">
                  Reviews and ratings from completed creator productions will appear here.
                </p>
              </div>
            ) : (
              realReviews.map((rev, idx) => (
                <div key={rev._id || idx} className="bg-[#FFF7F1] dark:bg-[#201413] p-4 sm:p-5 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE]">
                        {rev.reviewerId?.name || rev.client || 'unknown'}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#FFEBAA]">
                        {rev.projectId?.title || rev.project || 'unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rev.rating != null ? rev.rating : 5}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#261615] dark:text-[#FDEBDE] italic leading-relaxed">"{rev.comment || ''}"</p>
                  <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PLAYABLE VIDEO MODAL PLAYER */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-[#FFF7F1] dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 overflow-hidden shadow-[6px_6px_0_#382322]">
            <div className="p-4 border-b-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-center justify-between bg-[#FFEBAA] dark:bg-[#2D1C1B]">
              <div className="min-w-0 pr-3">
                <h4 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE] truncate">{playingVideo.title}</h4>
                <p className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8] truncate">{playingVideo.category} • Client: {playingVideo.client}</p>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1A1110] border border-[#382322]/30 text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FAF0E6] shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={playingVideo.videoUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PORTFOLIO CUT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#FFF7F1] dark:bg-[#201413] p-5 sm:p-7 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[6px_6px_0_#382322] space-y-5 max-h-[90vh] overflow-y-auto text-[#261615] dark:text-[#FDEBDE]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/20">
              <div>
                <h3 className="text-lg font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Upload Sample Cut</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Add a new video sample to showcase to creators</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1A1110] border border-[#382322]/30 text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FAF0E6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewCut} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Tech Hardware Review Cut"
                  value={newCutTitle}
                  onChange={(e) => setNewCutTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1">Video Style / Category</label>
                <select
                  value={newCutCategory}
                  onChange={(e) => setNewCutCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all cursor-pointer"
                >
                  <option>YouTube Longform</option>
                  <option>Short Form (Reels/TikTok)</option>
                  <option>Travel / Cinematic</option>
                  <option>Commercial / Ad</option>
                  <option>Gaming / Stream</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1">Video URL (MP4 / Direct Link)</label>
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={newCutVideoUrl}
                  onChange={(e) => setNewCutVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or ImageKit URL"
                  value={newCutThumbnailUrl}
                  onChange={(e) => setNewCutThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your editing style, effects, and color grading..."
                  value={newCutDescription}
                  onChange={(e) => setNewCutDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] resize-none transition-all"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3">
                <Button variant="outline" onClick={() => setShowUploadModal(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={UploadCloud} className="w-full sm:w-auto">
                  Save Sample Cut
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Footer */}
      <Footer />
    </div>
  );
};

export default EditorProfile;
