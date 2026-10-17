import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Sparkles, X, Camera, Tag, Wrench, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const ProfileCompletionBanner = ({ role = 'creator' }) => {
  const navigate = useNavigate();
  const { currentUser, creatorUser, editorUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Use the relevant role user object
  const user = (role === 'creator' ? (creatorUser || currentUser) : (editorUser || currentUser)) || {};

  // Check PFP: user has an uploaded profileImage or an avatar that is not the default asset
  const hasPfp = Boolean(
    user.profileImage ||
    (user.avatar && user.avatar !== DEFAULT_PFP && !user.avatar.includes('default-avatar'))
  );

  let items = [];

  if (role === 'creator') {
    // Creator: Check ONLY pfp and category (DO NOT check any other fields!)
    const hasCategory = Boolean(user.category && String(user.category).trim());
    items = [
      {
        id: 'pfp',
        label: 'Profile Photo',
        done: hasPfp,
        icon: Camera,
      },
      {
        id: 'category',
        label: 'Channel Category',
        done: hasCategory,
        icon: Tag,
      },
    ];
  } else {
    // Freelancer/Editor: Check ONLY pfp, professional title, and tools (DO NOT check any other fields!)
    const hasTitle = Boolean(
      (user.title && String(user.title).trim()) ||
      (user.professionalTitle && String(user.professionalTitle).trim())
    );
    const hasTools = Boolean(
      (Array.isArray(user.tools) && user.tools.length > 0) ||
      (Array.isArray(user.skills) && user.skills.length > 0)
    );
    items = [
      {
        id: 'pfp',
        label: 'Profile Photo',
        done: hasPfp,
        icon: Camera,
      },
      {
        id: 'title',
        label: 'Professional Title',
        done: hasTitle,
        icon: Briefcase,
      },
      {
        id: 'tools',
        label: 'Software Tools',
        done: hasTools,
        icon: Wrench,
      },
    ];
  }

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // If 100% complete or user clicked dismiss, hide widget
  if (completedCount === totalCount || dismissed) {
    return null;
  }

  const editProfilePath = role === 'creator' ? '/creator/edit-profile' : '/editor/edit-profile';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0F1422] to-indigo-950/30 border border-purple-500/25 p-3.5 sm:p-4 shadow-lg shadow-purple-950/20 animate-fade-in select-none">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        {/* Left: Progress info & title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular mini progress indicator */}
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/[0.08]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-400 transition-all duration-500"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-white font-mono">
              {percentage}%
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                Complete your profile
              </h4>
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/25 shrink-0">
                {completedCount}/{totalCount} Done
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {role === 'creator'
                ? 'Add your photo and category to attract verified talent.'
                : 'Add photo, professional title, and software tools to stand out to creators.'}
            </p>
          </div>
        </div>

        {/* Center: Quick checklist items */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors ${
                  item.done
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.08]'
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>

        {/* Right: Action button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => navigate(editProfilePath)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Complete</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Dismiss reminder"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
