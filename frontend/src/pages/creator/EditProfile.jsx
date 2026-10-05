import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, User, Globe, Video, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const CreatorEditProfile = () => {
  const navigate = useNavigate();
  const { creatorUser } = useAuth();

  const [name, setName] = useState(creatorUser.name);
  const [channel, setChannel] = useState(creatorUser.channel);
  const [email, setEmail] = useState(creatorUser.email);
  const [avatar, setAvatar] = useState(creatorUser.avatar);
  const [bio, setBio] = useState(
    'Tech & SaaS Storyteller focused on AI workflows, consumer hardware, and developer tutorials. Looking for high-retention cinematic video editors.'
  );
  const [category, setCategory] = useState('Tech & Software');
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtube.com/@jasonvance');
  const [twitterUrl, setTwitterUrl] = useState('https://x.com/jasonvance');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/creator/profile');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/creator/profile')}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30">
              Account Settings
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Edit Creator Profile
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <div className="glass-card p-6 border border-white/[0.08] flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/40"
            />
            <button
              type="button"
              onClick={() => {
                const newImg = prompt('Enter image URL for new avatar:', avatar);
                if (newImg) setAvatar(newImg);
              }}
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Profile Photo</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click photo to update URL or upload custom creator avatar.
            </p>
          </div>
        </div>

        {/* Identity Form */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name / Creator Handle
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Channel Name
              </label>
              <input
                type="text"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Bio & Channel Overview
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Primary Channel Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option>Tech & Software</option>
              <option>Lifestyle & Travel</option>
              <option>Business & Finance</option>
              <option>Gaming & Entertainment</option>
              <option>Education & Documentaries</option>
            </select>
          </div>
        </div>

        {/* Social / Channel Links */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <h3 className="text-sm font-bold text-white mb-2">Connected Creator Channels</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Twitter / X Profile</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/creator/profile')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            className="px-6 py-2.5"
          >
            {savedSuccess ? 'Changes Saved ✓' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatorEditProfile;
