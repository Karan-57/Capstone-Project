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
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PFP } from '../../constants/assets';
import api from '../../services/api';

export const EditorProfile = () => {
  const navigate = useNavigate();
  const { editorUser } = useAuth();

  const [activeTab, setActiveTab] = useState('portfolio');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [realReviews, setRealReviews] = useState([]);

  React.useEffect(() => {
    const userId = editorUser?._id || editorUser?.id;
    if (userId) {
      api.get(`/api/users/${userId}/get-review`).then((res) => {
        if (res.data?.reviews) {
          setRealReviews(res.data.reviews);
        }
      }).catch(() => {});
    }
  }, [editorUser?._id, editorUser?.id]);

  // Portfolio items with playable sample edits
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 1,
      title: 'Cinematic Iceland 4K Drone & Color Grade Reel',
      runtime: '02:18',
      category: 'Travel / Cinematic',
      client: 'Nomad Stories',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      tags: ['DaVinci Resolve', '4K 60fps', 'ACES Rec.709'],
      views: '12.4K',
      description: 'Full color grading and natural environmental sound design recorded with binaural mics.'
    },
    {
      id: 2,
      title: 'High-Retention TikTok / Instagram Reels Compilation',
      runtime: '00:58',
      category: 'Short Form',
      client: 'Sarah Jenkins',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      tags: ['After Effects', 'Alex Hormozi Style', 'Kinetic Typography'],
      views: '84.2K',
      description: 'Dynamic zoom transitions, sfx riser drops, and color-coded subtitles.'
    },
    {
      id: 3,
      title: 'Future of Robotics & Autonomous AI (18-Min Cut)',
      runtime: '18:34',
      category: 'YouTube Documentary',
      client: 'Nexus Media Corp',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      tags: ['Premiere Pro', 'Audio Restoration', 'Vox-Style 2D'],
      views: '240K',
      description: 'Long-form narrative pacing keeping retention above 58% throughout 18 minutes.'
    }
  ]);

  const [newCutTitle, setNewCutTitle] = useState('');
  const [newCutCategory, setNewCutCategory] = useState('YouTube Longform');

  const handleAddNewCut = (e) => {
    e.preventDefault();
    if (!newCutTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newCutTitle,
      runtime: '03:15',
      category: newCutCategory,
      client: 'Direct Upload',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      tags: ['Adobe Premiere Pro', 'Sound Design'],
      views: '1',
      description: 'Newly uploaded sample editing cut.'
    };

    setPortfolioItems([newItem, ...portfolioItems]);
    setShowUploadModal(false);
    setNewCutTitle('');
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Profile Card Header */}
      <div className="glass-card p-5 sm:p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/20"></div>

        <div className="relative pt-10 sm:pt-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <img
              src={editorUser?.profileImage || editorUser?.avatar || DEFAULT_PFP}
              alt={editorUser?.name || 'unknown'}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#0F1420] shadow-2xl shrink-0"
            />
            <div className="mb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{editorUser.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {editorUser.title || 'Video Editor'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              variant="primary"
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
        <div className="mt-6 sm:mt-7 pt-5 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-2 sm:p-0">
            <div className="text-lg sm:text-xl font-bold text-white">
              {editorUser?.rating != null ? `${editorUser.rating} / 5.0` : '0 / 5.0'}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>({editorUser?.totalReviews != null ? editorUser.totalReviews : 0} reviews)</span>
            </div>
          </div>
          <div className="p-2 sm:p-0">
            <div className="text-lg sm:text-xl font-bold text-emerald-400">999</div>
            <div className="text-xs text-slate-400 mt-0.5">Earned on Collabo</div>
          </div>
          <div className="p-2 sm:p-0">
            <div className="text-lg sm:text-xl font-bold text-purple-400">
              {editorUser?.speed != null ? `${editorUser.speed} / 10` : '0 / 10'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Speed Rating</div>
          </div>
          <div className="p-2 sm:p-0">
            <div className="text-lg sm:text-xl font-bold text-white">999</div>
            <div className="text-xs text-slate-400 mt-0.5">Productions Done</div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1">
            {[
              { id: 'portfolio', label: `Portfolio (${portfolioItems.length})`, icon: Film },
              { id: 'showreel', label: 'Featured Showreel', icon: Sparkles },
              { id: 'reviews', label: `Reviews (${editorUser?.totalReviews || realReviews.length || 0})`, icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="subtle"
            size="sm"
            icon={UploadCloud}
            onClick={() => setShowUploadModal(true)}
            className="bg-[#182030] hover:bg-purple-900/30 text-purple-200 border-purple-500/30 self-start sm:self-auto"
          >
            Upload Sample Cut
          </Button>
        </div>

        {/* TAB CONTENT: Portfolio & Works */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {portfolioItems.length === 0 ? (
              <div className="glass-card p-12 text-center border border-white/[0.08] rounded-2xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Portfolio Cuts Uploaded Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
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
                    className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] hover:border-purple-500/40 transition-all duration-200 group flex flex-col justify-between"
                  >
                    {/* Thumbnail with Play Overlay */}
                    <div
                      onClick={() => setPlayingVideo(item)}
                      className="relative aspect-video cursor-pointer overflow-hidden bg-slate-900"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-950/80 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono font-bold text-white">
                        {item.runtime}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Tags & Play Button */}
                      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[10px] rounded-md bg-white/[0.04] text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => setPlayingVideo(item)}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          Watch <Play className="w-3 h-3 fill-purple-400" />
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
          <div className="glass-card p-5 sm:p-6 md:p-8 rounded-2xl border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">Featured Production Showreel</h3>
                <p className="text-xs text-slate-400 mt-0.5">High-retention editing samples and master visual reels</p>
              </div>
              <Button
                variant="subtle"
                size="xs"
                icon={Edit3}
                onClick={() => navigate('/editor/edit-profile')}
                className="self-start sm:self-auto"
              >
                Update URL
              </Button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.1] shadow-2xl relative">
              <video
                controls
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Client Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {realReviews.length === 0 ? (
              <div className="glass-card p-12 text-center border border-white/[0.06] rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">No reviews yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Reviews and ratings from completed creator productions will appear here.
                </p>
              </div>
            ) : (
              realReviews.map((rev, idx) => (
                <div key={rev._id || idx} className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {rev.reviewerId?.name || rev.client || 'unknown'}
                      </h4>
                      <span className="text-[11px] text-purple-400 font-medium">
                        {rev.projectId?.title || rev.project || 'unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating != null ? rev.rating : 999}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.comment || 'unknown'}"</p>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'unknown'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PLAYABLE VIDEO MODAL PLAYER */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl glass-card rounded-2xl border border-purple-500/30 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0F1422]">
              <div className="min-w-0 pr-3">
                <h4 className="text-sm font-bold text-white truncate">{playingVideo.title}</h4>
                <p className="text-xs text-slate-400 truncate">{playingVideo.category} • Client: {playingVideo.client}</p>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white shrink-0"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card p-5 sm:p-7 rounded-2xl border border-white/[0.1] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-bold text-white">Upload Sample Cut</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add a new video sample to showcase to creators</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewCut} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Tech Hardware Review Cut"
                  value={newCutTitle}
                  onChange={(e) => setNewCutTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Video Style / Category</label>
                <select
                  value={newCutCategory}
                  onChange={(e) => setNewCutCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option>YouTube Longform</option>
                  <option>Short Form (Reels/TikTok)</option>
                  <option>Travel / Cinematic</option>
                  <option>Commercial / Ad</option>
                  <option>Gaming / Stream</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3">
                <Button variant="ghost" onClick={() => setShowUploadModal(false)} className="w-full sm:w-auto">
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
    </div>
  );
};

export default EditorProfile;
