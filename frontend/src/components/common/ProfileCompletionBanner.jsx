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
    <div className="relative overflow-hidden rounded-2xl bg-[#F0EDE5] border border-[#E5E0D7] p-3.5 sm:p-4 shadow-sm select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        {/* Left: Progress info & title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular mini progress indicator */}
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#DDD9CE]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3C2415] transition-all duration-500"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-[#3C2415] font-mono">
              {percentage}%
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-[#3C2415] tracking-tight flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#6E7464] shrink-0" />
                Complete your profile
              </h4>
              <span className="text-[10px] font-semibold text-[#55745C] bg-[#EAECE7] px-2 py-0.5 rounded-full border border-[#D5D9CF] shrink-0">
                {completedCount}/{totalCount} Done
              </span>
            </div>
            <p className="text-[11px] text-[#77736D] truncate mt-0.5">
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
                    ? 'bg-[#EAECE7] text-[#55745C] border-[#D5D9CF]'
                    : 'bg-white text-[#77736D] border-[#E5E0D7]'
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#55745C] shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#B8B3A8] shrink-0" />
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3C2415] hover:bg-[#2B1810] text-[#F7F5F0] text-xs font-medium shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Complete</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-[#77736D] hover:text-[#3C2415] hover:bg-black/5 transition-colors cursor-pointer"
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
